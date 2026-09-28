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
colocar `service_role` nem `ADMIN_BOOTSTRAP_SECRET` em
variáveis `VITE_` — o bundle é público.

Perfis partilhados usam agora a Edge Function `public-profile`, que devolve HTML com metadados Open Graph em HTTP 200. O botao nessa pagina abre a versao interativa no GitHub Pages. A rota SPA antiga `/u/<username>` continua sujeita ao fallback HTTP 404 do Pages quando aberta diretamente.

## Backend (Supabase)

Aplica as migracoes pendentes com `supabase db push --linked --yes`. Se a CLI falhar a ligacao como `temp role`, usa a palavra-passe remota do Postgres pela variavel `SUPABASE_DB_PASSWORD`. No PowerShell, o bloco seguinte pede-a sem a mostrar, executa a migracao e limpa a variavel no fim:

```powershell
$dbPasswordSecure = Read-Host "Supabase database password" -AsSecureString
$dbPasswordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPasswordSecure)
try {
  $env:SUPABASE_DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($dbPasswordPtr)
  supabase db push --linked --yes
} finally {
  Remove-Item Env:SUPABASE_DB_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($dbPasswordPtr)
}
```

Se continuar a dar `Connection timed out`, verifica as restricoes de rede/IP do projeto e se a rede permite saida TCP para o pooler na porta 5432; tenta uma rede diferente se necessario. As migracoes criam a sincronizacao privada e as tabelas publicas da comunidade; desativam o portfolio administrativo antigo sem apagar as linhas guardadas.

Publica as Edge Functions:

```powershell
supabase functions deploy auth-accounts
supabase functions deploy bootstrap-admin
supabase functions deploy mentor-chat
supabase functions deploy public-profile
```

Depois de publicar as alterações à aplicação, aplica também a migração
`202609270009_unified_access_and_groups.sql` e volta a publicar
`auth-accounts`. A migração mantém os cargos antigos apenas nos registos para
compatibilidade, deixa de os usar para separar o acesso, cria as tabelas de
grupos e reforça a unicidade dos nomes. O registo passa a usar email e
palavra-passe individuais; os códigos de acesso antigos deixam de aceitar
registos. Empresas pendentes
passam a aprovadas porque já não existe aprovação por cargo.

Os novos grupos permitem adicionar nomes de utilizador existentes e empresas.
Todos os membros autenticados podem criar grupos e empresas, publicar vídeos e
usar as mesmas áreas da plataforma. Uploads de vídeo até 100 MB ficam no bucket
público `public-videos`; marca uma publicação como curta para a incluir em
Shorts e no perfil público. As senhas continuam privadas e individuais.

O registo por email cria a conta no Supabase Auth e o trigger da migraÃ§Ã£o
`202609280001_email_registration.sql` cria o perfil com nome de utilizador
Ãºnico. Confirma que Email signups estÃ¡ ativo nas definiÃ§Ãµes de autenticaÃ§Ã£o do
projeto Supabase e que o URL do GitHub Pages estÃ¡ autorizado como URL de
redirecionamento para confirmaÃ§Ã£o de email.

Configura a chave OpenRouter apenas como secret do servidor Supabase:

```powershell
supabase secrets set OPENROUTER_API_KEY="a-tua-chave" OPENROUTER_MODEL="openrouter/free"
```

A chave OpenRouter deve ficar apenas nos secrets do Supabase; nunca uses `VITE_OPENROUTER_API_KEY`. A funcao `mentor-chat` usa o endpoint Chat Completions compativel com OpenAI e, por omissao, o router gratuito `openrouter/free`. Os pedidos exigem fornecedores elegiveis a ZDR e sem recolha de dados, e as migracoes sao necessarias para ler o perfil privado de aprendizagem.
