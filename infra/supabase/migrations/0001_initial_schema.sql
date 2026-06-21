-- MB Intelligence - schema inicial Supabase
-- Banco: PostgreSQL / Supabase

create extension if not exists pgcrypto;

create table if not exists public.plans (
  id text primary key,
  name text not null,
  price numeric(12,2) not null default 0,
  tagline text,
  modules jsonb not null default '[]'::jsonb,
  color text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_name text,
  cnpj text unique,
  city text,
  segment text,
  tax_regime text not null default 'Simples Nacional',
  plan_id text references public.plans(id),
  maturity text not null default 'Onboarding',
  status text not null default 'Onboarding',
  owner_name text,
  email text,
  phone text,
  consultant_name text,
  analyst_name text,
  confidence text not null default 'Baixa',
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  trade_name text,
  cnpj text,
  city text,
  state text,
  tax_regime text not null default 'Simples Nacional',
  main_cnae text,
  secondary_cnaes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  type text not null check (type in ('mb', 'client')),
  name text not null,
  email text not null,
  role text not null,
  status text not null default 'Ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  competence date not null,
  revenue numeric(14,2) not null default 0,
  expenses numeric(14,2) not null default 0,
  result numeric(14,2) generated always as (revenue - expenses) stored,
  cash numeric(14,2) not null default 0,
  margin numeric(8,2) generated always as (
    case when revenue = 0 then 0 else round(((revenue - expenses) / revenue) * 100, 2) end
  ) stored,
  taxes numeric(14,2) not null default 0,
  payroll numeric(14,2) not null default 0,
  financial_score integer not null default 0,
  operational_score integer not null default 0,
  runway_days integer not null default 0,
  investment_capacity numeric(14,2) not null default 0,
  confidence text not null default 'Baixa',
  status text not null default 'Rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, company_id, competence)
);

create table if not exists public.dre_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  competence date not null,
  status text not null default 'Rascunho',
  approved_by uuid references public.user_profiles(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dre_report_lines (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.dre_reports(id) on delete cascade,
  sort_order integer not null default 0,
  account text not null,
  amount numeric(14,2) not null default 0,
  revenue_percent numeric(8,2),
  line_type text not null default 'normal'
);

create table if not exists public.cash_flow_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  competence date not null,
  opening_balance numeric(14,2) not null default 0,
  receipts numeric(14,2) not null default 0,
  payments numeric(14,2) not null default 0,
  taxes numeric(14,2) not null default 0,
  closing_balance numeric(14,2) not null default 0,
  runway_days integer not null default 0,
  status text not null default 'Rascunho',
  approved_by uuid references public.user_profiles(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  competence date,
  category text not null,
  document_type text,
  file_name text not null,
  file_extension text,
  mime_type text,
  file_size bigint,
  storage_bucket text not null default 'mb-documents',
  storage_path text not null,
  status text not null default 'Disponivel',
  visibility text not null default 'Cliente',
  version integer not null default 1,
  uploaded_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  source_type text not null,
  file_name text,
  status text not null default 'Aguardando validação MB',
  owner_id uuid references public.user_profiles(id) on delete set null,
  result text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'Media',
  owner_id uuid references public.user_profiles(id) on delete set null,
  due_date date,
  status text not null default 'Pendente',
  origin text not null default 'MB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  competence date,
  title text not null,
  content text not null,
  source_data jsonb not null default '{}'::jsonb,
  confidence text not null default 'Baixa',
  status text not null default 'Gerado',
  reviewed_by uuid references public.user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  sender_id uuid references public.user_profiles(id) on delete set null,
  sender_label text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete set null,
  user_name text,
  action text not null,
  entity text,
  entity_id text,
  target text,
  result text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_clients_plan_id on public.clients(plan_id);
create index if not exists idx_companies_client_id on public.companies(client_id);
create index if not exists idx_user_profiles_client_id on public.user_profiles(client_id);
create index if not exists idx_documents_client_id on public.documents(client_id);
create index if not exists idx_documents_storage_path on public.documents(storage_path);
create index if not exists idx_import_jobs_client_id on public.import_jobs(client_id);
create index if not exists idx_financial_snapshots_client_competence on public.financial_snapshots(client_id, competence);
create index if not exists idx_tasks_client_id on public.tasks(client_id);
create index if not exists idx_ai_insights_client_id on public.ai_insights(client_id);
create index if not exists idx_messages_client_id on public.messages(client_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

insert into public.plans (id, name, price, tagline, modules, color)
values
  ('contabilidade', 'Contabilidade', 800, 'Organização contábil, documentos e guias em um só lugar.', '["Documentos","Guias","DAS","Pendências","Avisos"]'::jsonb, 'status-warning'),
  ('financeiro', 'Financeiro IA', 1200, 'Dashboards, faturamento, folha, fiscal e análises automáticas.', '["Documentos","Fiscal","Folha","Faturamento","IA básica","Relatórios simples"]'::jsonb, 'status-ok'),
  ('cfo', 'CFO as a Service', 2000, 'Análise executiva, DRE, caixa, score e apoio consultivo.', '["Todos os módulos","DRE","Fluxo de caixa","Score","Parecer MB","Reuniões CFO"]'::jsonb, 'status-danger')
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  tagline = excluded.tagline,
  modules = excluded.modules,
  color = excluded.color,
  updated_at = now();
