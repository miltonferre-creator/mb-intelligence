const planOrder = ["contabilidade", "financeiro", "cfo"];

const planRules = {
  contabilidade: {
    label: "Contabilidade",
    price: "R$ 800",
    modulesSummary: "Documentos, guias, DAS, vencimentos e pendências simples",
    sla: "Até 5 dias úteis para rotinas documentais",
    shortLabel: "Cliente Contabilidade",
    pillClass: "status-neutral",
    profile: "Proprietário",
    modules: new Set(["dashboard", "actions", "plans", "documents", "upload_files", "das", "simple_pending", "notifications", "communication", "profile"]),
    dashboardTitle: "Rotina financeira e documental em um só lugar.",
    dashboardMessage:
      "Acompanhe documentos, guias, vencimentos, pendências operacionais e orientações disponibilizadas pela MB.",
    upgradeMessage:
      "A visualização respeita as permissões contratadas e a qualidade dos dados disponíveis.",
    chartKicker: "Rotina contábil",
    chartTitle: "Documentos, DAS e vencimentos",
    chartConfidence: "Acesso documental",
    insightTitle: "Avisos operacionais",
    metrics: {
      documents: ["18", "Fiscal, contábil e trabalhista", false, "MB: documentos essenciais estão centralizados e prontos para consulta."],
      das: ["R$ 13.240", "Vencimento 20/06/2026", false, "MB Fiscal: guia disponível, acompanhar vencimento para evitar atraso."],
      revenue: ["Bloqueado", "Requer dados e permissão", true, "MB: faturamento e evolução mensal aparecem quando a leitura gerencial está liberada."],
      payroll: ["Bloqueado", "Requer dados e permissão", true, "MB: folha, FGTS, INSS e pró-labore entram quando a visão gerencial está liberada."],
      dre: ["Bloqueado", "Disponível nos planos superiores", true, "MB: DRE exige dados financeiros organizados e plano superior."],
      cashflow: ["Bloqueado", "Exige dados financeiros", true, "IA MB: fluxo de caixa precisa de OFX, CSV ou integração bancária."],
      score: ["Bloqueado", "Requer validação executiva", true, "MB: o score completo depende de margem, caixa e validação consultiva."],
      investment: ["Bloqueado", "Requer validação executiva", true, "MB: capacidade de investimento exige validação executiva."],
    },
    insights: [
      ["Documentos e guias centralizados.", "O cliente acompanha DAS, vencimentos, obrigações e arquivos disponibilizados pela MB.", "Operação ativa", "confidence-medium"],
      ["Análise financeira não liberada neste plano.", "Dashboards, faturamento, DRE, fluxo de caixa e IA financeira aparecem como upgrade disponível.", "Upgrade", "confidence-low"],
      ["Bloqueio por regra comercial.", "O perfil do usuário não pode liberar módulos acima do plano contratado.", "Governança", "confidence-high"]
    ]
  },
  financeiro: {
    label: "Financeiro IA",
    price: "R$ 1.200",
    modulesSummary: "Dashboards automatizados, fiscal, folha, faturamento e IA básica",
    sla: "Até 3 dias úteis para análises simples",
    shortLabel: "Cliente Financeiro IA",
    pillClass: "status-warning",
    profile: "Gestor financeiro",
    modules: new Set([
      "dashboard",
      "actions",
      "plans",
      "documents",
      "upload_files",
      "notifications",
      "communication",
      "profile",
      "das",
      "fiscal",
      "payroll",
      "revenue",
      "financial_dashboard",
      "financial_ai",
      "data_quality",
      "reports_simple",
      "dre_basic",
      "cashflow_basic"
    ]),
    dashboardTitle: "Indicadores financeiros e leitura automática dos dados.",
    dashboardMessage:
      "Acompanhe faturamento, folha, fiscal, alertas, qualidade dos dados e observações automáticas a partir das informações disponíveis.",
    upgradeMessage:
      "A visualização respeita as permissões contratadas e a qualidade dos dados disponíveis.",
    chartKicker: "Visão gerencial automatizada",
    chartTitle: "Faturamento, impostos e folha",
    chartConfidence: "Base parcial",
    insightTitle: "Observações por IA",
    metrics: {
      documents: ["18", "Fiscal, contábil e trabalhista", false, "MB: documentação em dia melhora a confiabilidade das análises."],
      das: ["R$ 13.240", "Vencimento 20/06/2026", false, "IA MB: alíquota efetiva deve ser acompanhada no acumulado 12 meses."],
      revenue: ["R$ 186.420", "+12% vs. mês anterior", false, "IA MB: receita cresceu, validar se o crescimento veio de clientes recorrentes."],
      payroll: ["R$ 36.280", "19,4% do faturamento", false, "IA MB: folha está abaixo de 20% da receita, indicador sob controle."],
      dre: ["Parcial", "Prévia automática, sem parecer", false, "IA MB: DRE é uma leitura preliminar; parecer executivo exige CFO."],
      cashflow: ["Parcial", "Leitura de arquivos, sem validação CFO", false, "IA MB: caixa pode ser estimado, mas ainda sem validação consultiva."],
      score: ["Limitado", "Score completo no CFO", true, "Upgrade: score definitivo depende de margem, caixa e revisão MB."],
      investment: ["Bloqueado", "Requer validação executiva", true, "MB: simulação de investimento exige validação consultiva."],
    },
    insights: [
      ["O faturamento cresceu em relação ao mês anterior.", "Receita mensal subiu 12%, mantendo evolução positiva no período analisado.", "IA básica", "confidence-medium"],
      ["A alíquota efetiva do Simples aumentou.", "O indicador deve ser acompanhado junto ao faturamento acumulado dos últimos 12 meses.", "IA básica", "confidence-medium"],
      ["A análise de margem ainda não está disponível com segurança.", "Não há dados suficientes de despesas validadas para cálculo completo.", "Dados insuficientes", "confidence-low"]
    ]
  },
  cfo: {
    label: "CFO as a Service",
    price: "R$ 2.000",
    modulesSummary: "DRE validada, caixa completo, score, simulações, parecer MB e apoio consultivo",
    sla: "Agenda consultiva mensal e revisões executivas",
    shortLabel: "Cliente CFO",
    pillClass: "status-good",
    profile: "Proprietário",
    modules: new Set([
      "dashboard",
      "actions",
      "plans",
      "documents",
      "upload_files",
      "notifications",
      "communication",
      "profile",
      "das",
      "fiscal",
      "payroll",
      "revenue",
      "financial_dashboard",
      "financial_ai",
      "data_quality",
      "reports_simple",
      "dre",
      "cashflow",
      "score",
      "investment",
      "cfo",
      "reports_executive",
      "meetings",
      "mb_approval"
    ]),
    dashboardTitle: "Cockpit financeiro para decisão executiva.",
    dashboardMessage:
      "Acompanhe DRE, fluxo de caixa, margem, score, simulações, recomendações e análises validadas pela MB.",
    upgradeMessage:
      "A visualização respeita as permissões contratadas e a qualidade dos dados disponíveis.",
    chartKicker: "Evolução mensal",
    chartTitle: "Receita, despesas e caixa",
    chartConfidence: "Base validada",
    insightTitle: "Análise executiva MB",
    metrics: {
      documents: ["18", "Fiscal, contábil e trabalhista", false, "MB: base documental validada sustenta a leitura executiva."],
      das: ["R$ 13.240", "Vencimento 20/06/2026", false, "MB Fiscal: imposto previsto está coerente com o faturamento do mês."],
      revenue: ["R$ 186.420", "+12% vs. mês anterior", false, "IA MB: crescimento bom; MB recomenda medir concentração da receita."],
      payroll: ["R$ 36.280", "19,4% do faturamento", false, "MB Trabalhista: folha sob controle, acompanhar novas contratações."],
      dre: ["R$ 40.310", "Resultado validado pela MB", false, "MB CFO: resultado positivo, mas margem exige proteção de despesas fixas."],
      cashflow: ["R$ 84.600", "42 dias de fôlego validado", false, "IA MB: caixa saudável para operação, investimento só com cenário moderado."],
      score: ["78", "Saudável", false, "MB: score saudável com atenção em margem e dependência de clientes-chave."],
      investment: ["R$ 32.000", "Após caixa mínimo", false, "MB CFO: investimento seguro até este limite, após reserva mínima."],
    },
    insights: [
      ["As despesas cresceram acima da receita.", "A MB deve revisar contratos recorrentes e despesas operacionais antes do próximo fechamento.", "Alta", "confidence-high"],
      ["A empresa gerou caixa positivo.", "O caixa suporta compromissos imediatos, mas investimento novo exige simulação e validação MB.", "Média", "confidence-medium"],
      ["Parecer consultivo em fluxo de aprovação.", "A IA apoia a leitura, mas a recomendação estratégica só é liberada após revisão humana.", "Governança MB", "confidence-high"]
    ]
  }
};

