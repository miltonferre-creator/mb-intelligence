-- ============================================================================
-- MB Intelligence — Remoção dos DADOS DE DEMONSTRAÇÃO do banco de PRODUÇÃO
-- ============================================================================
-- Existem DOIS conjuntos de demo (UUIDs deterministicos) que podem coexistir:
--   Conjunto A  (migração 0009_demo_clients): ids 11111111-1111-1111-1111-...
--   Conjunto B  (script seed-supabase.js):    ids 11111111-1111-4111-8111-...
-- Cliente REAL tem UUID aleatorio, entao nada real casa com estes ids -> seguro.
--
-- A maioria das tabelas filhas e ON DELETE CASCADE em clients(id): apagar os
-- clientes demo remove companies, financial_snapshots, dre_reports(+linhas),
-- cash_flow_reports, documents, import_jobs, tasks, ai_insights e messages.
-- audit_logs NAO tem client_id -> tratado a parte.
--
-- ⚠️ LOGINS DEMO (senha 123456): o seed-supabase.js criou contas de acesso —
--   ver BLOCO 3. NAO sao apagadas automaticamente porque alguma pode ser a
--   SUA conta real (ex.: admin@mbempresas.com.br). Trate-as manualmente.
--
-- COMO USAR (Supabase → SQL Editor):
--   1) BLOCO 1 (PREVIEW, leitura) — confira as contagens.
--   2) BLOCO 2 (TRANSACAO) — apaga os dados demo dos dois conjuntos.
--   3) BLOCO 3 (LOGINS) — leia o aviso e decida o que manter/apagar.
-- Idempotente: rodar de novo nao apaga nada real.
-- ============================================================================

-- Lista unica dos ids de cliente demo (conjuntos A e B).
-- (repetida nos blocos abaixo via CTE 'demo')

-- ----------------------------------------------------------------------------
-- BLOCO 1 — PREVIEW (somente leitura)
-- ----------------------------------------------------------------------------
with demo(client_id) as (values
  ('11111111-1111-1111-1111-111111111111'::uuid),
  ('22222222-2222-2222-2222-222222222222'::uuid),
  ('33333333-3333-3333-3333-333333333333'::uuid),
  ('11111111-1111-4111-8111-111111111111'::uuid),
  ('22222222-2222-4222-8222-222222222222'::uuid),
  ('33333333-3333-4333-8333-333333333333'::uuid)
)
select 'clients'            as tabela, count(*) from public.clients            where id        in (select client_id from demo)
union all select 'companies',           count(*) from public.companies           where client_id in (select client_id from demo)
union all select 'financial_snapshots', count(*) from public.financial_snapshots where client_id in (select client_id from demo)
union all select 'dre_reports',         count(*) from public.dre_reports         where client_id in (select client_id from demo)
union all select 'cash_flow_reports',   count(*) from public.cash_flow_reports   where client_id in (select client_id from demo)
union all select 'documents',           count(*) from public.documents           where client_id in (select client_id from demo)
union all select 'import_jobs',         count(*) from public.import_jobs         where client_id in (select client_id from demo)
union all select 'tasks',               count(*) from public.tasks               where client_id in (select client_id from demo)
union all select 'ai_insights',         count(*) from public.ai_insights         where client_id in (select client_id from demo)
union all select 'messages',            count(*) from public.messages            where client_id in (select client_id from demo)
union all select 'audit_logs (demo)',   count(*) from public.audit_logs where id in (
  'ab111111-0001-0001-0001-000000000001','ab111111-0002-0002-0002-000000000002',
  'ab222222-0001-0001-0001-000000000001','ab222222-0002-0002-0002-000000000002') or action = 'Seed Supabase'
union all select 'user_profiles (LOGINS demo - ver BLOCO 3)', count(*) from public.user_profiles
  where email in ('admin@mbempresas.com.br','operacao@mbempresas.com.br','financeiro@mbempresas.com.br',
                  'cfo@mbempresas.com.br','fiscal@mbempresas.com.br',
                  'cfo@cliente.com','financeiro@cliente.com','contabilidade@cliente.com');

-- ----------------------------------------------------------------------------
-- BLOCO 2 — TRANSACAO (apaga os DADOS demo dos dois conjuntos)
-- ----------------------------------------------------------------------------
begin;

  delete from public.audit_logs
  where id in (
    'ab111111-0001-0001-0001-000000000001',
    'ab111111-0002-0002-0002-000000000002',
    'ab222222-0001-0001-0001-000000000001',
    'ab222222-0002-0002-0002-000000000002'
  )
  or action = 'Seed Supabase';

  -- Apaga os clientes demo (conjuntos A e B); CASCADE remove todo o resto.
  delete from public.clients
  where id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333'
  );

commit;

-- ----------------------------------------------------------------------------
-- BLOCO 3 — ⚠️ LOGINS DEMO COM SENHA 123456 (acao manual obrigatoria)
-- ----------------------------------------------------------------------------
-- O seed-supabase.js criou ATE 8 contas com senha "123456":
--   MB:      admin@mbempresas.com.br, operacao@mbempresas.com.br,
--            financeiro@mbempresas.com.br, cfo@mbempresas.com.br, fiscal@mbempresas.com.br
--   Cliente: cfo@cliente.com, financeiro@cliente.com, contabilidade@cliente.com
--
-- RISCO: se ainda estiverem com 123456, qualquer um loga como ADMIN MASTER.
--
-- 1) Veja quais existem e de que tipo sao:
--    select id, email, name, type, status, client_id from public.user_profiles
--    where email in ('admin@mbempresas.com.br','operacao@mbempresas.com.br',
--      'financeiro@mbempresas.com.br','cfo@mbempresas.com.br','fiscal@mbempresas.com.br',
--      'cfo@cliente.com','financeiro@cliente.com','contabilidade@cliente.com');
--
-- 2) DECISAO SUA:
--    - A conta que VOCE usa (provavelmente admin@mbempresas.com.br): MANTENHA,
--      mas TROQUE A SENHA agora (Supabase → Authentication → Users → ... → Reset).
--    - As que NAO usa (logins de cliente demo e MBs extras): APAGUE.
--
-- 3) Para apagar um login demo (confirme o email antes!):
--    -- Remova o perfil:
--    --   delete from public.user_profiles where email = 'cfo@cliente.com';
--    -- E remova o acesso em: Supabase → Authentication → Users → (excluir).
--    --   (auth.users fica no schema 'auth'; o jeito seguro e pela tela de Auth.)
-- ----------------------------------------------------------------------------
