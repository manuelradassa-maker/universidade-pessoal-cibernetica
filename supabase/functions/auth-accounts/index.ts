import { serviceClient, json, corsHeaders, syntheticEmail, hashRateKey, randomPassword, getCaller, anonClient } from '../_shared/http.ts';

const usernamePattern = /^[a-zA-Z0-9_.-]{3,32}$/;
const accessCodePattern = /^[A-Z0-9-]{6,32}$/i;
const normalizeAccessCode = (value: string) => String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const service = serviceClient();
  const recordAttempts = async (keys: string[], success: boolean) => {
    const results = await Promise.all(keys.map((p_key_hash) => service.rpc('record_login_attempt', { p_key_hash, p_success: success })));
    const failed = results.find((result) => result.error);
    if (failed?.error) throw new Error(`record_login_attempt: ${failed.error.message}`);
  };
  try {
    const body = await request.json();
    const action = String(body.action ?? '');

    // Redeem an access code. Public endpoint (no session yet): the code is the
    // credential. The recipient picks their own username and password, so the
    // admin never sees the password.
    if (action === 'redeem-code') {
      const code = normalizeAccessCode(String(body.code ?? ''));
      const username = String(body.username ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');

      if (!accessCodePattern.test(code)) return json({ error: 'Código inválido.' }, 400);
      if (!usernamePattern.test(username)) return json({ error: 'Username inválido.' }, 400);
      if (password.length < 8) return json({ error: 'A senha precisa de pelo menos 8 caracteres.' }, 400);

      // Rate-limit by code and by IP, reusing the login rate-limit helpers.
      // Without this, an attacker could brute-force short codes.
      const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const keys = await Promise.all([hashRateKey(`code:${code}`), hashRateKey(`ip:${ip}`)]);
      for (const key of keys) {
        const { data: allowed, error: limitError } = await service.rpc('check_login_rate_limit', { p_key_hash: key });
        if (limitError) throw new Error(`check_login_rate_limit: ${limitError.message}`);
        if (!allowed) return json({ error: 'Demasiadas tentativas. Tente novamente dentro de 15 minutos.' }, 429);
      }

      // Compare case-insensitively: codes may have been created before the
      // uppercase normalisation on insert, and the input is uppercased above.
      const { data: invite } = await service
        .from('invite_codes').select('id, code, role, company_id, created_by, revoked_at')
        .ilike('code', code).is('revoked_at', null).maybeSingle();
      if (!invite) {
        await recordAttempts(keys, false);
        return json({ error: 'Código inválido, expirado ou revogado.' }, 400);
      }

      // Admins created through a code keep the password they choose: only the
      // bootstrap admin shares ADMIN_SHARED_PASSWORD, and the login flow
      // honours that distinction via `created_by`.
      // A student code must still point at an approved company at signup time.
      if (invite.role === 'student') {
        const { data: company } = await service
          .from('companies').select('id, status').eq('id', invite.company_id).single();
        if (!company || company.status !== 'approved') {
          await recordAttempts(keys, false);
          return json({ error: 'A empresa deste código já não está aprovada.' }, 400);
        }
      }

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email: syntheticEmail(username), password, email_confirm: true,
        user_metadata: { username },
      });
      if (createError || !created.user) {
        await recordAttempts(keys, false);
        return json({ error: createError?.message ?? 'Não foi possível criar a conta.' }, 400);
      }

      const { error: profileError } = await service.from('users').insert({
        id: created.user.id, username, role: invite.role,
        // Attribute the account to whoever minted the code. `created_by`
        // being non-null is also how login tells a code-created admin apart
        // from the bootstrap admin, so this field is load-bearing.
        created_by: invite.created_by, status: 'active',
      });
      if (profileError) {
        await service.auth.admin.deleteUser(created.user.id);
        await recordAttempts(keys, false);
        return json({ error: profileError.code === '23505' ? 'Este username já está em uso.' : profileError.message }, 400);
      }

      if (invite.role === 'student') {
        const { error: linkError } = await service.from('students').insert({
          user_id: created.user.id, company_id: invite.company_id, added_by: created.user.id,
        });
        if (linkError) {
          await service.from('users').delete().eq('id', created.user.id);
          await service.auth.admin.deleteUser(created.user.id);
          await recordAttempts(keys, false);
          return json({ error: linkError.message }, 400);
        }
      }

      // Count the use for visibility, but never invalidate: codes are reusable.
      // `uses = uses + 1` is not expressible through PostgREST, so re-read and
      // update; concurrent signups may undercount by one, which is fine for an
      // informational counter.
      const { data: current } = await service
        .from('invite_codes').select('use_count').eq('id', invite.id).single();
      await service.from('invite_codes')
        .update({ use_count: (current?.use_count ?? 0) + 1 }).eq('id', invite.id);
      await recordAttempts(keys, true);

      const { data: session, error: signInError } = await anonClient().auth.signInWithPassword({
        email: syntheticEmail(username), password,
      });
      if (signInError || !session.session) {
        return json({ error: 'Conta criada, mas não foi possível iniciar sessão. Tente entrar.' }, 400);
      }
      return json({ session: session.session, user: { username, role: invite.role, status: 'active' } }, 201);
    }

    if (action === 'login') {
      const username = String(body.username ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      if (!usernamePattern.test(username) || !password) return json({ error: 'Username ou password inválidos.' }, 400);

      const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const keys = await Promise.all([hashRateKey(`username:${username.toLowerCase()}`), hashRateKey(`ip:${ip}`)]);
      for (const key of keys) {
        const { data: allowed, error: limitError } = await service.rpc('check_login_rate_limit', { p_key_hash: key });
        if (limitError) throw new Error(`check_login_rate_limit: ${limitError.message}`);
        if (!allowed) return json({ error: 'Demasiadas tentativas. Tente novamente dentro de 15 minutos.' }, 429);
      }

      const { data: account } = await service.from('users')
        .select('id, username, role, status, created_by').eq('username', username.toLowerCase()).maybeSingle();
      if (!account || account.status !== 'active') {
        await recordAttempts(keys, false);
        return json({ error: 'Credenciais inválidas.' }, 401);
      }

      if (account.role === 'admin') {
        // The bootstrap admin keeps sharing ADMIN_SHARED_PASSWORD. Admins
        // created later have their own password, so the shared password must
        // not overwrite theirs on every login. `created_by` is null only for
        // the bootstrap admin.
        const isBootstrapAdmin = account.created_by === null;
        if (isBootstrapAdmin) {
          const sharedPassword = Deno.env.get('ADMIN_SHARED_PASSWORD');
          if (!sharedPassword || password !== sharedPassword) {
            await recordAttempts(keys, false);
            return json({ error: 'Credenciais inválidas.' }, 401);
          }
          const { error: resetError } = await service.auth.admin.updateUserById(account.id, { password: sharedPassword });
          if (resetError) throw new Error(`reset-admin-password: ${resetError.message}`);
        }
      }

      // Sign in as the end user, NOT as service_role: a service_role client is
      // not a valid credential for the password grant and makes signIn fail.
      const { data: session, error: loginError } = await anonClient().auth.signInWithPassword({
        email: syntheticEmail(account.username), password,
      });
      if (loginError || !session.session) {
        await recordAttempts(keys, false);
        return json({ error: 'Credenciais inválidas.' }, 401);
      }
      await recordAttempts(keys, true);
      return json({ session: session.session, user: account });
    }

    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'Autenticação obrigatória.' }, 401);
    const { caller, db } = await getCaller(authorization);

    // Access-code management. Both admins and partners may mint codes, but only
    // for companies they actually manage (checked per action below).
    if (action === 'list-codes') {
      const { data: codes, error: listError } = await service
        .from('invite_codes').select('id, code, role, company_id, label, use_count, revoked_at, created_at')
        .order('created_at', { ascending: false }).limit(100);
      if (listError) throw new Error(`list-codes: ${listError.message}`);
      return json({ codes: codes ?? [] });
    }

    if (action === 'create-code') {
      const role = String(body.role ?? '');
      const companyId = body.company_id ? String(body.company_id) : null;
      const label = body.label ? String(body.label).slice(0, 80) : null;
      if (!['partner', 'student', 'admin'].includes(role)) return json({ error: 'Role inválido.' }, 400);
      // Only an admin may mint admin codes: minting admin access must stay a
      // decision taken by someone who already holds it.
      const roleAllowed = (caller.role === 'admin')
        || (caller.role === 'partner' && role === 'student');
      if (!roleAllowed) return json({ error: 'Não tem permissão para criar códigos para esta função.' }, 403);
      if (role === 'student' && !companyId) {
        return json({ error: 'É obrigatório escolher uma empresa aprovada.' }, 400);
      }

      if (companyId) {
        const { data: company } = await service
          .from('companies').select('id, owner_id, status').eq('id', companyId).single();
        const manages = company && company.status === 'approved' && company.owner_id === caller.id;
        if (!manages) return json({ error: 'Empresa inválida ou sem permissão.' }, 403);
      }

      // Reuse an existing active code for the same role/company when one
      // exists, so a reusable code does not multiply on every click. NULL
      // company_id must use `is`, not `eq`: PostgREST never matches NULL
      // with `eq`, which would silently break reuse for admin/partner codes.
      let reusableQuery = service
        .from('invite_codes').select('id, code')
        .eq('role', role).is('revoked_at', null);
      reusableQuery = companyId
        ? reusableQuery.eq('company_id', companyId)
        : reusableQuery.is('company_id', null);
      const { data: reusable } = await reusableQuery
        .order('created_at', { ascending: true }).limit(1).maybeSingle();
      if (reusable) return json({ code: reusable.code, reused: true }, 200);

      const { data: created, error: createError } = await service
        .from('invite_codes')
        .insert({
          code: randomPassword().toUpperCase(),
          role, company_id: companyId, label, created_by: caller.id,
        })
        .select('code').single();
      if (createError) throw new Error(`create-code: ${createError.message}`);
      return json({ code: created.code, reused: false }, 201);
    }

    if (action === 'revoke-code') {
      const code = normalizeAccessCode(String(body.code ?? ''));
      const { data: target } = await service
        .from('invite_codes').select('id, code, created_by').ilike('code', code).maybeSingle();
      if (!target) return json({ error: 'Código não encontrado.' }, 404);
      // Admins may revoke any code; partners only the ones they created.
      if (caller.role !== 'admin' && target.created_by !== caller.id) {
        return json({ error: 'Não tem permissão para revogar este código.' }, 403);
      }
      const { error: revokeError } = await service
        .from('invite_codes').update({ revoked_at: new Date().toISOString() }).eq('id', target.id);
      if (revokeError) throw new Error(`revoke-code: ${revokeError.message}`);
      return json({ code: target.code, revoked: true });
    }

    if (action === 'create-account') {
      const username = String(body.username ?? '').trim().toLowerCase();
      const role = String(body.role ?? '');
      const companyId = body.company_id ? String(body.company_id) : null;
      if (!usernamePattern.test(username)) return json({ error: 'Username: 3 a 32 caracteres (letras, números, ponto, hífen e underscore).' }, 400);
      const roleAllowed = (caller.role === 'admin' && ['partner', 'student'].includes(role))
        || (caller.role === 'partner' && role === 'student');
      if (!roleAllowed) return json({ error: 'Não tem permissão para criar esta função.' }, 403);

      if (role === 'student') {
        if (!companyId) return json({ error: 'É obrigatório escolher uma empresa aprovada.' }, 400);
        const { data: company } = await service.from('companies').select('id, owner_id, status').eq('id', companyId).single();
        const managesCompany = company && company.status === 'approved' && (
          (caller.role === 'partner' && company.owner_id === caller.id)
          || (caller.role === 'admin' && company.owner_id === caller.id)
        );
        if (!managesCompany) return json({ error: 'Empresa inválida ou sem permissão.' }, 403);
      }

      const password = randomPassword();
      const { data: created, error: createError } = await service.auth.admin.createUser({
        email: syntheticEmail(username), password, email_confirm: true,
        user_metadata: { username },
      });
      if (createError || !created.user) return json({ error: createError?.message ?? 'Não foi possível criar a conta.' }, 400);

      const { error: profileError } = await service.from('users').insert({
        id: created.user.id, username, role, created_by: caller.id, status: 'active',
      });
      if (profileError) {
        await service.auth.admin.deleteUser(created.user.id);
        return json({ error: profileError.code === '23505' ? 'Este username já está em uso.' : profileError.message }, 400);
      }

      if (role === 'student' && companyId) {
        const { error: linkError } = await db.from('students').insert({
          user_id: created.user.id, company_id: companyId, added_by: caller.id,
        });
        if (linkError) {
          await service.from('users').delete().eq('id', created.user.id);
          await service.auth.admin.deleteUser(created.user.id);
          return json({ error: linkError.message }, 400);
        }
      }
      return json({ username, password, role });
    }

    if (action === 'reset-password') {
      const targetId = String(body.user_id ?? '');
      const { data: target } = await service.from('users').select('id, role, created_by').eq('id', targetId).single();
      if (!target) return json({ error: 'Conta não encontrada.' }, 404);
      let allowed = false;
      if (caller.role === 'admin' && target.role !== 'admin') {
        const { data: managesUser, error: permissionError } = await db.rpc('admin_manages_user', { target_id: targetId });
        if (permissionError) throw permissionError;
        allowed = Boolean(managesUser);
      }
      if (caller.role === 'partner' && target.role === 'student') {
        const { data: link } = await service.from('students').select('company_id').eq('user_id', targetId).eq('added_by', caller.id).maybeSingle();
        allowed = Boolean(link);
      }
      if (!allowed) return json({ error: 'Não tem permissão para repor esta senha.' }, 403);
      const password = randomPassword();
      const { error } = await service.auth.admin.updateUserById(targetId, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ password });
    }

    return json({ error: 'Ação desconhecida.' }, 400);
  } catch (error) {
    console.error('auth-accounts error', error instanceof Error ? error.message : JSON.stringify(error));
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 400);
  }
});