const moduleAliases = {
  dashboard: ["dashboard"],
  actions: ["actions"],
  plans: ["plans"],
  documents: ["documents"],
  notifications: ["notifications", "simple_pending"],
  communication: ["communication"],
  profile: ["profile"],
  upload_files: ["upload_files", "documents"],
  das: ["das"],
  revenue: ["revenue"],
  payroll: ["payroll"],
  financial_ai: ["financial_ai"],
  data_quality: ["data_quality"],
  dre: ["dre", "dre_basic"],
  cashflow: ["cashflow", "cashflow_basic"],
  score: ["score"],
  investment: ["investment"],
  cfo: ["cfo"]
};

const accessRows = [
  ["Documentos", "Sim", "Sim", "Sim", "yes"],
  ["Guias e DAS", "Sim", "Sim", "Sim", "yes"],
  ["Pendências e notificações", "Simples", "Completas", "Completas + SLA consultivo", "limited"],
  ["Comunicação com a MB", "Sim", "Sim", "Sim + consultor CFO", "limited"],
  ["Onboarding e perfil", "Sim", "Sim", "Sim", "yes"],
  ["Fiscal", "Básico", "Completo", "Completo", "limited"],
  ["Trabalhista", "Documentos", "Folha e encargos", "Folha e encargos", "limited"],
  ["Faturamento", "Não", "Sim", "Sim", "mixed"],
  ["Dashboard financeiro", "Não", "Sim", "Sim", "mixed"],
  ["Observações IA", "Não", "Básicas", "Avançadas", "mixed"],
  ["DRE", "Não", "Prévia automática, se houver dados", "Completa, validada e comentada pela MB", "mixed"],
  ["Fluxo de caixa", "Não", "Prévia por OFX/CSV/Excel", "Completo, conciliado e validado", "mixed"],
  ["Score financeiro", "Não", "Não definitivo", "MB Financial Score completo", "mixed"],
  ["Capacidade de investimento", "Não", "Não", "Sim", "mixed"],
  ["CFO consultivo", "Não", "Não", "Sim", "mixed"],
  ["Simulações gerenciais", "Não", "Não", "Sim", "mixed"],
  ["Plano de ação consultivo", "Não", "Não", "Sim", "mixed"],
  ["Relatórios executivos", "Não", "Simples e automatizados", "Completos e validados", "mixed"],
  ["Reuniões", "Não", "Não", "Sim", "mixed"],
  ["Parecer MB", "Não", "Não", "Sim", "mixed"]
];

