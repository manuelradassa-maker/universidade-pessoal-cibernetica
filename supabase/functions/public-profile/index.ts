import { serviceClient } from '../_shared/http.ts';

const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]!));

const publicImage = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch { return ''; }
};

const html = (body: string, status = 200) => new Response(body, {
  status,
  headers: {
    'Cache-Control': 'public, max-age=60, s-maxage=60',
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  },
});

const errorPage = (title: string, description: string, status: number) => html(`<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><a href="https://manuelradassa-maker.github.io/universidade-pessoal-cibernetica/">Abrir Universidade Pessoal Cibernética</a></main></body></html>`, status);

Deno.serve(async (request) => {
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
  const username = new URL(request.url).searchParams.get('username')?.trim() ?? '';
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) return errorPage('Perfil inválido', 'O nome de utilizador não é válido.', 400);

  try {
    const client = serviceClient();
    const { data: profile, error: profileError } = await client.from('community_profiles')
      .select('user_id,username,display_name,bio,avatar_url').eq('username', username).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return errorPage('Perfil não encontrado', 'Este perfil público não existe.', 404);

    const { data: posts, error: postsError } = await client.from('community_posts')
      .select('title,content,pillar,evidence_type,evidence_proof,created_at')
      .eq('author_id', profile.user_id)
      .order('created_at', { ascending: false }).limit(30);
    if (postsError) throw postsError;

    const appUrl = `https://manuelradassa-maker.github.io/universidade-pessoal-cibernetica/u/${encodeURIComponent(username)}`;
    const displayName = escapeHtml(profile.display_name || profile.username);
    const handle = escapeHtml(profile.username);
    const bio = escapeHtml(profile.bio || 'Publicações e projetos partilhados na Universidade Pessoal Cibernética.');
    const title = `${profile.display_name || profile.username} — Perfil de criador`;
    const description = (profile.bio || `Publicações de ${profile.display_name || profile.username} na Universidade Pessoal Cibernética.`).slice(0, 300);
    const image = publicImage(profile.avatar_url);
    const cards = (posts ?? []).map((post) => `<article><p class="meta">${escapeHtml(post.pillar)} · ${escapeHtml(post.evidence_type)} · ${new Date(post.created_at).toLocaleDateString('pt-PT')}</p><h2>${escapeHtml(post.title)}</h2><p class="body">${escapeHtml(post.content)}</p><aside><strong>Evidência declarada</strong><p>${escapeHtml(post.evidence_proof)}</p></aside></article>`).join('');
    const content = `<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="profile"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(request.url)}"><meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">${image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:image" content="${escapeHtml(image)}">` : ''}<meta property="profile:username" content="${handle}"><link rel="canonical" href="${escapeHtml(request.url)}"><style>*{box-sizing:border-box}body{margin:0;background:#09090d;color:#f4f4f5;font:16px/1.6 Inter,ui-sans-serif,system-ui,sans-serif}.wrap{max-width:800px;margin:auto;padding:40px 20px}.profile,article{border:1px solid #27272a;border-radius:22px;background:#111116;padding:24px;margin-bottom:18px}.brand,.meta{color:#f87171;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.name{font-size:32px;margin:8px 0 0}.handle{color:#71717a;margin:0}.bio{margin-top:18px;color:#d4d4d8;white-space:pre-wrap}.body{white-space:pre-wrap;color:#d4d4d8}aside{border-left:2px solid #059669;background:#052e2222;padding:12px 16px;color:#d4d4d8}aside strong{font-size:11px;color:#34d399;text-transform:uppercase}.cta{display:inline-block;background:#b91c1c;color:white;text-decoration:none;padding:10px 16px;border-radius:12px;margin-top:18px}.empty{color:#a1a1aa}</style></head><body><main class="wrap"><header class="profile">${image ? `<img src="${escapeHtml(image)}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover">` : ''}<p class="brand">Perfil de criador</p><h1 class="name">${displayName}</h1><p class="handle">@${handle}</p><p class="bio">${bio}</p><a class="cta" href="${escapeHtml(appUrl)}">Abrir perfil na aplicação</a></header><section>${cards || '<p class="empty">Ainda não há publicações neste perfil.</p>'}</section></main></body></html>`;
    return html(content);
  } catch (error) {
    console.error('public-profile lookup failed', error instanceof Error ? error.message : 'unknown error');
    return errorPage('Perfil temporariamente indisponível', 'Não foi possível carregar este perfil agora.', 503);
  }
});
