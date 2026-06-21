alter table public.clients
  add column if not exists next_review_date date;

alter table public.documents
  add column if not exists due_date date;

create index if not exists idx_documents_client_competence
  on public.documents(client_id, competence);

create index if not exists idx_documents_due_date
  on public.documents(due_date);