const loginScreen = document.querySelector("[data-login-screen]");
const purchaseScreen = document.querySelector("[data-purchase-screen]");
const appShell = document.querySelector("[data-app-shell]");
const loginForm = document.querySelector("[data-login-form]");
const purchaseForm = document.querySelector("[data-purchase-form]");
const uploadForm = document.querySelector("[data-upload-form]");
const adminClientForm = document.querySelector("[data-admin-client-form]");
const priceForm = document.querySelector("[data-price-form]");
const mbPublishForm = document.querySelector("[data-mb-publish-form]");
const clientNav = document.querySelector("[data-client-nav]");
const adminNav = document.querySelector("[data-admin-nav]");
const sidebarContext = document.querySelector("[data-sidebar-context]");
const sidebarPlan = document.querySelector("[data-sidebar-plan]");
const environmentTitle = document.querySelector("[data-environment-title]");
const contextLabelPrimary = document.querySelector("[data-context-label-primary]");
const contextLabelSecondary = document.querySelector("[data-context-label-secondary]");
const currentPlanLabel = document.querySelector("[data-current-plan-label]");
const currentProfile = document.querySelector("[data-current-profile]");
const loginOperatorSelect = document.querySelector("[data-login-operator]");
const loginOrganizationSelect = document.querySelector("[data-login-organization]");
const planPill = document.querySelector("[data-plan-pill]");
const dashboardTitle = document.querySelector("[data-dashboard-title]");
const dashboardMessage = document.querySelector("[data-dashboard-message]");
const upgradeMessage = document.querySelector("[data-upgrade-message] p");
const chartKicker = document.querySelector("[data-chart-kicker]");
const chartTitle = document.querySelector("[data-chart-title]");
const chartConfidence = document.querySelector("[data-chart-confidence]");
const insightTitle = document.querySelector("[data-insight-title]");
const dashboardInsights = document.querySelector("[data-dashboard-insights]");
const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const logoutButton = document.querySelector("[data-logout]");
const planDemoButtons = document.querySelectorAll("[data-plan-demo]");
const planCards = document.querySelectorAll("[data-plan-card]");
const accessMatrix = document.querySelector("[data-access-matrix]");
const adminAccessMatrix = document.querySelector("[data-admin-access-matrix]");
const selectedPlanLabel = document.querySelector("[data-selected-plan-label]");
const selectedPlanName = document.querySelector("[data-selected-plan-name]");
const selectedPlanPrice = document.querySelector("[data-selected-plan-price]");
const selectedPayment = document.querySelector("[data-selected-payment]");
const purchaseResult = document.querySelector("[data-purchase-result]");
const uploadResult = document.querySelector("[data-upload-result]");
const adminClientResult = document.querySelector("[data-admin-client-result]");
const priceResult = document.querySelector("[data-price-result]");
const mbPublishResult = document.querySelector("[data-mb-publish-result]");
const dashboardPublishResult = document.querySelector("[data-dashboard-publish-result]");
const cfoOnlyBlocks = document.querySelectorAll("[data-cfo-only]");
const nonCfoNotes = document.querySelectorAll("[data-non-cfo-note]");
const adminSelectedPlan = document.querySelector("[data-admin-selected-plan]");
const adminSelectedModules = document.querySelector("[data-admin-selected-modules]");
const adminSelectedSla = document.querySelector("[data-admin-selected-sla]");

