-- 0009_demo_clients.sql
-- Insere 3 clientes fictícios para teste e demonstração do portal MB Intelligence.
-- Todos os dados são ficcionais. UUIDs fixos para consistência entre ambientes.

-- ============================================================
-- CLIENTS
-- ============================================================
insert into public.clients (id, name, trade_name, cnpj, city, segment, tax_regime, plan_id, maturity, status, owner_name, email, phone, consultant_name, analyst_name, confidence)
values
  ('11111111-1111-1111-1111-111111111111', 'Comercio Silva LTDA',     'Comercio Silva',  '12.481.900/0001-41', 'Fortaleza/CE', 'Comercio varejista', 'Simples Nacional', 'gestao',        'Gestao integrada',  'Ativo',      'Marcos Silva',   'marcos@comerciosilva.com.br',   '(85) 99999-1010', 'Bruno Andrade', 'Ana Ribeiro',   'Alta'),
  ('22222222-2222-2222-2222-222222222222', 'Clinica Norte PME',       'Clinica Norte',   '28.610.772/0001-08', 'Natal/RN',    'Saude',             'Simples Nacional', 'gestao',        'Gestao integrada',  'Ativo',      'Dra. Camila Norte','camila@clinicanorte.com.br',   '(84) 99999-2020', 'Ana Ribeiro',   'Ana Ribeiro',   'Media'),
  ('33333333-3333-3333-3333-333333333333', 'Servicos Prime ME',       'Servicos Prime',  '41.802.119/0001-77', 'Recife/PE',   'Servicos',          'Simples Nacional', 'contabilidade', 'Fiscal basico',     'Onboarding', 'Juliana Prime',  'juliana@servicosprime.com.br',  '(81) 99999-3030', 'Lucas Pereira', 'A definir',     'Baixa')
on conflict (id) do nothing;

-- ============================================================
-- COMPANIES
-- ============================================================
insert into public.companies (id, client_id, name, trade_name, cnpj, city, state, tax_regime)
values
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Comercio Silva LTDA',  'Comercio Silva', '12.481.900/0001-41', 'Fortaleza', 'CE', 'Simples Nacional'),
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Clinica Norte PME',   'Clinica Norte',  '28.610.772/0001-08', 'Natal',     'RN', 'Simples Nacional'),
  ('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Servicos Prime ME',   'Servicos Prime', '41.802.119/0001-77', 'Recife',    'PE', 'Simples Nacional')
on conflict (id) do nothing;

-- ============================================================
-- FINANCIAL SNAPSHOTS — Comercio Silva (3 meses)
-- ============================================================
insert into public.financial_snapshots
  (client_id, company_id, competence, revenue, expenses, cash, taxes, payroll, financial_score, operational_score, runway_days, investment_capacity, confidence, status)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-03-01', 165000, 132800, 61800, 12600, 29200, 78, 71, 32, 26000, 'Alta', 'Publicado'),
  ('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-04-01', 174200, 138600, 70200, 13240, 30400, 80, 74, 36, 38000, 'Alta', 'Publicado'),
  ('11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-05-01', 182500, 142190, 84600, 13880, 31200, 82, 76, 42, 52000, 'Alta', 'Publicado')
on conflict (client_id, company_id, competence) do nothing;

-- FINANCIAL SNAPSHOTS — Clinica Norte (3 meses)
insert into public.financial_snapshots
  (client_id, company_id, competence, revenue, expenses, cash, taxes, payroll, financial_score, operational_score, runway_days, investment_capacity, confidence, status)
