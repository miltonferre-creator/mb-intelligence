alter table public.ai_insights
  add column if not exists review_notes text;