const adminOperators = {
  master: { name: "Marcos Lima", role: "Administrador master", initials: "ML" },
  operacional: { name: "Carla Souza", role: "Gestora operacional", initials: "CS" },
  fiscal: { name: "Paula Martins", role: "Fiscal", initials: "PM" },
  trabalhista: { name: "Renata Alves", role: "Trabalhista", initials: "RA" },
  financeiro: { name: "Ana Ribeiro", role: "Analista financeiro", initials: "AR" },
  cfo: { name: "Bruno Andrade", role: "Consultor CFO", initials: "BA" },
  atendimento: { name: "Lucas Pereira", role: "Atendimento", initials: "LP" }
};

const dashboardShowcaseContent = {
  contabilidade: {
    title: "Rotina documental do mês",
    confidence: "Acesso documental",
    legend: ["Documentos publicados", "Guias e DAS", "Pendências simples"],
    intelligenceTitle: "MB Operacional",
    intelligence:
      "A base documental está organizada. Para ampliar a leitura financeira, a plataforma depende de mais fontes de dados e permissões liberadas.",
    kpis: [
      ["Documentos", "18", "6 novos"],
      ["DAS", "R$ 13.240", "20/06"],
      ["Pendências", "3", "simples"],
      ["Evolução", "Mais dados", "disponível"]
    ],
    cards: [
      ["74%", "Documentos", "18 arquivos", "MB: documentos fiscais, contábeis e trabalhistas estão centralizados.", "74%"],
      ["68%", "DAS e guias", "R$ 13.240", "MB Fiscal: guia disponível; foco é acompanhar vencimento.", "68%"],
      ["42d", "Pendências", "3 abertas", "IA MB: enviar arquivos pendentes melhora a organização da competência.", "42%"],
      ["UP", "Próxima evolução", "Mais leitura", "MB: dashboards e análises automáticas entram quando os dados e permissões estão liberados.", "38%"]
    ]
  },
  financeiro: {
    title: "Dashboard financeiro automatizado",
    confidence: "Base parcial",
    legend: ["Faturamento em alta", "Despesas em leitura parcial", "Caixa sem validação CFO"],
    intelligenceTitle: "IA MB",
    intelligence:
      "A leitura automatizada mostra crescimento de faturamento e alertas fiscais. DRE validada, score definitivo, simulações e parecer MB dependem de validação executiva.",
    kpis: [
      ["Faturamento", "R$ 186.420", "+12%"],
      ["Folha", "R$ 36.280", "19,4%"],
      ["Caixa", "Parcial", "OFX/CSV"],
      ["DRE", "Prévia", "sem parecer"]
    ],
    cards: [
      ["+12%", "Faturamento", "R$ 186.420", "IA MB: receita cresceu, validar se veio de clientes recorrentes.", "74%"],
      ["19%", "Folha", "R$ 36.280", "IA MB: folha está sob controle em relação ao faturamento.", "54%"],
      ["PX", "Caixa", "Prévia parcial", "IA MB: análise depende de extrato completo ou banco conectado.", "48%"],
      ["IA", "Observações", "Automáticas", "MB: recomendações estratégicas exigem validação consultiva.", "58%"]
    ]
  },
  cfo: {
    title: "Resultado do mês em destaque",
    confidence: "Base validada pela MB",
    legend: ["Receita em aceleração", "Despesas pressionando margem", "Caixa positivo, mas exige proteção"],
    intelligenceTitle: "IA MB + Parecer MB",
    intelligence:
      "O crescimento de receita é positivo, mas as despesas cresceram em ritmo superior. A recomendação MB é revisar contratos recorrentes antes de aprovar novos investimentos.",
    kpis: [
      ["Faturamento", "R$ 186.420", "+12%"],
      ["Resultado", "R$ 40.310", "21,6%"],
      ["Caixa", "R$ 84.600", "42 dias"],
      ["Score", "78", "Saudável"]
    ],
    cards: [
      ["+12%", "Faturamento", "R$ 186.420", "IA MB: crescimento saudável, com atenção à concentração em poucos clientes.", "74%"],
      ["68%", "Despesas", "R$ 132.870", "MB: despesas subiram acima da receita; revisar despesas administrativas.", "68%"],
      ["42d", "Caixa", "R$ 84.600", "IA MB: caixa sustenta operação, mas investimento depende de reserva mínima.", "58%"],
      ["78", "MB Financial Score", "Saudável", "MB: score bom; principal atenção está na margem e qualidade do caixa.", "78%"]
    ]
  }
};

let currentMode = "client";
let currentPlan = "cfo";
let purchasePlan = "financeiro";
let adminPlan = "financeiro";
let currentAdminOperator = "master";
let currentAdminOrganization = "MB Assessoria Empresarial";

function hasModule(moduleName) {
  const aliases = moduleAliases[moduleName] || [moduleName];
  const modules = planRules[currentPlan].modules;
  return aliases.some((alias) => modules.has(alias));
}

