const path = require("node:path");
const { loadEnv } = require("../lib/env");
const { supabaseRequest } = require("../lib/supabase-client");

loadEnv(path.resolve(__dirname, "../../.env"));

const ids = {
  clients: {
    silva: "11111111-1111-4111-8111-111111111111",
    clinica: "22222222-2222-4222-8222-222222222222",
    prime: "33333333-3333-4333-8333-333333333333"
  },
  companies: {
    silva: "aaaaaaaa-1111-4111-8111-111111111111",
    clinica: "aaaaaaaa-2222-4222-8222-222222222222",
    prime: "aaaaaaaa-3333-4333-8333-333333333333"
  },
  reports: {
    dreSilva: "bbbbbbbb-1111-4111-8111-111111111111",
    cashSilva: "bbbbbbbb-2222-4222-8222-222222222222"
  },
  documents: {
    dasSilva: "cccccccc-1111-4111-8111-111111111111",
    folhaClinica: "cccccccc-2222-4222-8222-222222222222",
    contratoPrime: "cccccccc-3333-4333-8333-333333333333"
  },
  imports: {
    ofxSilva: "dddddddd-1111-4111-8111-111111111111",
    csvClinica: "dddddddd-2222-4222-8222-222222222222",
    xmlPrime: "dddddddd-3333-4333-8333-333333333333"
  },
  tasks: {
    contratosSilva: "eeeeeeee-1111-4111-8111-111111111111",
    ofxClinica: "eeeeeeee-2222-4222-8222-222222222222",
    contratoPrime: "eeeeeeee-3333-4333-8333-333333333333"
  },
  insights: {
    investimentoSilva: "ffffffff-1111-4111-8111-111111111111",
    folhaClinica: "ffffffff-2222-4222-8222-222222222222"
  }
};

const seedUsers = [
  { key: "admin", type: "mb", name: "Marcos Lima", email: "admin@mbempresas.com.br", password: "123456", role: "Administrador master" },
  { key: "operacao", type: "mb", name: "Carla Souza", email: "operacao@mbempresas.com.br", password: "123456", role: "Gestora operacional" },
  { key: "financeiroMb", type: "mb", name: "Ana Ribeiro", email: "financeiro@mbempresas.com.br", password: "123456", role: "Analista financeiro" },
  { key: "cfoMb", type: "mb", name: "Bruno Andrade", email: "cfo@mbempresas.com.br", password: "123456", role: "Consultor CFO" },
  { key: "fiscal", type: "mb", name: "Paula Martins", email: "fiscal@mbempresas.com.br", password: "123456", role: "Fiscal" },
  { key: "silva", type: "client", clientId: ids.clients.silva, name: "Marcos Silva", email: "cfo@cliente.com", password: "123456", role: "Proprietario" },
  { key: "clinica", type: "client", clientId: ids.clients.clinica, name: "Camila Norte", email: "financeiro@cliente.com", password: "123456", role: "Gestor financeiro" },
  { key: "prime", type: "client", clientId: ids.clients.prime, name: "Juliana Prime", email: "contabilidade@cliente.com", password: "123456", role: "Proprietario" }
];

async function admin(pathname, options = {}) {
  return supabaseRequest(pathname, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Prefer: options.prefer || "return=representation"
    }
  });
}