values
  ('22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-03-01', 89000,  67500, 31500, 6900, 20700, 62, 66, 21, 0, 'Media', 'Publicado'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-04-01', 92500,  69000, 34200, 7220, 21600, 65, 69, 23, 0, 'Media', 'Publicado'),
  ('22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-05-01', 96500,  70300, 38600, 7640, 22600, 68, 71, 26, 0, 'Media', 'Publicado')
on conflict (client_id, company_id, competence) do nothing;

-- FINANCIAL SNAPSHOTS — Servicos Prime (3 meses, sem dados completos)
insert into public.financial_snapshots
  (client_id, company_id, competence, revenue, expenses, cash, taxes, payroll, financial_score, operational_score, runway_days, investment_capacity, confidence, status)
values
  ('33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '2026-03-01', 39000, 0, 0, 2940, 0, 0, 48, 0, 0, 'Baixa', 'Rascunho'),
  ('33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '2026-04-01', 41000, 0, 0, 3120, 0, 0, 51, 0, 0, 'Baixa', 'Rascunho'),
  ('33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '2026-05-01', 42800, 0, 0, 3260, 0, 0, 54, 0, 0, 'Baixa', 'Rascunho')
on conflict (client_id, company_id, competence) do nothing;

-- ============================================================
-- DOCUMENTS
-- ============================================================
insert into public.documents (id, client_id, company_id, competence, category, document_type, file_name, file_extension, mime_type, storage_bucket, storage_path, status, visibility)
values
  ('d1111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-05-01', 'Fiscal',      'DAS',             'DAS_Maio_2026.pdf',          'pdf', 'application/pdf', 'mb-documents', 'client/11111111-1111-1111-1111-111111111111/documents/2026-05/Fiscal/DAS_Maio_2026.pdf',          'Disponivel', 'Cliente'),
  ('d1111111-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-05-01', 'Financeiro',  'DRE Gerencial',   'DRE_Gerencial_Maio_2026.pdf','pdf', 'application/pdf', 'mb-documents', 'client/11111111-1111-1111-1111-111111111111/documents/2026-05/Financeiro/DRE_Gerencial_Maio_2026.pdf','Aprovado',   'Cliente'),
  ('d2222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-05-01', 'Trabalhista', 'Folha',           'Folha_Maio_2026.pdf',        'pdf', 'application/pdf', 'mb-documents', 'client/22222222-2222-2222-2222-222222222222/documents/2026-05/Trabalhista/Folha_Maio_2026.pdf',        'Disponivel', 'Cliente'),
  ('d2222222-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-04-01', 'Fiscal',      'DAS',             'DAS_Abril_2026.pdf',         'pdf', 'application/pdf', 'mb-documents', 'client/22222222-2222-2222-2222-222222222222/documents/2026-04/Fiscal/DAS_Abril_2026.pdf',         'Aprovado',   'Cliente'),
  ('d3333333-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', '2026-05-01', 'Societario',  'Contrato Social', 'Contrato_Social.pdf',        'pdf', 'application/pdf', 'mb-documents', 'client/33333333-3333-3333-3333-333333333333/documents/2026-05/Societario/Contrato_Social.pdf',        'Pendente',   'Cliente')
on conflict (id) do nothing;

-- ============================================================
-- IMPORT JOBS
-- ============================================================
insert into public.import_jobs (id, client_id, company_id, source_type, file_name, status, result)
values
  ('e1111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'OFX', 'extrato_maio_2026.ofx', 'Validado',           'Fluxo de caixa atualizado'),
  ('e2222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', 'CSV', 'despesas_maio.csv',     'Erro de colunas',    'Solicitar novo arquivo ao cliente'),
  ('e3333333-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', 'XML', 'notas_maio.zip',        'Aguardando revisao', 'Validar faturamento NF-e')
on conflict (id) do nothing;

-- ============================================================
-- TASKS
-- ============================================================
insert into public.tasks (id, client_id, company_id, title, priority, due_date, status, origin)
values
  ('f1111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Revisar contratos administrativos',      'Alta',  '2026-06-25', 'Em andamento',   'MB'),
  ('f2222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', 'Carregar extrato OFX recebido',          'Media', '2026-06-26', 'Aguardando MB',  'MB'),
  ('f3333333-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', 'Publicar contrato social no portal',     'Alta',  '2026-06-28', 'Pendente',       'MB'),
  ('f1111111-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Validar balancete junho com o cliente',  'Media', '2026-07-05', 'Pendente',       'MB')
on conflict (id) do nothing;

-- ============================================================
-- AI INSIGHTS (aprovações)
-- ============================================================
insert into public.ai_insights (id, client_id, company_id, competence, title, content, confidence, status)
values
  ('a0111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '2026-05-01',
   'Capacidade de investimento moderada',
   'O caixa de R$84.600 cobre 42 dias de operação. Existe capacidade de investimento estimada em R$52.000 sem comprometer a reserva mínima de 45 dias. Recomendamos priorizar capital de giro antes de expansão.',
   'Alta', 'Aguardando aprovacao'),
  ('a0222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', '2026-05-01',
   'Folha de pagamento em crescimento',
   'A folha representa 23,4% do faturamento em maio, acima do benchmark setorial de 20%. O crescimento de 4,3% em 3 meses deve ser acompanhado para evitar compressão de margem.',
   'Media', 'Editar antes de liberar')
on conflict (id) do nothing;

-- ============================================================
-- MESSAGES
-- ============================================================
insert into public.messages (id, client_id, sender_label, content)
values
  ('c1111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'MB',      'Seu relatório financeiro de maio foi atualizado e está disponível no portal.'),
  ('c1111111-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'Cliente', 'Obrigado! Vou verificar. O extrato complementar de junho será enviado essa semana.'),
  ('c2222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'MB',      'A folha de maio está publicada. Precisamos do extrato bancário para fechar o caixa.')
on conflict (id) do nothing;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
insert into public.audit_logs (id, user_name, action, entity, target, result)
values
  ('ab111111-0001-0001-0001-000000000001', 'Bruno Andrade', 'Publicou relatório financeiro', 'Comercio Silva LTDA',  'DRE Maio/2026',        'Documento disponível no portal'),
  ('ab111111-0002-0002-0002-000000000002', 'Ana Ribeiro',   'Validou importação OFX',        'Comercio Silva LTDA',  'extrato_maio.ofx',     'Fluxo de caixa atualizado'),
  ('ab222222-0001-0001-0001-000000000001', 'Ana Ribeiro',   'Publicou folha de pagamento',   'Clinica Norte PME',    'Folha Maio/2026',      'Documento disponível no portal'),
  ('ab222222-0002-0002-0002-000000000002', 'Ana Ribeiro',   'Solicitou extrato OFX',         'Clinica Norte PME',    'Pendência de extrato', 'Mensagem enviada ao cliente')
on conflict (id) do nothing;