function setHidden(element, isHidden) {
  element?.classList.toggle("is-hidden", isHidden);
}

function loadStoredPlanPrices() {
  try {
    const stored = JSON.parse(window.localStorage.getItem("mbPlanPrices") || "{}");
    Object.entries(stored).forEach(([key, price]) => {
      if (planRules[key] && typeof price === "string") {
        planRules[key].price = price;
      }
    });
  } catch {
    window.localStorage.removeItem("mbPlanPrices");
  }
}

function savePlanPrices() {
  const prices = Object.fromEntries(
    Object.entries(planRules).map(([key, plan]) => [key, plan.price])
  );
  window.localStorage.setItem("mbPlanPrices", JSON.stringify(prices));
}

function scrollPageTop() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showLogin() {
  setHidden(loginScreen, false);
  setHidden(purchaseScreen, true);
  setHidden(appShell, true);
  scrollPageTop();
}

function showPurchase() {
  setHidden(loginScreen, true);
  setHidden(purchaseScreen, false);
  setHidden(appShell, true);
  selectPurchasePlan(purchasePlan);
  scrollPageTop();
  window.lucide?.createIcons();
}

function selectPurchasePlan(planKey) {
  const plan = planRules[planKey];
  if (!plan) return;

  purchasePlan = planKey;
  document.querySelectorAll("[data-purchase-plan-card]").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.purchasePlanCard === planKey);
  });

  document.querySelectorAll("[data-select-purchase-plan]").forEach((button) => {
    const selected = button.dataset.selectPurchasePlan === planKey;
    button.classList.toggle("btn-primary", selected);
    button.classList.toggle("btn-light", !selected);
    button.textContent = selected ? "Selecionado" : "Selecionar";
  });

  if (selectedPlanLabel) selectedPlanLabel.textContent = plan.label;
  if (selectedPlanName) selectedPlanName.textContent = plan.label;
  if (selectedPlanPrice) selectedPlanPrice.textContent = plan.price;
}

function refreshPlanPrices() {
  Object.entries(planRules).forEach(([key, plan]) => {
    document.querySelectorAll(`[data-plan-price-display="${key}"]`).forEach((element) => {
      element.textContent = plan.price;
    });
    document.querySelectorAll(`[data-admin-plan-price="${key}"]`).forEach((element) => {
      element.textContent = plan.price;
    });
    document.querySelectorAll(`[data-plan-price-input="${key}"]`).forEach((input) => {
      input.value = plan.price;
    });
  });

  selectPurchasePlan(purchasePlan);
  selectAdminPlan(adminPlan);
}

function selectPayment(method) {
  const label = method === "card" ? "Cartão de crédito" : "Pix";
  document.querySelectorAll("[data-payment-method]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.paymentMethod === method);
  });
  document.querySelectorAll("[data-payment-panel]").forEach((panel) => {
    setHidden(panel, panel.dataset.paymentPanel !== method);
  });
  if (selectedPayment) selectedPayment.textContent = label;
}

function selectAdminPlan(planKey) {
  const plan = planRules[planKey];
  if (!plan) return;

  adminPlan = planKey;

  document.querySelectorAll("[data-admin-plan-choice]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminPlanChoice === planKey);
  });

  if (adminSelectedPlan) adminSelectedPlan.textContent = `${plan.label} - ${plan.price}`;
  if (adminSelectedModules) adminSelectedModules.textContent = plan.modulesSummary;
  if (adminSelectedSla) adminSelectedSla.textContent = plan.sla;
}

function getCellClass(value) {
  const normalized = value.toLowerCase();
  if (normalized === "sim" || normalized.includes("completo") || normalized.includes("avançada")) return "yes";
  if (normalized === "não") return "no";
  return "limited";
}

function renderAccessMatrix(target) {
  if (!target) return;

  const rows = accessRows
    .map(([module, contabilidade, financeiro, cfo]) => {
      return `
        <div class="matrix-row">
          <div>${module}</div>
          <div class="${getCellClass(contabilidade)}">${contabilidade}</div>
          <div class="${getCellClass(financeiro)}">${financeiro}</div>
          <div class="${getCellClass(cfo)}">${cfo}</div>
        </div>
      `;
    })
    .join("");

  target.innerHTML = `
    <div class="matrix-row header">
      <div>Módulo</div>
      <div>Contabilidade</div>
      <div>Financeiro IA</div>
      <div>CFO as a Service</div>
    </div>
    ${rows}
  `;
}

