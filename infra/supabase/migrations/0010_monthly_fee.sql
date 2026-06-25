-- 0010_monthly_fee.sql
-- Plano unico: a mensalidade passa a ser POR CLIENTE (negociavel), em vez de
-- vir de um plano. Coluna aditiva e nullable (sem impacto em dados existentes).
alter table public.clients add column if not exists monthly_fee numeric(14,2);
