import { corsHeaders, json, serviceClient, syntheticEmail } from '../_shared/http.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const expectedSecret = Deno.env.get('ADMIN_BOOTSTRAP_SECRET');
  if (!expectedSecret || request.headers.get('x-bootstrap-secret') !== expectedSecret) {
    return json({ error: 'Não autorizado.' }, 401);
  }

  const service = serviceClient();
  let claimed = false;
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim().toLowerCase();
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) return json({ error: 'Username inválido.' }, 400);
    const password = String(body.password ?? '');
    if (password.length < 8) return json({ error: 'A senha pessoal deve ter pelo menos 8 caracteres.' }, 400);
    const { data: claim, error: claimError } = await service.rpc('claim_initial_admin_bootstrap');
    if (claimError) throw claimError;
    if (!claim) return json({ error: 'O bootstrap inicial já foi utilizado ou já existe um admin.' }, 409);
    claimed = true;
    const { data, error } = await service.auth.admin.createUser({
      email: syntheticEmail(username), password, email_confirm: true, user_metadata: { username },
    });
    if (error || !data.user) {
      await service.rpc('release_initial_admin_bootstrap');
      return json({ error: error?.message ?? 'Não foi possível criar o admin.' }, 400);
    }
    const { error: profileError } = await service.from('users').insert({
      id: data.user.id, username, role: 'admin', created_by: null, status: 'active',
    });
    if (profileError) {
      await service.auth.admin.deleteUser(data.user.id);
      await service.rpc('release_initial_admin_bootstrap');
      return json({ error: profileError.message }, 400);
    }
    return json({ username, role: 'admin', message: 'Admin inicial criado.' }, 201);
  } catch (error) {
    if (claimed) await service.rpc('release_initial_admin_bootstrap');
    return json({ error: error instanceof Error ? error.message : 'Erro interno.' }, 400);
  }
});
