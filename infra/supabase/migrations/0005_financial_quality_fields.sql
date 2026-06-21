-- MB Intelligence - campos de qualidade financeira e meta por cliente

alter table public.financial_snapshots
  add column if not exists margin_target numeric(8,2),
  add column if not exists working_capital_days integer,
  add column if not exists score_breakdown jsonb not null default '[]'::jsonb;