function setActiveView(viewName) {
  const protectedAdminView = viewName.startsWith("admin-");
  const unifiedFinancialViews = new Set(["acoes-timeline", "financeiro-ia", "cfo-service", "qualidade-dados"]);
  const clientOnlyViews = new Set([
    "dashboard-cliente",
    "acoes-timeline",
    "planos-cliente",
    "documentos-guias",
    "envio-arquivos",
    "financeiro-ia",
    "cfo-service",
    "qualidade-dados",
    "pendencias-notificacoes",
    "comunicacao-mb",
    "perfil-cliente"
  ]);

  if (currentMode === "client" && unifiedFinancialViews.has(viewName)) {
    viewName = "dashboard-cliente";
  }

  if (currentMode === "client" && protectedAdminView) {
    viewName = "planos-cliente";
  }

  if (currentMode === "admin" && clientOnlyViews.has(viewName)) {
    viewName = viewName === "pendencias-notificacoes" ? "admin-operacao" : "admin-cockpit";
  }

  views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === viewName);
  });

  viewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === viewName);
  });

  scrollPageTop();
  window.requestAnimationFrame(scrollPageTop);
  window.setTimeout(scrollPageTop, 40);
}

function updateMetricCards(plan) {
  Object.entries(plan.metrics).forEach(([moduleName, values]) => {
    const card = document.querySelector(`[data-module-card="${moduleName}"]`);
    if (!card) return;

    const [value, detail, locked, analysis] = values;
    const strong = card.querySelector("strong");
    const em = card.querySelector("em");
    let analysisElement = card.querySelector(".metric-analysis");

    if (strong) strong.textContent = value;
    if (em) {
      em.textContent = detail;
      em.classList.toggle("good", detail.includes("+") || detail.includes("Saudável") || detail.includes("Resultado"));
      em.classList.toggle("warning", detail.includes("Exige") || detail.includes("Limitado"));
    }

    if (!analysisElement) {
      analysisElement = document.createElement("p");
      analysisElement.className = "metric-analysis";
      card.appendChild(analysisElement);
    }
    analysisElement.textContent = analysis || "";

    const allowed = hasModule(moduleName);
    card.classList.toggle("is-locked", Boolean(locked) || !allowed);
  });
}

function updateDashboardInsights(plan) {
  if (!dashboardInsights) return;

  dashboardInsights.innerHTML = plan.insights
    .map(([title, copy, badge, badgeClass]) => {
      return `
        <div class="insight-item">
          <strong>${title}</strong>
          <p>${copy}</p>
          <span class="confidence ${badgeClass}">${badge}</span>
        </div>
      `;
    })
    .join("");
}

function updateDashboardShowcase() {
  const content = dashboardShowcaseContent[currentPlan];
  const showcase = document.querySelector(".dashboard-showcase");
  if (!content || !showcase) return;

  const title = showcase.querySelector(".showcase-main-chart .card-heading h3");
  const confidence = showcase.querySelector(".showcase-main-chart .confidence");
  const kpiCards = showcase.querySelectorAll(".showcase-kpis div");
  const legendItems = showcase.querySelectorAll(".chart-analysis-row span");
  const intelligenceTitle = showcase.querySelector(".result-intelligence strong");
  const intelligenceCopy = showcase.querySelector(".result-intelligence span");
  const resultCards = showcase.querySelectorAll(".result-cards article");

  if (title) title.textContent = content.title;
  if (confidence) confidence.textContent = content.confidence;
  if (intelligenceTitle) intelligenceTitle.textContent = content.intelligenceTitle;
  if (intelligenceCopy) intelligenceCopy.textContent = content.intelligence;

  kpiCards.forEach((card, index) => {
    const [label, value, detail] = content.kpis[index] || [];
    const span = card.querySelector("span");
    const strong = card.querySelector("strong");
    const em = card.querySelector("em");
    if (span) span.textContent = label || "";
    if (strong) strong.textContent = value || "";
    if (em) em.textContent = detail || "";
  });

  legendItems.forEach((item, index) => {
    const dot = item.querySelector("i");
    item.textContent = content.legend[index] || "";
    if (dot) item.prepend(dot);
  });

  resultCards.forEach((card, index) => {
    const [badge, label, value, analysis, level] = content.cards[index] || [];
    const ring = card.querySelector(".result-ring");
    const ringStrong = card.querySelector(".result-ring strong");
    const spark = card.querySelector(".mini-spark");
    const miniLabel = card.querySelector(".mini-label");
    const h3 = card.querySelector("h3");
    const p = card.querySelector("p");

    if (ring) ring.style.setProperty("--ring", level || "50%");
    if (spark) spark.style.setProperty("--spark", level || "50%");
    if (ringStrong) ringStrong.textContent = badge || "";
    if (miniLabel) miniLabel.textContent = label || "";
    if (h3) h3.textContent = value || "";
    if (p) p.innerHTML = `<strong>${analysis?.split(":")[0] || "IA MB"}:</strong>${analysis?.includes(":") ? analysis.slice(analysis.indexOf(":") + 1) : ` ${analysis || ""}`}`;
  });

  showcase.classList.toggle("is-documental", currentPlan === "contabilidade");
  showcase.classList.toggle("is-automated", currentPlan === "financeiro");
}

