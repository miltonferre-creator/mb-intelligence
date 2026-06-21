-- MB Intelligence - RLS e Storage Supabase
-- Referência: tabelas expostas no schema public devem usar RLS.

alter table public.plans enable row level security;
alter table public.clients enable row level security;
alter table public.companies enable row level security;
alter table public.user_profiles enable row level security;
alter table public.financial_snapshots enable row level security;
alter table public.dre_reports enable row level security;
alter table public.dre_report_lines enable row level security;
alter table public.cash_flow_reports enable row level security;
alter table public.documents enable row level security;
alter table public.import_jobs enable row level security;
alter table public.tasks enable row level security;
alter table public.ai_insights enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;

-- Perfil do usuário autenticado.
create or replace function public.current_profile()
returns public.user_profiles
language sql
security definer
set search_path = public
stable
as $$
  select *
  from public.user_profiles
  where id = auth.uid()
  limit 1;
$$;

create or replace function public.is_mb_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and type = 'mb'
      and status = 'Ativo'
  );
$$;

create or replace function public.can_access_client(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and status = 'Ativo'
      and (
        type = 'mb'
        or client_id = target_client_id
      )
  );
$$;

create policy "Plans visible to authenticated users"
on public.plans
for select
to authenticated
using (true);

create policy "MB can manage plans"
on public.plans
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Client scoped read"
on public.clients
for select
to authenticated
using (public.can_access_client(id));

create policy "MB can manage clients"
on public.clients
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Company scoped read"
on public.companies
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage companies"
on public.companies
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Users can read own profile or MB can read all"
on public.user_profiles
for select
to authenticated
using (id = auth.uid() or public.is_mb_user());

create policy "MB can manage user profiles"
on public.user_profiles
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Financial scoped read"
on public.financial_snapshots
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage financial snapshots"
on public.financial_snapshots
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "DRE scoped read"
on public.dre_reports
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage DRE reports"
on public.dre_reports
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "DRE lines scoped read"
on public.dre_report_lines
for select
to authenticated
using (
  exists (
    select 1 from public.dre_reports r
    where r.id = report_id
      and public.can_access_client(r.client_id)
  )
);

create policy "MB can manage DRE lines"
on public.dre_report_lines
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Cash flow scoped read"
on public.cash_flow_reports
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage cash flow reports"
on public.cash_flow_reports
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Documents scoped read"
on public.documents
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage documents"
on public.documents
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Client can create requested import metadata"
on public.import_jobs
for insert
to authenticated
with check (public.can_access_client(client_id));

create policy "Import jobs scoped read"
on public.import_jobs
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage import jobs"
on public.import_jobs
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Tasks scoped read"
on public.tasks
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage tasks"
on public.tasks
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Insights scoped read"
on public.ai_insights
for select
to authenticated
using (public.can_access_client(client_id));

create policy "MB can manage insights"
on public.ai_insights
for all
to authenticated
using (public.is_mb_user())
with check (public.is_mb_user());

create policy "Messages scoped read"
on public.messages
for select
to authenticated
using (public.can_access_client(client_id));

create policy "Messages scoped insert"
on public.messages
for insert
to authenticated
with check (public.can_access_client(client_id));

create policy "Audit visible to MB"
on public.audit_logs
for select
to authenticated
using (public.is_mb_user());

create policy "Audit insert by authenticated"
on public.audit_logs
for insert
to authenticated
with check (auth.uid() is not null);

-- Bucket privado para documentos da MB Intelligence.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mb-documents',
  'mb-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'text/csv',
    'application/xml',
    'text/xml',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/ofx',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Convenção de path:
-- client/<client_id>/company/<company_id>/competence/<yyyy-mm>/<category>/<document_id>/<filename>

create policy "Storage objects readable by scoped users"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mb-documents'
  and (
    public.is_mb_user()
    or exists (
      select 1
      from public.documents d
      where d.storage_bucket = bucket_id
        and d.storage_path = name
        and public.can_access_client(d.client_id)
    )
  )
);

create policy "MB can upload storage objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mb-documents'
  and public.is_mb_user()
);

create policy "MB can update storage objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'mb-documents'
  and public.is_mb_user()
)
with check (
  bucket_id = 'mb-documents'
  and public.is_mb_user()
);

create policy "MB can delete storage objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'mb-documents'
  and public.is_mb_user()
);
