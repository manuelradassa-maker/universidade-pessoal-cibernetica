# Universidade Pessoal Cibernética

Autenticação por username/password com Supabase Auth, cargos `admin`, `partner` e `student`, isolamento através de RLS e portfólios públicos de admins. Não existe login social. O email sintético `<username>@internal.local` é usado apenas na chamada interna a Supabase Auth; a interface pede exclusivamente username e password.

## Configuração do Supabase

1. Crie um projeto Supabase e instale a Supabase CLI.
2. Ligue este repositório ao projeto e aplique o schema/RLS:

   ```powershell
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   supabase db push
   ```

   No Dashboard Supabase, em **Authentication → Sign In / Providers**, desative todos os providers sociais e mantenha Email habilitado para as chamadas internas de Supabase Auth. Desative também o signup público; os utilizadores são criados apenas pela Edge Function. `supabase/config.toml` desativa Google e signup no ambiente local.

3. Configure secrets no projeto. `APP_ORIGIN` tem de ser exatamente a origem do frontend em uso; para o GitHub Pages use a origem indicada abaixo e, para desenvolvimento local, use `http://localhost:5173`. Para reproduzir o requisito, a senha partilhada inicial é `1945`; é fraca para exposição pública, por isso substitua-a por uma senha longa antes de produção. Estes secrets nunca são `VITE_` e nunca são enviados ao browser.

   ```powershell
   supabase secrets set ADMIN_SHARED_PASSWORD="1945" ADMIN_BOOTSTRAP_SECRET="gere-um-segredo-aleatorio-longo" APP_ORIGIN="https://manuelradassa-maker.github.io"
   ```

4. Publique as Edge Functions:

   ```powershell
   supabase functions deploy auth-accounts
   supabase functions deploy bootstrap-admin
   ```

5. Crie o primeiro admin uma única vez. Use o mesmo `ADMIN_BOOTSTRAP_SECRET` configurado nos secrets:

   ```powershell
   $headers = @{ "x-bootstrap-secret" = "O_SEU_ADMIN_BOOTSTRAP_SECRET"; "apikey" = "SUPABASE_ANON_KEY" }
   Invoke-RestMethod -Method Post -Uri "https://SEU_PROJECT_REF.supabase.co/functions/v1/bootstrap-admin" -Headers $headers -ContentType "application/json" -Body '{"username":"admin"}'
   ```

   O endpoint recusa novas chamadas assim que o bootstrap inicial é utilizado; uma trava atómica no banco impede chamadas concorrentes. A senha do primeiro admin é `ADMIN_SHARED_PASSWORD`. Outros admins podem ser provisionados operacionalmente e usam a mesma senha partilhada.

## Frontend

Copie `.env.example` para `.env.local` e defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. A anon/publishable key é pública e protegida pelas policies; nunca coloque a `service_role` key, `ADMIN_SHARED_PASSWORD` ou `ADMIN_BOOTSTRAP_SECRET` em variáveis `VITE_`.

Para GitHub Pages não defines nada à mão: `.github/workflows/deploy-pages.yml` faz o build com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` lidos dos secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY` do repositório e publica `dist` no branch `gh-pages` a cada push em `main`. Os projetos Vite estáticos não leem variáveis do servidor em runtime, por isso um build sem estas variáveis mostra apenas "Supabase não está configurado" — o workflow verifica o bundle antes de publicar. `public/404.html` preserva rotas diretas como `/portfolio/username` no Pages, devolvendo nesse caminho um estatuto HTTP 404. Detalhe e procedimentos de rollback em `docs/DEPLOY.md`.

## Regras implementadas

- `users.role` aceita apenas `admin`, `partner` e `student`; username é único sem distinção de maiúsculas/minúsculas. A senha/hash é gerida apenas pelo Supabase Auth.
- Bootstrap cria exatamente um admin. Admins partilham a senha do secret e login tem rate limit por username e IP: cinco erros consecutivos bloqueiam durante 15 minutos.
- Admin cria partner/student, publica vídeos, cria empresas aprovadas e gere empresas dos partners que criou, incluindo estudantes ligados a esses partners.
- Partner cria pedidos de empresa pendentes e só adiciona estudantes a uma empresa própria aprovada. Triggers/RLS rejeitam tentativas de aprovar diretamente.
- Student só pode ler vídeos gerais destinados a staff ou vídeos da empresa aprovada a que está ligado; não pode inserir registos.
- Portfólio é público para leitura. Só o próprio admin o altera; uploads são escritos numa pasta Storage associada ao seu UUID.
- Senhas geradas para partner/student têm 16 caracteres, nunca são persistidas pela aplicação em texto simples e aparecem no painel criador uma vez, com ocultação manual e expiração visual em 60 segundos.

## Verificação local

```powershell
npm install
npm run build
npm run dev
```

A migração e as Edge Functions precisam ser aplicadas/deployadas no projeto Supabase para autenticação e operações funcionarem. Sem as variáveis públicas do projeto, a tela de login indica a configuração em falta.