function updateFinancialLayers() {
  const layerOrder = { contabilidade: 1, financeiro: 2, cfo: 3 };
  const currentLevel = layerOrder[currentPlan] || 1;
  const status = document.querySelector("[data-plan-layer-status]");

  document.querySelectorAll("[data-plan-layer]").forEach((layer) => {
    const layerName = layer.dataset.planLayer;
    const layerLevel = layerOrder[layerName] || 1;
    const isActive = layerLevel <= currentLevel;
    const isCurrent = layerName === currentPlan;
    const label = layer.querySelector("strong");

    layer.classList.toggle("is-active", isActive);
    layer.classList.toggle("is-current", isCurrent);
    layer.classList.toggle("is-locked", !isActive);

    if (label) {
      if (isCurrent) label.textContent = "Atual";
      else label.textContent = isActive ? "Incluído" : "Upgrade disponível";
    }
  });

  if (status) {
    const activeCount = currentLevel;
    status.textContent = `${activeCount} de 3 camadas liberadas`;
  }
}

function updateLockedViews() {
  document.querySelectorAll("[data-required-module]").forEach((view) => {
    const moduleName = view.dataset.requiredModule;
    const allowed = hasModule(moduleName);
    const lockedState = view.querySelector(`[data-locked-view="${moduleName}"]`);
    const content = view.querySelector(`[data-module-content="${moduleName}"]`);

    setHidden(lockedState, allowed);
    setHidden(content, !allowed);
  });
}

function updateCfoVisibility() {
  const isCfoClient = currentMode === "client" && currentPlan === "cfo";
  cfoOnlyBlocks.forEach((block) => setHidden(block, !isCfoClient));
  nonCfoNotes.forEach((block) => setHidden(block, isCfoClient || currentMode !== "client"));
}

function updateNavigation() {
  document.querySelectorAll("[data-module]").forEach((item) => {
    const moduleName = item.dataset.module;
    const locked = currentMode === "client" && !hasModule(moduleName);
    item.classList.toggle("is-locked", locked);
    item.toggleAttribute("data-locked", locked);
    item.removeAttribute("aria-disabled");
  });
}

function updatePlansUI() {
  const plan = planRules[currentPlan];
  const operator = adminOperators[currentAdminOperator] || adminOperators.master;

  planDemoButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.planDemo === currentPlan);
  });

  planCards.forEach((card) => {
    const isCurrent = card.dataset.planCard === currentPlan;
    card.classList.toggle("is-current", isCurrent);
  });

  if (contextLabelPrimary) contextLabelPrimary.textContent = currentMode === "admin" ? "Empresa / carteira" : "Empresa";
  if (contextLabelSecondary) contextLabelSecondary.textContent = currentMode === "admin" ? "Operador MB" : "Perfil";
  if (currentPlanLabel) currentPlanLabel.textContent = currentMode === "admin" ? currentAdminOrganization : "Comércio Silva LTDA";
  if (currentProfile) currentProfile.textContent = currentMode === "admin" ? `${operator.name} · ${operator.role}` : plan.profile;
  if (sidebarContext) sidebarContext.textContent = currentMode === "admin" ? operator.name : plan.shortLabel;
  if (sidebarPlan) sidebarPlan.textContent = currentMode === "admin" ? `${operator.role} | ${currentAdminOrganization}` : plan.label;

  if (planPill) {
    planPill.textContent = plan.label;
    planPill.className = `status-pill ${plan.pillClass}`;
  }

  if (dashboardTitle) dashboardTitle.textContent = plan.dashboardTitle;
  if (dashboardMessage) dashboardMessage.textContent = plan.dashboardMessage;
  if (upgradeMessage) upgradeMessage.textContent = plan.upgradeMessage;
  if (chartKicker) chartKicker.textContent = plan.chartKicker;
  if (chartTitle) chartTitle.textContent = plan.chartTitle;
  if (chartConfidence) chartConfidence.textContent = plan.chartConfidence;
  if (insightTitle) insightTitle.textContent = plan.insightTitle;

  updateMetricCards(plan);
  updateDashboardInsights(plan);
  updateDashboardShowcase();
  updateFinancialLayers();
  updateNavigation();
  updateLockedViews();
  updateCfoVisibility();
}

const reportCsvData = {
  dre: [
    ["Conta gerencial", "Valor", "% Receita", "Análise MB"],
    ["Receita líquida", "R$ 186.420", "100%", "Receita em crescimento no mês"],
    ["Custos variáveis", "R$ 92.560", "49,6%", "Pressão moderada sobre margem bruta"],
    ["Despesas administrativas", "R$ 40.310", "21,6%", "Revisar contratos recorrentes"],
    ["Resultado operacional", "R$ 40.310", "21,6%", "Resultado positivo, com atenção a despesas fixas"]
  ],
  cashflow: [
    ["Movimento", "Valor", "Status", "Análise MB"],
    ["Saldo inicial", "R$ 61.800", "Validado", "Base conciliada com OFX"],
    ["Entradas operacionais", "R$ 192.800", "Conciliado", "Recebimentos concentrados nos maiores clientes"],
    ["Saídas operacionais", "R$ 170.000", "Conciliado", "Despesas administrativas em atenção"],
    ["Saldo projetado", "R$ 95.600", "Projetado", "Caixa positivo, preservar reserva mínima"]
  ]
};

