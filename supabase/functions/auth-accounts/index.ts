import { serviceClient, json, corsHeaders, syntheticEmail, hashRateKey, randomPassword, getCaller, anonClient } from '../_shared/http.ts';

const usernamePattern = /^[a-zA-Z0-9_.-]{3,32}$/;

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

    if (action === 'change-password') {
      const currentPassword = String(body.current_password ?? '');
      const newPassword = String(body.new_password ?? '');
      if (newPassword.length < 8) return json({ error: 'A nova senha precisa de pelo menos 8 caracteres.' }, 400);
      const { error: verifyError } = await anonClient().auth.signInWithPassword({
        email: syntheticEmail(caller.username), password: currentPassword,
      });
      if (verifyError) return json({ error: 'A senha atual está incorreta.' }, 401);
      const { error: updateError } = await service.auth.admin.updateUserById(caller.id, { password: newPassword });
      if (updateError) return json({ error: updateError.message }, 400);
      return json({ success: true });
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
