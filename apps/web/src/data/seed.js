(function () {
  window.MBI = window.MBI || {};

  MBI.seed = {
    version: 6,
    plans: [
      {
        id: "contabilidade",
        name: "Contabilidade",
        price: 800,
        tagline: "Organizacao contabil, documentos e guias em um so lugar.",
        modules: ["Documentos", "Guias", "DAS", "Pendencias", "Avisos"],
        color: "status-warning"
      },
      {
        id: "financeiro",
        name: "Financeiro IA",
        price: 1200,
        tagline: "Dashboards, faturamento, folha, fiscal e analises automaticas.",
        modules: ["Documentos", "Fiscal", "Folha", "Faturamento", "IA basica", "Relatorios simples"],
        color: "status-ok"
      },
      {
        id: "cfo",
        name: "CFO as a Service",
        price: 2000,
        tagline: "Analise executiva, DRE, caixa, score e apoio consultivo.",
        modules: ["Todos os modulos", "DRE", "Fluxo de caixa", "Score", "Parecer MB", "Reunioes CFO"],
        color: "status-danger"
      }
    ],
    clients: [
      {
        id: "silva",
        name: "Comercio Silva LTDA",
        tradeName: "Comercio Silva",
        cnpj: "12.481.900/0001-41",
        city: "Fortaleza/CE",
        segment: "Comercio varejista",
        taxRegime: "Simples Nacional",
        planId: "cfo",
        maturity: "CFO validado",
        status: "Ativo",
        owner: "Marcos Silva",
        email: "marcos@comerciosilva.com.br",
        phone: "(85) 99999-1010",
        consultant: "Bruno Andrade",
        analyst: "Ana Ribeiro",
        confidence: "Alta",
        nextReview: "2026-05-28",
        lastAccess: "Hoje, 09:12"
      },
      {
        id: "clinica",
        name: "Clinica Norte PME",
        tradeName: "Clinica Norte",
        cnpj: "28.610.772/0001-08",
        city: "Natal/RN",
        segment: "Saude",
        taxRegime: "Simples Nacional",
        planId: "financeiro",
        maturity: "Financeiro integrado",
        status: "Ativo",
        owner: "Dra. Camila Norte",
        email: "camila@clinicanorte.com.br",
        phone: "(84) 99999-2020",
        consultant: "Ana Ribeiro",
        analyst: "Ana Ribeiro",
        confidence: "Media",
        nextReview: "2026-05-29",
        lastAccess: "Ontem, 17:44"
      },
      {
        id: "prime",
        name: "Servicos Prime ME",
        tradeName: "Servicos Prime",
        cnpj: "41.802.119/0001-77",
        city: "Recife/PE",
        segment: "Servicos",
        taxRegime: "Simples Nacional",
        planId: "contabilidade",
        maturity: "Fiscal basico",
        status: "Onboarding",
        owner: "Juliana Prime",
        email: "juliana@servicosprime.com.br",
        phone: "(81) 99999-3030",
        consultant: "Lucas Pereira",
        analyst: "A definir",
        confidence: "Baixa",
        nextReview: "2026-05-31",
        lastAccess: "23/05, 14:20"
      }
    ],
    companies: [
      { id: "emp-silva", clientId: "silva", name: "Comercio Silva LTDA", cnpj: "12.481.900/0001-41", city: "Fortaleza/CE" },
      { id: "emp-clinica", clientId: "clinica", name: "Clinica Norte PME", cnpj: "28.610.772/0001-08", city: "Natal/RN" },
      { id: "emp-prime", clientId: "prime", name: "Servicos Prime ME", cnpj: "41.802.119/0001-77", city: "Recife/PE" }
    ],
    users: [
      { id: "u-admin", type: "mb", name: "Marcos Lima", email: "admin@mbempresas.com.br", password: "123456", role: "Administrador master", status: "Ativo" },
      { id: "u-operacao", type: "mb", name: "Carla Souza", email: "operacao@mbempresas.com.br", password: "123456", role: "Gestora operacional", status: "Ativo" },
      { id: "u-financeiro", type: "mb", name: "Ana Ribeiro", email: "financeiro@mbempresas.com.br", password: "123456", role: "Analista financeiro", status: "Ativo" },
      { id: "u-cfo", type: "mb", name: "Bruno Andrade", email: "cfo@mbempresas.com.br", password: "123456", role: "Consultor CFO", status: "Ativo" },
      { id: "u-fiscal", type: "mb", name: "Paula Martins", email: "fiscal@mbempresas.com.br", password: "123456", role: "Fiscal", status: "Ativo" },
      { id: "u-silva", type: "client", clientId: "silva", name: "Marcos Silva", email: "cfo@cliente.com", password: "123456", role: "Proprietario", status: "Ativo" },
      { id: "u-clinica", type: "client", clientId: "clinica", name: "Camila Norte", email: "financeiro@cliente.com", password: "123456", role: "Gestor financeiro", status: "Ativo" },
      { id: "u-prime", type: "client", clientId: "prime", name: "Juliana Prime", email: "contabilidade@cliente.com", password: "123456", role: "Proprietario", status: "Ativo" }
    ],
    financials: {
      silva: {
        competence: "2026-05",
        revenue: 182500, expenses: 142190, result: 40310, cash: 84600, margin: 22.1, taxes: 13880, payroll: 31200, score: 82, operationalScore: 76, runway: 42, investmentCapacity: 52000, marginTarget: 20, workingCapitalDays: 45,
        dre: [
          { label: "BLOCO 1 - RECEITA", type: "section" },
          { label: "Receita bruta de vendas / servicos", amount: 182500, percent: "100%", type: "normal", variation: "Validado MB", ytd: "Competencia atual" },
          { label: "(-) Devolucoes e abatimentos", amount: 0, percent: "0%", type: "normal", variation: "Sem movimento informado", ytd: "-" },
          { label: "(-) Impostos sobre receita", amount: -13880, percent: "7,6%", type: "normal", variation: "DAS / fiscal", ytd: "-" },
          { label: "= Receita liquida", amount: 168620, percent: "92,4%", type: "subtotal", variation: "Subtotal", ytd: "-" },
          { label: "BLOCO 2 - CUSTO", type: "section" },
          { label: "(-) CMV / custo dos servicos prestados", amount: -72100, percent: "39,5%", type: "normal", variation: "Validado MB", ytd: "-" },
          { label: "= Lucro bruto", amount: 96520, percent: "52,9%", type: "subtotal", variation: "Subtotal", ytd: "-" },
          { label: "BLOCO 3 - DESPESAS OPERACIONAIS", type: "section" },
          { label: "(-) Despesas administrativas", amount: -25010, percent: "13,7%", type: "normal", variation: "Calculado por diferenca validada", ytd: "-" },
          { label: "(-) Despesas com pessoal / folha", amount: -31200, percent: "17,1%", type: "normal", variation: "Folha informada", ytd: "-" },
          { label: "(-) Despesas com vendas / marketing", amount: 0, percent: "0%", type: "normal", variation: "Sem movimento informado", ytd: "-" },
          { label: "(-) Depreciacao e amortizacao", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
          { label: "= EBITDA", amount: 40310, percent: "22,1%", type: "subtotal", variation: "Subtotal", ytd: "-" },
          { label: "= EBIT", amount: 40310, percent: "22,1%", type: "subtotal", variation: "Subtotal", ytd: "-" },
          { label: "BLOCO 4 - RESULTADO FINANCEIRO", type: "section" },
          { label: "(+) Receitas financeiras", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
          { label: "(-) Despesas financeiras", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
          { label: "= Resultado antes do IR / LAIR", amount: 40310, percent: "22,1%", type: "subtotal", variation: "Subtotal", ytd: "-" },
          { label: "BLOCO 5 - IMPOSTOS E LUCRO", type: "section" },
          { label: "(-) IR / CSLL", amount: 0, percent: "0%", type: "normal", variation: "Nao aplicavel/informado", ytd: "-" },
          { label: "= Lucro liquido gerencial", amount: 40310, percent: "22,1%", type: "total", variation: "Resultado final", ytd: "-" }
        ],
        cashBridge: [
          { label: "ATIVIDADES OPERACIONAIS (FCO)", type: "section" },
          { label: "(+) Recebimentos de clientes", amount: 126000, reference: "Entradas operacionais", type: "positive" },
          { label: "(-) Pagamentos a fornecedores e despesas operacionais", amount: -86400, reference: "Saidas operacionais consolidadas", type: "negative" },
          { label: "(-) Pagamentos de impostos", amount: -15200, reference: "DAS, FGTS, INSS e tributos", type: "negative" },
          { label: "= Caixa liquido das atividades operacionais", amount: 24400, reference: "FCO", type: "subtotal" },
          { label: "ATIVIDADES DE INVESTIMENTO (FCI)", type: "section" },
          { label: "Investimentos e imobilizado", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
          { label: "= Caixa liquido das atividades de investimento", amount: 0, reference: "FCI", type: "subtotal" },
          { label: "ATIVIDADES DE FINANCIAMENTO (FCF)", type: "section" },
          { label: "Emprestimos, amortizacoes e distribuicoes", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
          { label: "= Caixa liquido das atividades de financiamento", amount: 0, reference: "FCF", type: "subtotal" },
          { label: "CONSOLIDADO", type: "section" },
          { label: "Saldo inicial de caixa", amount: 60200, reference: "Inicio do periodo", type: "base" },
          { label: "Variacao liquida de caixa", amount: 24400, reference: "FCO + FCI + FCF", type: "subtotal" },
          { label: "Saldo final de caixa", amount: 84600, reference: "Conferencia com saldo bancario", type: "total" },
          { label: "Folego de caixa", amount: 42, reference: "Dias de cobertura estimada", type: "indicator" }
        ],
        months: [["Mai/26", 183, 142]],
        snapshots: {
          "2026-03": { competence: "2026-03", revenue: 165000, expenses: 132800, taxes: 12600, payroll: 29200, cash: 61800, directCosts: 64500, adminExpenses: 26500, salesExpenses: 0, financialExpenses: 0, openingBalance: 48200, receipts: 151000, payments: 101000, cashTaxes: 12600, closingBalance: 61800, operationalScore: 71, runway: 32, investmentCapacity: 26000, marginTarget: 20, workingCapitalDays: 51, insights: ["Marco fechou com margem positiva, mas caixa ainda dependia de recebimentos concentrados."] },
          "2026-04": { competence: "2026-04", revenue: 174200, expenses: 138600, taxes: 13240, payroll: 30400, cash: 70200, directCosts: 68500, adminExpenses: 26460, salesExpenses: 0, financialExpenses: 0, openingBalance: 61800, receipts: 160500, payments: 111500, cashTaxes: 13240, closingBalance: 70200, operationalScore: 74, runway: 36, investmentCapacity: 38000, marginTarget: 20, workingCapitalDays: 48, insights: ["Abril mostrou melhora de caixa e aumento controlado de despesas."] },
          "2026-05": { competence: "2026-05", revenue: 182500, expenses: 142190, taxes: 13880, payroll: 31200, cash: 84600, directCosts: 72100, adminExpenses: 25010, salesExpenses: 0, financialExpenses: 0, openingBalance: 70200, receipts: 181000, payments: 118600, cashTaxes: 13880, closingBalance: 84600, operationalScore: 76, runway: 42, investmentCapacity: 52000, marginTarget: 20, workingCapitalDays: 45, insights: ["A margem melhorou 2,4 pontos em maio, mas despesas administrativas ainda pressionam o resultado.", "O caixa suporta investimento moderado sem comprometer a reserva minima de 45 dias.", "Dois clientes representam 56% do faturamento."] }
        },
        insights: ["A margem melhorou 2,4 pontos em maio, mas despesas administrativas ainda pressionam o resultado.", "O caixa suporta investimento moderado sem comprometer a reserva minima de 45 dias.", "Dois clientes representam 56% do faturamento."]
      },
      clinica: {
        competence: "2026-05",
        revenue: 96500, expenses: 70300, result: 26200, cash: 38600, margin: 18.8, taxes: 7640, payroll: 22600, score: 68, operationalScore: 71, runway: 26, investmentCapacity: 0, marginTarget: 18, workingCapitalDays: 45,
        dre: [], cashBridge: [], months: [["Mai/26", 97, 70]],
        snapshots: {
          "2026-03": { competence: "2026-03", revenue: 89000, expenses: 67500, taxes: 6900, payroll: 20700, cash: 31500, directCosts: 23100, adminExpenses: 16800, salesExpenses: 0, financialExpenses: 0, openingBalance: 28400, receipts: 84200, payments: 60400, cashTaxes: 6900, closingBalance: 31500, operationalScore: 66, runway: 21, investmentCapacity: 0, marginTarget: 18, workingCapitalDays: 54, insights: ["Marco mostrou resultado positivo, mas dependente de dados complementares de despesas."] },
          "2026-04": { competence: "2026-04", revenue: 92500, expenses: 69000, taxes: 7220, payroll: 21600, cash: 34200, directCosts: 24000, adminExpenses: 16180, salesExpenses: 0, financialExpenses: 0, openingBalance: 31500, receipts: 90500, payments: 67400, cashTaxes: 7220, closingBalance: 34200, operationalScore: 69, runway: 23, investmentCapacity: 0, marginTarget: 18, workingCapitalDays: 51, insights: ["Abril teve crescimento de faturamento com despesas sob controle."] },
          "2026-05": { competence: "2026-05", revenue: 96500, expenses: 70300, taxes: 7640, payroll: 22600, cash: 38600, directCosts: 25200, adminExpenses: 14860, salesExpenses: 0, financialExpenses: 0, openingBalance: 34200, receipts: 96200, payments: 65700, cashTaxes: 7640, closingBalance: 38600, operationalScore: 71, runway: 26, investmentCapacity: 0, marginTarget: 18, workingCapitalDays: 45, insights: ["O faturamento cresceu em relacao ao mes anterior.", "A folha representa 23,4% do faturamento.", "A margem completa depende da revisao de despesas."] }
        },
        insights: ["O faturamento cresceu em relacao ao mes anterior.", "A folha representa 23,4% do faturamento.", "A margem completa depende da revisao de despesas."]
      },
      prime: {
        competence: "2026-05",
        revenue: 42800, expenses: 0, result: 0, cash: 0, margin: 0, taxes: 3260, payroll: 0, score: 0, operationalScore: 54, runway: 0, investmentCapacity: 0, marginTarget: 15, workingCapitalDays: 0,
        dre: [], cashBridge: [], months: [["Mai/26", 43, 0]],
        snapshots: {
          "2026-03": { competence: "2026-03", revenue: 39000, expenses: 0, taxes: 2940, payroll: 0, cash: 0, operationalScore: 48, runway: 0, investmentCapacity: 0, marginTarget: 15, workingCapitalDays: 0, insights: ["Base fiscal carregada. Dados financeiros ainda indisponiveis."] },
          "2026-04": { competence: "2026-04", revenue: 41000, expenses: 0, taxes: 3120, payroll: 0, cash: 0, operationalScore: 51, runway: 0, investmentCapacity: 0, marginTarget: 15, workingCapitalDays: 0, insights: ["Faturamento fiscal evoluiu, mas nao ha dados de caixa ou despesas."] },
          "2026-05": { competence: "2026-05", revenue: 42800, expenses: 0, taxes: 3260, payroll: 0, cash: 0, operationalScore: 54, runway: 0, investmentCapacity: 0, marginTarget: 15, workingCapitalDays: 0, insights: ["Dados suficientes para acompanhamento fiscal basico.", "Dados insuficientes para afirmar margem, lucro, caixa ou capacidade de investimento."] }
        },
        insights: ["Dados suficientes para acompanhamento fiscal basico.", "Dados insuficientes para afirmar margem, lucro, caixa ou capacidade de investimento.", "A MB precisa carregar extratos ou planilhas para liberar analises financeiras."]
      }
    },
    documents: [
      { id: "doc-1", clientId: "silva", name: "DAS Maio/2026", category: "Fiscal", status: "Disponivel", competence: "2026-05", dueDate: "2026-06-20", due: "20/06/2026", visibility: "Cliente" },
      { id: "doc-2", clientId: "silva", name: "DRE Gerencial Maio/2026", category: "Financeiro", status: "Aprovado", competence: "2026-05", dueDate: "", due: "Publicado hoje", visibility: "Cliente" },
      { id: "doc-3", clientId: "clinica", name: "Folha Maio/2026", category: "Trabalhista", status: "Disponivel", competence: "2026-05", dueDate: "2026-06-05", due: "05/06/2026", visibility: "Cliente" },
      { id: "doc-4", clientId: "prime", name: "Contrato Social", category: "Societario", status: "Pendente", competence: "2026-05", dueDate: "", due: "Aguardando envio", visibility: "Cliente" }
    ],
    imports: [
      { id: "imp-1", clientId: "silva", fileName: "extrato_maio.ofx", type: "OFX", competence: "2026-05", status: "Validado", owner: "Ana Ribeiro", result: "Fluxo de caixa atualizado" },
      { id: "imp-2", clientId: "clinica", fileName: "despesas_maio.csv", type: "CSV", competence: "2026-05", status: "Erro de colunas", owner: "Ana Ribeiro", result: "Solicitar novo arquivo" },
      { id: "imp-3", clientId: "prime", fileName: "xml_maio.zip", type: "XML", competence: "2026-05", status: "Aguardando revisao", owner: "Paula Martins", result: "Validar faturamento" }
    ],
    tasks: [
      { id: "tsk-1", clientId: "silva", title: "Revisar contratos administrativos", priority: "Alta", owner: "Bruno Andrade", due: "Hoje", status: "Em andamento" },
      { id: "tsk-2", clientId: "clinica", title: "Carregar extrato OFX recebido", priority: "Media", owner: "Ana Ribeiro", due: "26/05", status: "Aguardando MB" },
      { id: "tsk-3", clientId: "prime", title: "Publicar contrato social no portal", priority: "Alta", owner: "Lucas Pereira", due: "28/05", status: "Pendente" }
    ],
    approvals: [
      { id: "apr-1", clientId: "silva", title: "Parecer de capacidade de investimento", text: "O caixa suporta investimento moderado desde que a reserva minima seja preservada.", confidence: "Alta", competence: "2026-05", owner: "Bruno Andrade", status: "Aguardando aprovacao" },
      { id: "apr-2", clientId: "clinica", title: "Insight sobre crescimento de folha", text: "A folha representa 23,4% do faturamento e deve ser acompanhada no proximo fechamento.", confidence: "Media", competence: "2026-05", owner: "Ana Ribeiro", status: "Editar antes de liberar" }
    ],
    messages: [
      { id: "msg-1", clientId: "silva", from: "MB", text: "Seu relatorio financeiro de maio foi atualizado.", at: "Hoje, 10:10" },
      { id: "msg-2", clientId: "silva", from: "Cliente", text: "Vamos enviar o extrato complementar ainda hoje.", at: "Hoje, 10:28" }
    ],
    audit: [
      { id: "aud-1", at: "Hoje 10:42", user: "Bruno Andrade", action: "Aprovou parecer CFO", target: "Comercio Silva", result: "Insight publicado" },
      { id: "aud-2", at: "Hoje 09:58", user: "Ana Ribeiro", action: "Solicitou OFX", target: "Clinica Norte", result: "Pendencia criada" }
    ]
  };
})();
