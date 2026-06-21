-- MB Intelligence - limpeza de dados de demonstracao Fase 1
-- Usar apenas em ambiente de homologacao/demonstracao antes de apresentacoes comerciais.

update public.clients
set
  plan_id = 'cfo',
  status = 'Ativo',
  owner_name = 'Marcos Silva',
  maturity = 'CFO validado',
  confidence = 'Alta',
  consultant_name = 'Bruno Andrade',
  analyst_name = 'Ana Ribeiro'
where name = 'Comercio Silva LTDA';

update public.user_profiles
set name = 'Marcos Lima'
where email = 'admin@mbempresas.com.br'
  and name <> 'Marcos Lima';

delete from public.clients
where name = 'Nova Empresa LTDA';

delete from public.import_jobs
where file_name = 'extrato_maio.ofx'
  and coalesce(status, '') <> 'Validado';

update public.documents
set competence = date '2026-06-01'
where file_name ilike 'DRE\_%' escape '\'
  and competence = date '2026-07-01';
