-- Estado de aprendizagem por utilizador (P1: sair do localStorage).
-- Uma linha por conta; RLS restringe à própria linha através do JWT, pelo que a
-- anon key publicada no bundle não consegue ler nem escrever alheio. O service_role
-- continua a ser o único caminho fora desta tabela (não é concedido aqui).
--
-- `phase` faz parte do registo: omiti-lo faria a hidratação repor um aluno na Fase 1
-- e apagar o progresso de fase em qualquer dispositivo. `saved_at` é gerado pelo
-- cliente que escreveu: a comparação local vs remoto usa o mesmo relógio, não o do
-- servidor, para não decidir com base em skew de clocks alheios.

create table if not exists public.learner_state (
  user_id uuid primary key references public.users (id) on delete cascade,
  profile jsonb not null,
  pillars jsonb not null default '[]'::jsonb,
  active_bottleneck text,
  phase jsonb,
  reviews jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_state enable row level security;

drop policy if exists learner_state_own_row on public.learner_state;
create policy learner_state_own_row on public.learner_state
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.learner_state to authenticated;
