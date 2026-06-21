-- MB Intelligence — rate limiting persistente para ambiente serverless
-- Substitui o Map em memória que não funciona entre invocações Vercel

create table if not exists public.login_rate_limits (
  key        text primary key,            -- "ip:email" normalizado
  count      integer not null default 0,
  reset_at   timestamptz not null,
  updated_at timestamptz not null default now()
);

-- Limpar registros antigos automaticamente (não há cron no Supabase free tier,
-- então fazemos limpeza lazy via trigger ou deixamos a própria query ignorar expirados)
create index if not exists idx_login_rate_limits_reset_at on public.login_rate_limits(reset_at);

-- RLS: tabela de uso interno apenas — nenhum usuário acessa diretamente
alter table public.login_rate_limits enable row level security;
-- Sem políticas públicas: apenas o service_role (backend) pode ler/escrever
