-- MB Intelligence — configuracoes globais editaveis pelo admin (key/value)
-- Primeiro uso: numero de WhatsApp oficial da MB, exibido no portal do cliente
-- e nas telas publicas. Editavel em Admin > Planos/Configuracao.

create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Valor inicial (placeholder ate a MB informar o numero real, so digitos com DDI 55)
insert into public.app_settings (key, value)
values ('whatsapp', '5500000000000')
on conflict (key) do nothing;

-- RLS: o backend acessa via service_role (ignora RLS). Nenhum acesso direto do
-- cliente ao PostgREST — tudo passa pela API. Sem politicas publicas.
alter table public.app_settings enable row level security;
