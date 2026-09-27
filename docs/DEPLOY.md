# Deploy

## Frontend (GitHub Pages)

O site estático é publicado no branch `gh-pages`, que é a fonte configurada no
GitHub Pages (`build_type: legacy`, path `/`). A única via de publicação é
`.github/workflows/deploy-pages.yml`:

1. `push` em `main` (ou `workflow_dispatch` manual) faz `npm ci` e `npm run build`.
2. O build recebe `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` a partir dos
   secrets do repositório `SUPABASE_URL` e `SUPABASE_ANON_KEY` — os mesmos que
   `keep-alive.yml` usa. Não há mais secrets a criar.
3. `dist/` é verificado antes de ser publicado: o bundle tem de conter o URL do
   Supabase, a mensagem `Supabase não está configurado` (prova de que o painel
   autenticado foi incluído) e a string `Minha Jornada`; `dist/404.html` tem de
   existir. Se falhar, o workflow aborta em vez de publicar.
4. `dist/` vai para `gh-pages` com `force_orphan: true` (um commit limpo por deploy).

Não fazer `push` manual de `dist/` para `gh-pages`. Foi isso que deixou o domínio a
servir um bundle antigo, sem o painel de aprendizagem, enquanto `main` já tinha o
código. Verificar o que está no ar: abrir `https://manuelradassa-maker.github.io/universidade-pessoal-cibernetica/`,
ver no `index.html` o hash do ficheiro em `assets/index-*.js` e compará-lo com o
`dist` do último run verde em **Actions → Deploy Pages**. Para republicar sem novo
commit: `gh workflow run deploy-pages.yml`, ou o badge `Run workflow` na mesma página.

Voltar atrás num deploy: correr `gh workflow run deploy-pages.yml --ref <sha>` com o
commit bom, ou `gh run rerun <id>` de um run anterior bem-sucedido.

Variáveis `VITE_` são substituídas em tempo de **build**, não em runtime: um build
sem `.env` produz um site que mostra apenas "Supabase não está configurado". Nunca
colocar `service_role`, `ADMIN_SHARED_PASSWORD` nem `ADMIN_BOOTSTRAP_SECRET` em
variáveis `VITE_` — o bundle é público.

Custo do fallback de rotas: `public/404.html` redirecciona para
`?__redirect=<path>`, o que faz `/portfolio/username` funcionar no browser, mas o
GitHub Pages devolve sempre **HTTP 404** nesse caminho. Links partilhados e
pré-visualizações sociais veem um 404. Só se resolve com um host que faça rewrite a
verdadeiro (Vercel/Netlify) e `base` ajustado em `vite.config.ts`.

## Backend (Supabase)

Schema e RLS aplicados pela Migration API ou `supabase db push`; as migrations são
append-only, nunca editadas depois de aplicadas. Edge Functions com
`supabase functions deploy auth-accounts` e `supabase functions deploy bootstrap-admin`.
Secrets do servidor (`ADMIN_SHARED_PASSWORD`, `ADMIN_BOOTSTRAP_SECRET`, `APP_ORIGIN`)
definidos com `supabase secrets set`; `APP_ORIGIN` tem de ser exatamente a origem do
frontend em uso.