async function upsert(table, rows, onConflict = "id") {
  return admin(`/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: rows
  });
}

async function listAuthUsers() {
  const response = await supabaseRequest("/auth/v1/admin/users?page=1&per_page=1000", { method: "GET" });
  return response.users || [];
}

async function createOrGetAuthUser(seedUser, existingUsers) {
  const found = existingUsers.find((user) => user.email?.toLowerCase() === seedUser.email.toLowerCase());
  if (found) return found;

  const created = await supabaseRequest("/auth/v1/admin/users", {
    method: "POST",
    body: {
      email: seedUser.email,
      password: seedUser.password,
      email_confirm: true,
      user_metadata: {
        name: seedUser.name,
        type: seedUser.type,
        role: seedUser.role
      }
    }
  });

  return created;
}

async function main() {
  await upsert("clients", [
    {
      id: ids.clients.silva,
      name: "Comercio Silva LTDA",
      trade_name: "Comercio Silva",
      cnpj: "12.481.900/0001-41",
      city: "Fortaleza/CE",
      segment: "Comercio varejista",
      tax_regime: "Simples Nacional",
      plan_id: "cfo",
      maturity: "CFO validado",
      status: "Ativo",
      owner_name: "Marcos Silva",
      email: "marcos@comerciosilva.com.br",
      phone: "(85) 99999-1010",
      consultant_name: "Bruno Andrade",
      analyst_name: "Ana Ribeiro",
      confidence: "Alta",
      next_review_date: "2026-05-28"
    },
    {
      id: ids.clients.clinica,
      name: "Clinica Norte PME",
      trade_name: "Clinica Norte",
      cnpj: "28.610.772/0001-08",
      city: "Natal/RN",
      segment: "Saude",
      tax_regime: "Simples Nacional",
      plan_id: "financeiro",
      maturity: "Financeiro integrado",
      status: "Ativo",
      owner_name: "Dra. Camila Norte",
      email: "camila@clinicanorte.com.br",
      phone: "(84) 99999-2020",
      consultant_name: "Ana Ribeiro",
      analyst_name: "Ana Ribeiro",
      confidence: "Media",
      next_review_date: "2026-05-29"
    },
    {
      id: ids.clients.prime,
      name: "Servicos Prime ME",
      trade_name: "Servicos Prime",
      cnpj: "41.802.119/0001-77",
      city: "Recife/PE",
      segment: "Servicos",
      tax_regime: "Simples Nacional",
      plan_id: "contabilidade",
      maturity: "Fiscal basico",
      status: "Onboarding",
      owner_name: "Juliana Prime",
      email: "juliana@servicosprime.com.br",
      phone: "(81) 99999-3030",
      consultant_name: "Lucas Pereira",
      analyst_name: "A definir",
      confidence: "Baixa",
      next_review_date: "2026-05-31"
    }
  ]);

  await upsert("companies", [
    { id: ids.companies.silva, client_id: ids.clients.silva, name: "Comercio Silva LTDA", cnpj: "12.481.900/0001-41", city: "Fortaleza/CE" },
    { id: ids.companies.clinica, client_id: ids.clients.clinica, name: "Clinica Norte PME", cnpj: "28.610.772/0001-08", city: "Natal/RN" },
    { id: ids.companies.prime, client_id: ids.clients.prime, name: "Servicos Prime ME", cnpj: "41.802.119/0001-77", city: "Recife/PE" }
  ]);

  let authUsers = await listAuthUsers();
  const profiles = [];
  for (const seedUser of seedUsers) {
    const authUser = await createOrGetAuthUser(seedUser, authUsers);
    authUsers = authUsers.concat(authUser);
    profiles.push({
      id: authUser.id,
      client_id: seedUser.clientId || null,
      type: seedUser.type,
      name: seedUser.name,
      email: seedUser.email,
      role: seedUser.role,
      status: "Ativo"
    });
  }
  await upsert("user_profiles", profiles);

  await upsert("financial_snapshots", [
    { client_id: ids.clients.silva, company_id: ids.companies.silva, competence: "2026-05-01", revenue: 182500, expenses: 142190, cash: 84600, taxes: 13880, payroll: 31200, financial_score: 82, operational_score: 76, runway_days: 42, investment_capacity: 52000, confidence: "Alta", status: "Publicado" },
    { client_id: ids.clients.clinica, company_id: ids.companies.clinica, competence: "2026-05-01", revenue: 96500, expenses: 70300, cash: 38600, taxes: 7640, payroll: 22600, financial_score: 68, operational_score: 71, runway_days: 26, investment_capacity: 0, confidence: "Media", status: "Publicado" },
    { client_id: ids.clients.prime, company_id: ids.companies.prime, competence: "2026-05-01", revenue: 42800, expenses: 0, cash: 0, taxes: 3260, payroll: 0, financial_score: 0, operational_score: 54, runway_days: 0, investment_capacity: 0, confidence: "Baixa", status: "Publicado" }
  ], "client_id,company_id,competence");

  const dre = await upsert("dre_reports", [
    { id: ids.reports.dreSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, competence: "2026-05-01", status: "Publicado", published_at: new Date().toISOString() }
  ]);

  if (dre?.[0]?.id) {
    await upsert("dre_report_lines", [
      { id: "99999999-1111-4111-8111-111111111111", report_id: dre[0].id, sort_order: 1, account: "Receita bruta", amount: 182500, revenue_percent: 100, line_type: "normal" },
      { id: "99999999-2222-4222-8222-222222222222", report_id: dre[0].id, sort_order: 2, account: "Impostos e deducoes", amount: -13880, revenue_percent: 7.6, line_type: "normal" },
      { id: "99999999-3333-4333-8333-333333333333", report_id: dre[0].id, sort_order: 3, account: "Custos diretos", amount: -72100, revenue_percent: 39.5, line_type: "normal" },
      { id: "99999999-4444-4444-8444-444444444444", report_id: dre[0].id, sort_order: 4, account: "Despesas operacionais", amount: -56210, revenue_percent: 30.8, line_type: "normal" },
      { id: "99999999-5555-4555-8555-555555555555", report_id: dre[0].id, sort_order: 5, account: "Resultado gerencial", amount: 40310, revenue_percent: 22.1, line_type: "total" }
    ]);
  }

  await upsert("cash_flow_reports", [
    { id: ids.reports.cashSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, competence: "2026-05-01", opening_balance: 60200, receipts: 126000, payments: 86400, taxes: 15200, closing_balance: 84600, runway_days: 42, status: "Publicado", published_at: new Date().toISOString() }
  ]);

  await upsert("documents", [
    { id: ids.documents.dasSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, competence: "2026-05-01", due_date: "2026-06-20", category: "Fiscal", document_type: "DAS", file_name: "DAS Maio 2026.pdf", file_extension: "pdf", mime_type: "application/pdf", storage_bucket: "mb-documents", storage_path: `client/${ids.clients.silva}/company/${ids.companies.silva}/competence/2026-05/Fiscal/das-maio-2026.pdf`, status: "Disponivel", visibility: "Cliente" },
    { id: ids.documents.folhaClinica, client_id: ids.clients.clinica, company_id: ids.companies.clinica, competence: "2026-05-01", due_date: "2026-06-05", category: "Trabalhista", document_type: "Folha", file_name: "Folha Maio 2026.pdf", file_extension: "pdf", mime_type: "application/pdf", storage_bucket: "mb-documents", storage_path: `client/${ids.clients.clinica}/company/${ids.companies.clinica}/competence/2026-05/Trabalhista/folha-maio-2026.pdf`, status: "Disponivel", visibility: "Cliente" },
    { id: ids.documents.contratoPrime, client_id: ids.clients.prime, company_id: ids.companies.prime, competence: "2026-05-01", due_date: null, category: "Societario", document_type: "Contrato", file_name: "Contrato Social.pdf", file_extension: "pdf", mime_type: "application/pdf", storage_bucket: "mb-documents", storage_path: `client/${ids.clients.prime}/company/${ids.companies.prime}/competence/2026-05/Societario/contrato-social.pdf`, status: "Pendente", visibility: "Cliente" }
  ]);

  await upsert("import_jobs", [
    { id: ids.imports.ofxSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, source_type: "OFX", file_name: "extrato_maio.ofx", status: "Validado", result: "Fluxo de caixa atualizado" },
    { id: ids.imports.csvClinica, client_id: ids.clients.clinica, company_id: ids.companies.clinica, source_type: "CSV", file_name: "despesas_maio.csv", status: "Erro de colunas", result: "Solicitar novo arquivo" },
    { id: ids.imports.xmlPrime, client_id: ids.clients.prime, company_id: ids.companies.prime, source_type: "XML", file_name: "xml_maio.zip", status: "Aguardando revisao", result: "Validar faturamento" }
  ]);

  await upsert("tasks", [
    { id: ids.tasks.contratosSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, title: "Revisar contratos administrativos", priority: "Alta", due_date: "2026-05-25", status: "Em andamento", origin: "MB" },
    { id: ids.tasks.ofxClinica, client_id: ids.clients.clinica, company_id: ids.companies.clinica, title: "Enviar extrato OFX", priority: "Media", due_date: "2026-05-26", status: "Aguardando cliente", origin: "MB" },
    { id: ids.tasks.contratoPrime, client_id: ids.clients.prime, company_id: ids.companies.prime, title: "Enviar contrato social", priority: "Alta", due_date: "2026-05-28", status: "Pendente", origin: "MB" }
  ]);

  await upsert("ai_insights", [
    { id: ids.insights.investimentoSilva, client_id: ids.clients.silva, company_id: ids.companies.silva, competence: "2026-05-01", title: "Parecer de capacidade de investimento", content: "O caixa suporta investimento moderado.", confidence: "Alta", status: "Aguardando aprovacao" },
    { id: ids.insights.folhaClinica, client_id: ids.clients.clinica, company_id: ids.companies.clinica, competence: "2026-05-01", title: "Insight sobre crescimento de folha", content: "A folha representa 23,4% do faturamento.", confidence: "Media", status: "Editar antes de liberar" }
  ]);

  await upsert("audit_logs", [
    { user_name: "Sistema", action: "Seed Supabase", entity: "setup", target: "MB Intelligence", result: "Dados iniciais aplicados" }
  ]);

  console.log(JSON.stringify({ seeded: true, users: profiles.length, clients: 3 }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