function printReport(reportName) {
  document.body.classList.add("is-printing-report", `is-printing-${reportName}`);
  window.print();
  window.setTimeout(() => {
    document.body.classList.remove("is-printing-report", `is-printing-${reportName}`);
  }, 400);
}

function exportReport(reportName) {
  const rows = reportCsvData[reportName] || [];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = reportName === "dre" ? "MB_DRE_Gerencial_Maio_2026.csv" : "MB_Fluxo_de_Caixa_Maio_2026.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setMode(mode, plan = currentPlan) {
  currentMode = mode;
  currentPlan = plan;

  setHidden(loginScreen, true);
  setHidden(purchaseScreen, true);
  setHidden(appShell, false);
  setHidden(clientNav, mode !== "client");
  setHidden(adminNav, mode !== "admin");

  if (environmentTitle) {
    environmentTitle.textContent = mode === "admin" ? "Administração Operacional e Governança MB" : "Portal do cliente";
  }

  updatePlansUI();
  setActiveView(mode === "admin" ? "admin-cockpit" : "dashboard-cliente");
  window.lucide?.createIcons();
}

function inferLogin(email) {
  const normalized = email.toLowerCase();

  if (normalized.includes("@mb") || normalized.includes("admin") || normalized.includes("mbempresas")) {
    return { mode: "admin", plan: "cfo" };
  }

  if (normalized.includes("contabilidade")) return { mode: "client", plan: "contabilidade" };
  if (normalized.includes("financeiro")) return { mode: "client", plan: "financeiro" };
  return { mode: "client", plan: "cfo" };
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "");
  const operator = String(formData.get("operator") || "master");
  const organization = String(formData.get("organization") || "MB Assessoria Empresarial");
  const login = inferLogin(email);
  if (login.mode === "admin") {
    currentAdminOperator = adminOperators[operator] ? operator : "master";
    currentAdminOrganization = organization;
  }
  setMode(login.mode, login.plan);
});

document.querySelectorAll("[data-demo-email]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = loginForm?.querySelector('input[name="email"]');
    if (input) input.value = button.dataset.demoEmail;
    if (button.dataset.demoOperator && loginOperatorSelect) {
      loginOperatorSelect.value = button.dataset.demoOperator;
    }
    if (button.dataset.demoOrganization && loginOrganizationSelect) {
      loginOrganizationSelect.value = button.dataset.demoOrganization;
    }
  });
});

document.querySelectorAll("[data-open-purchase]").forEach((button) => {
  button.addEventListener("click", showPurchase);
});

document.querySelectorAll("[data-back-login]").forEach((button) => {
  button.addEventListener("click", showLogin);
});

document.querySelectorAll("[data-select-purchase-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    selectPurchasePlan(button.dataset.selectPurchasePlan);
  });
});

document.querySelectorAll("[data-payment-method]").forEach((button) => {
  button.addEventListener("click", () => {
    selectPayment(button.dataset.paymentMethod);
  });
});

document.querySelectorAll("[data-admin-plan-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    selectAdminPlan(button.dataset.adminPlanChoice);
  });
});

viewLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveView(link.dataset.viewLink);
  });
});

planDemoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPlan = button.dataset.planDemo;
    updatePlansUI();
  });
});

document.querySelectorAll(".doc-filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".doc-filter").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
  });
});

logoutButton?.addEventListener("click", () => {
  showLogin();
  setActiveView("dashboard-cliente");
});

purchaseForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setHidden(purchaseResult, false);
});

uploadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setHidden(uploadResult, false);
});

adminClientForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setHidden(adminClientResult, false);
});

priceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelectorAll("[data-plan-price-input]").forEach((input) => {
    const key = input.dataset.planPriceInput;
    if (planRules[key]) {
      planRules[key].price = input.value.trim() || planRules[key].price;
    }
  });
  savePlanPrices();
  refreshPlanPrices();
  setHidden(priceResult, false);
});

mbPublishForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setHidden(mbPublishResult, false);
});

document.querySelectorAll("[data-publish-dashboard]").forEach((button) => {
  button.addEventListener("click", () => {
    setHidden(dashboardPublishResult, false);
  });
});

document.querySelectorAll("[data-print-report]").forEach((button) => {
  button.addEventListener("click", () => {
    printReport(button.dataset.printReport);
  });
});

document.querySelectorAll("[data-export-report]").forEach((button) => {
  button.addEventListener("click", () => {
    exportReport(button.dataset.exportReport);
  });
});

loadStoredPlanPrices();
renderAccessMatrix(accessMatrix);
renderAccessMatrix(adminAccessMatrix);
refreshPlanPrices();
selectPayment("pix");
updatePlansUI();
window.lucide?.createIcons();
