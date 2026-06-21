-- MB Intelligence - Fase 1 comercial
-- Garante campos usados pela operacao e pela auditoria comercial.

alter table public.clients
  add column if not exists next_review_date date;

alter table public.clients
  add column if not exists last_access_at timestamptz;

alter table public.documents
  add column if not exists due_date date;

create index if not exists idx_clients_last_access_at
  on public.clients(last_access_at);

create index if not exists idx_documents_client_competence
  on public.documents(client_id, competence);

create index if not exists idx_documents_due_date
  on public.documents(due_date);
