const plans = {
  contabilidade: {
    name: "Contabilidade",
    price: 800,
    tagline: "Organização contábil, documentos e guias em um só lugar.",
    modules: ["Documentos", "Guias", "DAS", "Pendências", "Avisos"],
    color: "status-warning"
  },
  financeiro: {
    name: "Financeiro IA",
    price: 1200,
    tagline: "Dashboards, faturamento, folha, fiscal e análises automáticas.",
    modules: ["Documentos", "Fiscal", "Folha", "Faturamento", "IA básica", "Relatórios simples"],
    color: "status-ok"
  },
  cfo: {
    name: "CFO as a Service",
    price: 2000,
    tagline: "Análise executiva, DRE, caixa, score e apoio consultivo.",
    modules: ["Todos os módulos", "DRE", "Fluxo de caixa", "Score", "Parecer MB", "Reuniões CFO"],
    color: "status-danger"
  }
};

const permissionMatrix = [
  ["Documentos e guias", "Sim", "Sim", "Sim", "Base do portal"],
  ["Faturamento e fiscal", "Básico", "Completo", "Completo", "Plano + dados fiscais"],
  ["Folha e trabalhista", "Documentos", "Folha e encargos", "Folha e encargos", "Plano + aplicabilidade"],
  ["Dashboard financeiro", "Não", "Sim", "Sim", "Plano"],
  ["DRE", "Não", "Básica se houver dados", "Completa e validada", "Plano + qualidade dos dados"],
  ["Fluxo de caixa", "Não", "Básico se houver dados", "Completo e validado", "Plano + extratos"],
  ["IA", "Não", "Observações automáticas", "Executiva + validação MB", "Plano + aprovação"],
  ["Score financeiro", "Não", "Limitado/futuro", "Sim", "Plano CFO"],
  ["Capacidade de investimento", "Não", "Não", "Sim", "Plano CFO + dados validados"],
  ["CFO consultivo", "Não", "Não", "Sim", "Plano CFO"]
];

const STORAGE_KEY = "mb-intelligence-produto-final-v1";

const clients = [
  {
    id: "silva",
    name: "Comércio Silva LTDA",
    cnpj: "12.481.900/0001-41",
    city: "Fortaleza/CE",
    segment: "Comércio varejista",
    plan: "cfo",
    maturity: "CFO validado",
    status: "Ativo",
    owner: "Marcos Silva",
    consultant: "Bruno Andrade",
    financialAnalyst: "Ana Ribeiro",
    revenue: 182500,
    expenses: 142190,
    result: 40310,
    cash: 84600,
    margin: 22.1,
    taxes: 13880,
    payroll: 31200,
    score: 82,
    operationalScore: 76,
    runway: 42,
    investmentCapacity: 52000,
    confidence: "Alta",
    lastAccess: "Hoje, 09:12",
    dre: [
      ["Receita bruta", 182500, "100%"],
      ["Impostos e deduções", -13880, "7,6%"],
      ["Custos diretos", -72100, "39,5%"],
      ["Despesas operacionais", -56210, "30,8%"],
      ["Resultado gerencial", 40310, "22,1%"]
    ],
    cashBridge: [
      ["Saldo inicial", 60200, "base"],
      ["Recebimentos", 126000, "positive"],
      ["Pagamentos", -86400, "negative"],
      ["Impostos", -15200, "negative"],
      ["Saldo projetado", 84600, "positive"]
    ],
    months: [
      ["Jan", 132, 101],
      ["Fev", 141, 108],
      ["Mar", 154, 116],
      ["Abr", 166, 127],
      ["Mai", 183, 142],
      ["Jun", 188, 148]
    ],
    revenueMix: [
      ["Cliente A", 34],
      ["Cliente B", 22],
      ["Cliente C", 14],
      ["Demais", 30]
    ],
    insights: [
      "A margem melhorou 2,4 pontos em maio, mas despesas administrativas ainda pressionam o resultado.",
      "O caixa suporta investimento moderado sem comprometer a reserva mínima de 45 dias.",
      "A concentração de receita exige acompanhamento: dois clientes representam 56% do faturamento."
    ],
    priorities: [
      ["high", "Revisar contratos administrativos", "Impacto estimado de R$ 8.400/mês"],
      ["medium", "Validar categorias sem classificação", "14 lançamentos aguardam revisão"],
      ["low", "Atualizar projeção de investimento", "Simulação pronta para aprovação MB"]
    ],
    timeline: [
      ["Hoje", "DRE de maio validada pela MB e liberada para relatório."],
      ["Ontem", "IA MB sugeriu revisão de despesas administrativas recorrentes."],
      ["21/05", "Fluxo de caixa atualizado com OFX de maio."],
      ["18/05", "Reunião CFO registrada com plano de ação executivo."]
    ],
    documents: [
      ["DAS Maio/2026", "Fiscal", "Disponível", "20/06/2026"],
      ["DRE Gerencial Maio/2026", "Financeiro", "Aprovado", "Publicado hoje"],
      ["Fluxo de Caixa Maio/2026", "Financeiro", "Aprovado", "Publicado hoje"],
      ["Folha Maio/2026", "Trabalhista", "Disponível", "05/06/2026"]
    ]
  },
  {
    id: "clinica",
    name: "Clínica Norte PME",
    cnpj: "28.610.772/0001-08",
    city: "Natal/RN",
    segment: "Saúde",
    plan: "financeiro",
    maturity: "Financeiro integrado",
    status: "Ativo",
    owner: "Dra. Camila Norte",
    consultant: "Ana Ribeiro",
    financialAnalyst: "Ana Ribeiro",
    revenue: 96500,
    expenses: 70300,
    result: 26200,
    cash: 38600,
    margin: 18.8,
    taxes: 7640,
    payroll: 22600,
    score: 68,
    operationalScore: 71,
    runway: 26,
    investmentCapacity: 0,
    confidence: "Média",
    lastAccess: "Ontem, 17:44",
    dre: [],
    cashBridge: [],
    months: [
      ["Jan", 78, 56],
      ["Fev", 82, 59],
      ["Mar", 84, 61],
      ["Abr", 89, 66],
      ["Mai", 97, 70],
      ["Jun", 98, 72]
    ],
    revenueMix: [
      ["Consultas", 48],
      ["Procedimentos", 37],
      ["Convênios", 15]
    ],
    insights: [
      "O faturamento cresceu em relação ao mês anterior, com maior peso em procedimentos.",
      "A folha representa 23,4% do faturamento informado.",
      "A análise de margem completa depende da revisão das despesas importadas."
    ],
    priorities: [
      ["medium", "Enviar extrato OFX de maio", "Melhora a leitura de caixa"],
      ["medium", "Revisar despesas sem categoria", "22 lançamentos pendentes"],
      ["low", "Conferir XML de notas emitidas", "Base fiscal quase completa"]
    ],
    timeline: [
      ["Hoje", "Nova observação IA gerada sobre crescimento de faturamento."],
      ["22/05", "Folha de pagamento disponibilizada."],
      ["19/05", "Importação CSV recebida e aguardando revisão MB."]
    ],
    documents: [
      ["DAS Maio/2026", "Fiscal", "Disponível", "20/06/2026"],
      ["Folha Maio/2026", "Trabalhista", "Disponível", "05/06/2026"],
      ["Relatório Fiscal Maio/2026", "Fiscal", "Aguardando revisão", "Em análise"]
    ]
  },
  {
    id: "prime",
    name: "Serviços Prime ME",
    cnpj: "41.802.119/0001-77",
    city: "Recife/PE",
    segment: "Serviços",
    plan: "contabilidade",
    maturity: "Fiscal básico",
    status: "Onboarding",
    owner: "Juliana Prime",
    consultant: "Lucas Pereira",
    financialAnalyst: "A definir",
    revenue: 42800,
    expenses: 0,
    result: 0,
    cash: 0,
    margin: 0,
    taxes: 3260,
    payroll: 0,
    score: 0,
    operationalScore: 54,
    runway: 0,
    investmentCapacity: 0,
    confidence: "Baixa",
    lastAccess: "23/05, 14:20",
    dre: [],
    cashBridge: [],
    months: [
      ["Jan", 34, 0],
      ["Fev", 36, 0],
      ["Mar", 38, 0],
      ["Abr", 41, 0],
      ["Mai", 43, 0],
      ["Jun", 44, 0]
    ],
    revenueMix: [
      ["Serviços", 100]
    ],
    insights: [
      "Dados suficientes para acompanhamento fiscal básico.",
      "Dados insuficientes para afirmar margem, lucro, caixa ou capacidade de investimento.",
      "A conexão de extratos ou planilhas financeiras libera uma leitura mais completa."
    ],
    priorities: [
      ["high", "Enviar procuração e documentos societários", "Pendência de onboarding"],
      ["medium", "Confirmar faturamento declarado", "Base para cálculo do Simples"],
      ["low", "Avaliar upgrade para Financeiro IA", "Cliente possui evolução de receita"]
    ],
    timeline: [
      ["Hoje", "DAS de maio disponibilizado."],
      ["22/05", "Pendência societária enviada ao cliente."],
      ["20/05", "Cadastro inicial aprovado pela equipe MB."]
    ],
    documents: [
      ["DAS Maio/2026", "Fiscal", "Disponível", "20/06/2026"],
      ["Contrato Social", "Societário", "Pendente", "Aguardando envio"],
      ["Guia INSS", "Trabalhista", "Não aplicável", "-"]
    ]
  }
];

const operators = {
  master: { name: "Marcos Lima", role: "Administrador master" },
  operacional: { name: "Carla Souza", role: "Gestora operacional" },
  fiscal: { name: "Paula Martins", role: "Fiscal" },
  trabalhista: { name: "Renata Alves", role: "Trabalhista" },
  financeiro: { name: "Ana Ribeiro", role: "Analista financeiro" },
  cfo: { name: "Bruno Andrade", role: "Consultor CFO" },
  atendimento: { name: "Lucas Pereira", role: "Atendimento" }
};

const state = {
  session: null,
  view: "intelligence",
  adminView: "operation",
  selectedClientId: "silva",
  toast: ""
};

function loadWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.plans) {
      Object.entries(saved.plans).forEach(([key, value]) => {
        if (plans[key]) plans[key] = { ...plans[key], ...value };
      });
    }
    if (Array.isArray(saved.clients)) {
      saved.clients.forEach((savedClient) => {
        const client = clients.find((item) => item.id === savedClient.id);
        if (client) Object.assign(client, savedClient);
      });
    }
  } catch (error) {
    console.warn("Não foi possível carregar dados locais da MB Intelligence.", error);
  }
}

function saveWorkspace() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      plans,
      clients,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("Não foi possível salvar dados locais da MB Intelligence.", error);
  }
}

const root = document.getElementById("root");

function money(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
}

function number(value) {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

function percent(value) {
  return `${String(value).replace(".", ",")}%`;
}

function clientById(id) {
  return clients.find((client) => client.id === id) || clients[0];
}

function currentClient() {
  if (!state.session) return clients[0];
  if (state.session.type === "client") return clientById(state.session.clientId);
  return clientById(state.selectedClientId);
}

function icon(name) {
  return `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function setToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = "";
    const toast = document.querySelector(".toast");
    if (toast) toast.remove();
  }, 2800);
}

function render() {
  root.innerHTML = state.session ? renderShell() : renderLogin();
  bindEvents();
  refreshIcons();
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="login-brand">
        <div class="brand-lockup">
          <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
          <div>
            <strong>MB Intelligence</strong>
            <span>Produto final em construção</span>
          </div>
        </div>

        <div class="login-copy">
          <h1>Inteligência financeira para empresas modernas.</h1>
          <p>Uma camada de consolidação, análise, documentos e operação consultiva para PMEs. A MB organiza os dados, valida as informações e transforma números em decisão.</p>
        </div>

        <div class="proof-grid">
          <div><strong>3</strong><span>planos comerciais com módulos e benefícios progressivos.</span></div>
          <div><strong>2</strong><span>ambientes: Portal do Cliente e Administração Operacional MB.</span></div>
          <div><strong>IA + MB</strong><span>insights automáticos com governança humana.</span></div>
          <div><strong>MVP</strong><span>focado em documentos, dashboards, DRE, caixa e operação.</span></div>
        </div>
      </section>

      <section class="login-workspace">
        <div class="login-card">
          <div class="section-title">
            <h2>Acesso único</h2>
            <p>O mesmo login direciona clientes para o portal e operadores para a Administração MB. Nesta primeira versão, os acessos são simulados para acelerar validação.</p>
          </div>

          <form class="login-form" data-login-form>
            <div class="form-grid">
              <label>
                <span>E-mail</span>
                <input name="email" type="email" value="cfo@cliente.com" autocomplete="email">
              </label>
              <label>
                <span>Senha</span>
                <input name="password" type="password" value="123456" autocomplete="current-password">
              </label>
            </div>
            <div class="form-grid">
              <label>
                <span>Empresa / cliente</span>
                <select name="clientId">
                  ${clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("")}
                </select>
              </label>
              <label>
                <span>Operador MB</span>
                <select name="operator">
                  ${Object.entries(operators).map(([key, op]) => `<option value="${key}">${op.name} - ${op.role}</option>`).join("")}
                </select>
              </label>
            </div>

            <div class="login-helper">
              <a href="#">Recuperar senha</a>
              <span>Autenticação em dois fatores prevista para fase técnica</span>
            </div>

            <div class="login-actions">
              <button class="btn btn-primary" type="submit">${icon("log-in")} Entrar</button>
              <button class="btn btn-ghost" type="button" data-login-admin>${icon("shield-check")} Entrar como equipe MB</button>
            </div>

            <div class="demo-strip">
              <button type="button" data-demo-client="prime">Cliente Contabilidade</button>
              <button type="button" data-demo-client="clinica">Cliente Financeiro IA</button>
              <button type="button" data-demo-client="silva">Cliente CFO</button>
              <button type="button" data-demo-admin="master">Admin MB</button>
            </div>
          </form>

          <div class="pricing-panel">
            <div class="section-title">
              <h2>Contratação do plano</h2>
              <p>Fluxo comercial previsto para cadastro do cliente, escolha do plano e pagamento por Pix ou cartão. Os valores podem ser editados pela equipe MB na área administrativa.</p>
            </div>
            <div class="pricing-grid">
              ${Object.entries(plans).map(([key, plan]) => `
                <article class="price-card ${key === "financeiro" ? "is-featured" : ""}">
                  <span class="status-pill ${plan.color}">${plan.name}</span>
                  <strong>${money(plan.price)}</strong>
                  <small>${plan.tagline}</small>
                  <ul>${plan.modules.slice(0, 4).map((item) => `<li>${item}</li>`).join("")}</ul>
                  <button class="btn btn-soft" type="button" data-select-purchase="${key}">${icon("shopping-cart")} Escolher</button>
                </article>
              `).join("")}
            </div>
            <div class="purchase-box">
              <label>
                <span>Forma de pagamento</span>
                <select>
                  <option>Pix</option>
                  <option>Cartão de crédito</option>
                </select>
              </label>
              <label>
                <span>Responsável pelo cadastro</span>
                <input value="Nome do empresário">
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderShell() {
  const isAdmin = state.session.type === "admin";
  const client = currentClient();
  const op = operators[state.session.operator] || operators.master;
  const menu = isAdmin ? adminMenu() : clientMenu();
  const view = isAdmin ? renderAdminView() : renderClientView(client);
  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="side-brand">
          <img src="assets/mb-logo-premium.svg" alt="MB">
          <div>
            <strong>MB Intelligence</strong>
            <span>${isAdmin ? "Administração MB" : "Portal do Cliente"}</span>
          </div>
        </div>
        <nav class="side-menu">
          ${menu}
        </nav>
        <div class="side-account">
          <span>${isAdmin ? op.role : client.name}</span>
          <strong>${isAdmin ? op.name : client.owner}</strong>
          <div style="margin-top:10px">
            <span class="plan-pill">${isAdmin ? "Operador MB" : plans[client.plan].name}</span>
          </div>
        </div>
      </aside>
      <main class="content">
        <header class="topbar">
          <div>
            <h1>${isAdmin ? titleAdmin() : titleClient()}</h1>
            <p>${isAdmin ? "Cockpit operacional, governança e alimentação das informações dos clientes." : "Cockpit financeiro, documentos, análises e acompanhamento consultivo."}</p>
          </div>
          <div class="topbar-actions">
            <button class="icon-btn" type="button" title="Notificações">${icon("bell")}</button>
            <button class="icon-btn" type="button" title="Sair" data-logout>${icon("log-out")}</button>
          </div>
        </header>
        ${view}
      </main>
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
    </div>
  `;
}

function clientMenu() {
  const items = [
    ["intelligence", "activity", "Inteligência Financeira"],
    ["onboarding", "list-checks", "Onboarding"],
    ["documents", "folder-open", "Documentos e guias"],
    ["imports", "cloud-upload", "Importações"],
    ["communication", "messages-square", "Comunicação"],
    ["profile", "user-round", "Perfil"]
  ];
  return items.map(([view, iconName, label]) => `
    <button class="nav-btn ${state.view === view ? "is-active" : ""}" type="button" data-view="${view}">
      ${icon(iconName)} <span>${label}</span>
    </button>
  `).join("");
}

function adminMenu() {
  const items = [
    ["operation", "layout-dashboard", "Operação MB"],
    ["clients", "building-2", "Clientes"],
    ["new-client", "user-plus", "Novo cliente"],
    ["plans", "badge-dollar-sign", "Planos"],
    ["client-content", "panel-top", "Informações do cliente"],
    ["documents", "folder-up", "Documentos"],
    ["imports", "database-zap", "Importações"],
    ["users", "users-round", "Usuários"],
    ["approvals", "shield-check", "Aprovações"],
    ["audit", "history", "Auditoria"],
    ["reports", "file-bar-chart", "Relatórios"]
  ];
  return items.map(([view, iconName, label]) => `
    <button class="nav-btn ${state.adminView === view ? "is-active" : ""}" type="button" data-admin-view="${view}">
      ${icon(iconName)} <span>${label}</span>
    </button>
  `).join("");
}

function titleClient() {
  const map = {
    intelligence: "Inteligência Financeira",
    onboarding: "Onboarding",
    documents: "Documentos e guias",
    imports: "Importações",
    communication: "Comunicação MB",
    profile: "Perfil e acessos"
  };
  return map[state.view] || "Inteligência Financeira";
}

function titleAdmin() {
  const map = {
    operation: "Operação MB",
    clients: "Gestão de clientes",
    "new-client": "Cadastro de cliente",
    plans: "Planos e permissões",
    "client-content": "Informações do cliente",
    documents: "Documentos",
    imports: "Importações",
    users: "Usuários e perfis",
    approvals: "Aprovações",
    audit: "Auditoria",
    reports: "Relatórios operacionais"
  };
  return map[state.adminView] || "Operação MB";
}

function renderClientView(client) {
  if (state.view === "onboarding") return renderClientOnboarding(client);
  if (state.view === "documents") return renderClientDocuments(client);
  if (state.view === "imports") return renderClientImports(client);
  if (state.view === "communication") return renderCommunication(client);
  if (state.view === "profile") return renderProfile(client);
  return renderIntelligence(client);
}

function renderIntelligence(client) {
  if (client.plan === "contabilidade") return renderAccountingIntelligence(client);
  if (client.plan === "financeiro") return renderFinancialIA(client);
  return renderCfoIntelligence(client);
}

function renderMetric({ label, value, hint, analysis, trend = [8, 16, 12, 24, 19, 31], color = "brand" }) {
  return `
    <article class="metric-card">
      <div class="metric-top">
        <span>${label}</span>
        <em>${hint}</em>
      </div>
      <strong>${value}</strong>
      ${renderSparkline(trend, color)}
      <div class="metric-analysis"><strong>IA MB:</strong> ${analysis}</div>
    </article>
  `;
}

function renderAccountingIntelligence(client) {
  return `
    <section class="grid grid-4">
      ${renderMetric({ label: "Documentos disponíveis", value: "18", hint: "últimos 90 dias", analysis: "Base documental organizada para acompanhamento fiscal e obrigações.", trend: [12, 14, 16, 17, 18] })}
      ${renderMetric({ label: "DAS do mês", value: money(client.taxes), hint: "vence 20/06", analysis: "Guia disponível para pagamento dentro do prazo.", trend: [8, 9, 10, 11, 12], color: "amber" })}
      ${renderMetric({ label: "Faturamento declarado", value: money(client.revenue), hint: "maio/2026", analysis: "Informação fiscal suficiente para acompanhamento básico do Simples.", trend: [28, 32, 35, 39, 43], color: "blue" })}
      ${renderMetric({ label: "Pendências", value: "2", hint: "onboarding", analysis: "Sem dados financeiros para afirmar lucro, caixa ou margem.", trend: [22, 16, 12, 9, 7], color: "teal" })}
    </section>

    <section class="grid grid-2" style="margin-top:14px">
      <article class="panel chart">
        <div class="panel-header">
          <div>
            <h3>Obrigações e vencimentos</h3>
            <p>Visão simples para guias, documentos e pendências.</p>
          </div>
        </div>
        ${renderBars([
          ["DAS", 86, "Disponível", "brand"],
          ["Documentos fiscais", 72, "Em dia", "teal"],
          ["Societário", 38, "Pendente", "amber"],
          ["Trabalhista", 22, "Não aplicável", "blue"]
        ])}
      </article>
      ${renderCopilotPanel(client)}
    </section>
  `;
}

function renderFinancialIA(client) {
  return `
    <section class="grid grid-4">
      ${renderMetric({ label: "Faturamento", value: money(client.revenue), hint: "maio/2026", analysis: "Receita cresceu em relação ao mês anterior e mantém tendência positiva.", trend: [78, 82, 84, 89, 97, 98], color: "blue" })}
      ${renderMetric({ label: "Impostos", value: money(client.taxes), hint: "Simples", analysis: "A alíquota efetiva subiu levemente; acompanhar faixa acumulada de 12 meses.", trend: [5, 6, 7, 7.2, 7.6], color: "amber" })}
      ${renderMetric({ label: "Folha", value: money(client.payroll), hint: "23,4% da receita", analysis: "Folha está dentro do esperado, mas deve ser observada se a receita estabilizar.", trend: [18, 19, 21, 22, 23], color: "teal" })}
      ${renderMetric({ label: "Qualidade dos dados", value: client.confidence, hint: "em validação", analysis: "Extratos e categorias pendentes limitam margem e caixa com segurança.", trend: [52, 56, 60, 64, 68], color: "brand" })}
    </section>

    <section class="grid grid-2" style="margin-top:14px">
      <article class="panel chart">
        <div class="panel-header">
          <div>
            <h3>Faturamento x despesas importadas</h3>
            <p>Análise gerencial baseada nos arquivos recebidos e dados fiscais.</p>
          </div>
        </div>
        ${renderLineChart(client.months)}
        <div class="chart-legend">
          <span><i class="legend-dot blue"></i> Receita</span>
          <span><i class="legend-dot amber"></i> Despesas importadas</span>
        </div>
      </article>
      <article class="panel chart">
        <div class="panel-header">
          <div>
            <h3>Origem da receita</h3>
            <p>Ajuda a entender qualidade e concentração do faturamento.</p>
          </div>
        </div>
        ${renderBars(client.revenueMix.map((item, index) => [item[0], item[1], `${item[1]}%`, ["blue", "teal", "amber", "brand"][index] || "brand"]))}
        <div class="metric-analysis" style="margin-top:14px"><strong>IA MB:</strong> Receita concentrada em procedimentos. Acompanhamento mensal pode indicar oportunidade comercial ou risco de dependência.</div>
      </article>
    </section>

    <section class="grid grid-2" style="margin-top:14px">
      ${renderCopilotPanel(client)}
      ${renderNotifications(client)}
    </section>
  `;
}

function renderCfoIntelligence(client) {
  return `
    <section class="grid grid-4">
      ${renderMetric({ label: "Faturamento", value: money(client.revenue), hint: "+9,8% no mês", analysis: "Crescimento acima da média recente, com atenção à concentração de receita.", trend: [132, 141, 154, 166, 183, 188], color: "blue" })}
      ${renderMetric({ label: "Resultado gerencial", value: money(client.result), hint: percent(client.margin), analysis: "Resultado positivo; margem depende de disciplina em despesas recorrentes.", trend: [21, 25, 28, 31, 40, 42], color: "teal" })}
      ${renderMetric({ label: "Caixa projetado", value: money(client.cash), hint: `${client.runway} dias`, analysis: "Caixa suporta operação atual e investimento moderado com reserva mínima.", trend: [60, 66, 72, 76, 84, 88], color: "brand" })}
      ${renderMetric({ label: "MB Financial Score", value: String(client.score), hint: "saudável", analysis: "Score forte, mas concentração de receita e despesas fixas exigem monitoramento.", trend: [70, 72, 76, 78, 82, 83], color: "amber" })}
    </section>

    <section class="grid financial-center" style="margin-top:14px">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>DRE gerencial</h3>
            <p>Resultado validado para leitura executiva e tomada de decisão.</p>
          </div>
          <div class="report-actions">
            <button class="btn btn-ghost" type="button" data-print-report="dre">${icon("printer")} Imprimir</button>
            <button class="btn btn-soft" type="button" data-export-report="dre">${icon("file-spreadsheet")} Excel</button>
          </div>
        </div>
        ${renderDre(client)}
        <div class="metric-analysis" style="margin-top:14px"><strong>MB CFO:</strong> a margem de ${percent(client.margin)} permite investimento controlado, desde que despesas administrativas sejam revisadas no próximo ciclo.</div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Fluxo de caixa</h3>
            <p>Ponte de caixa com saldo inicial, entradas, saídas e saldo projetado.</p>
          </div>
          <div class="report-actions">
            <button class="btn btn-ghost" type="button" data-print-report="cash">${icon("printer")} Imprimir</button>
            <button class="btn btn-soft" type="button" data-export-report="cash">${icon("file-spreadsheet")} Excel</button>
          </div>
        </div>
        ${renderCashBridge(client)}
        <div class="metric-analysis" style="margin-top:14px"><strong>IA MB:</strong> se o ritmo atual de pagamentos continuar, a empresa mantém fôlego operacional acima de 40 dias.</div>
      </article>
    </section>

    <section class="grid grid-3" style="margin-top:14px">
      <article class="panel chart">
        <div class="panel-header"><div><h3>Receita x despesas</h3><p>Evolução mensal comparada.</p></div></div>
        ${renderLineChart(client.months)}
        <div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesas</span></div>
      </article>
      <article class="panel chart">
        <div class="panel-header"><div><h3>Concentração de receita</h3><p>Dependência por cliente.</p></div></div>
        ${renderBars(client.revenueMix.map((item, index) => [item[0], item[1], `${item[1]}%`, ["brand", "blue", "teal", "amber"][index]]))}
      </article>
      <article class="panel chart">
        <div class="panel-header"><div><h3>Capacidade de investimento</h3><p>Leitura executiva com reserva mínima.</p></div></div>
        ${renderBars([
          ["Reserva mínima", 70, money(42000), "brand"],
          ["Capacidade segura", 86, money(client.investmentCapacity), "teal"],
          ["Compromissos fixos", 54, money(32600), "amber"],
          ["Risco de pressão", 24, "baixo", "blue"]
        ])}
        <div class="metric-analysis" style="margin-top:14px"><strong>MB CFO:</strong> investimento de até ${money(client.investmentCapacity)} é possível sem comprometer o caixa mínimo projetado.</div>
      </article>
    </section>

    <section class="grid grid-2" style="margin-top:14px">
      ${renderCopilotPanel(client)}
      ${renderNotifications(client)}
    </section>
  `;
}

function renderDre(client) {
  return `
    <div class="dre-table">
      <div class="dre-row is-head"><span>Conta gerencial</span><span>Valor</span><span>% Receita</span></div>
      ${client.dre.map((row, index) => `
        <div class="dre-row ${index === client.dre.length - 1 ? "is-total" : ""}">
          <span>${row[0]}</span>
          <strong>${money(row[1])}</strong>
          <span>${row[2]}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderCashBridge(client) {
  const max = Math.max(...client.cashBridge.map((item) => Math.abs(item[1])));
  return `
    <div class="cash-bridge">
      ${client.cashBridge.map(([label, value, type]) => {
        const height = Math.max(20, Math.round((Math.abs(value) / max) * 138));
        return `
          <div class="bridge-item">
            <div class="bridge-bar-wrap">
              <div class="bridge-bar ${type}" style="--height:${height}px"></div>
            </div>
            <div class="bridge-value">${money(value)}</div>
            <div class="bridge-label">${label}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderCopilotPanel(client) {
  return `
    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Copiloto MB</h3>
          <p>Prioridades, próximas ações e acompanhamento contínuo.</p>
        </div>
        <span class="status-pill ${client.confidence === "Alta" ? "status-ok" : client.confidence === "Média" ? "status-warning" : "status-danger"}">Confiança ${client.confidence}</span>
      </div>
      <div class="priority-list">
        ${client.priorities.map(([level, title, detail]) => `
          <div class="priority-item">
            <span class="priority-dot ${level}"></span>
            <div><strong>${title}</strong><span>${detail}</span></div>
            <span class="chip">${level === "high" ? "Alta" : level === "medium" ? "Média" : "Baixa"}</span>
          </div>
        `).join("")}
      </div>
      <div class="timeline" style="margin-top:14px">
        ${client.timeline.map(([date, text]) => `
          <div class="timeline-item"><time>${date}</time><span>${text}</span></div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderNotifications(client) {
  return `
    <article class="panel">
      <div class="panel-header">
        <div>
          <h3>Análises e notificações</h3>
          <p>Leituras geradas por regras, IA e revisão MB.</p>
        </div>
      </div>
      <div class="insight-list">
        ${client.insights.map((item, index) => `
          <div class="insight-item">
            <strong>${index === 0 ? "Análise MB" : "IA MB"}</strong>
            <span>${item}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderClientDocuments(client) {
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Documentos liberados</h3>
            <p>Central para visualizar guias, arquivos fiscais, trabalhistas, contábeis e relatórios.</p>
          </div>
          <button class="btn btn-ghost" type="button">${icon("download")} Baixar seleção</button>
        </div>
        <div class="data-table">
          <div class="data-row is-head"><span>Documento</span><span>Categoria</span><span>Status</span><span>Prazo</span><span>Ação</span></div>
          ${client.documents.map((doc) => `
            <div class="data-row">
              <span>${doc[0]}</span>
              <span>${doc[1]}</span>
              <span class="status-pill ${doc[2] === "Disponível" || doc[2] === "Aprovado" ? "status-ok" : doc[2] === "Pendente" ? "status-danger" : "status-warning"}">${doc[2]}</span>
              <span>${doc[3]}</span>
              <button class="btn btn-soft" type="button">${icon("download")} Abrir</button>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Envio solicitado</h3>
            <p>O envio pelo cliente e secundário e aparece quando a MB solicita algum arquivo.</p>
          </div>
        </div>
        <div class="upload-zone">
          ${icon("cloud-upload")}
          <div>
            <strong>Enviar arquivo solicitado pela MB</strong>
            <p>Exemplos: OFX, XML, contrato social, extrato, planilha financeira ou comprovante.</p>
          </div>
        </div>
        <div class="task-list" style="margin-top:14px">
          <div class="task-item"><strong>Extrato OFX Maio/2026</strong><span>Responsável: cliente · Prazo: 26/05 · Origem: MB Financeiro</span></div>
          <div class="task-item"><strong>Contrato social atualizado</strong><span>Responsável: cliente · Prazo: 28/05 · Origem: Atendimento MB</span></div>
        </div>
      </article>
    </section>
  `;
}

function renderCommunication(client) {
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Seu consultor MB</h3>
            <p>Acompanhamento operacional e financeiro centralizado.</p>
          </div>
        </div>
        <div class="grid">
          <div class="notification-item"><strong>${client.consultant}</strong><span>Responsável principal · Última interação: hoje</span></div>
          <div class="notification-item"><strong>${client.financialAnalyst}</strong><span>Responsável financeiro · Próxima análise: 27/05/2026</span></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Mensagens operacionais</h3>
            <p>Canal para reduzir dependência de conversas fora da plataforma.</p>
          </div>
        </div>
        <div class="insight-list">
          <div class="insight-item"><strong>MB</strong><span>Seu relatório financeiro de maio foi atualizado e aguarda conferência final.</span></div>
          <div class="insight-item"><strong>Cliente</strong><span>Vamos enviar o extrato OFX ainda hoje.</span></div>
          <div class="insight-item"><strong>MB</strong><span>Perfeito. Após o envio, atualizamos a leitura de caixa.</span></div>
        </div>
        <div class="button-row" style="margin-top:14px">
          <input value="Escrever mensagem para a MB">
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("send")} Enviar</button>
        </div>
      </article>
    </section>
  `;
}

function renderProfile(client) {
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header"><div><h3>Empresa</h3><p>Dados principais vinculados ao acesso.</p></div></div>
        <div class="data-table">
          <div class="dre-row"><span>Razão social</span><strong>${client.name}</strong><span></span></div>
          <div class="dre-row"><span>CNPJ</span><strong>${client.cnpj}</strong><span></span></div>
          <div class="dre-row"><span>Cidade/UF</span><strong>${client.city}</strong><span></span></div>
          <div class="dre-row"><span>Segmento</span><strong>${client.segment}</strong><span></span></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Acessos</h3><p>Perfis de usuário previstos para a plataforma.</p></div></div>
        <div class="module-chips">
          <span class="chip is-on">Proprietário</span>
          <span class="chip is-on">Gestor financeiro</span>
          <span class="chip">RH</span>
          <span class="chip">Somente leitura</span>
          <span class="chip">Documentos específicos</span>
        </div>
      </article>
    </section>
  `;
}

function renderClientOnboarding(client) {
  const steps = [
    ["Cadastro aprovado", "Concluído", "Dados básicos da empresa e responsável legal validados pela MB.", "check-circle"],
    ["Documentos base", client.plan === "contabilidade" ? "Pendente" : "Concluído", "Contrato social, procurações e documentos fiscais principais.", "folder-check"],
    ["Dados financeiros", client.plan === "contabilidade" ? "Opcional" : "Em andamento", "Envio de OFX, Excel, CSV ou integração para melhorar dashboards.", "database"],
    ["Validação MB", client.confidence === "Alta" ? "Concluído" : "Em revisão", "Equipe MB revisa dados antes de liberar análises sensíveis.", "shield-check"],
    ["Cockpit liberado", client.plan === "cfo" ? "Completo" : "Parcial", "A experiência muda conforme plano, perfil e maturidade dos dados.", "layout-dashboard"]
  ];
  const completed = steps.filter((step) => ["Concluído", "Completo"].includes(step[1])).length;
  const progress = Math.round((completed / steps.length) * 100);
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Ativação da plataforma</h3>
            <p>Checklist guiado para o cliente entender o que falta para liberar análises mais completas.</p>
          </div>
          <span class="status-pill ${progress >= 80 ? "status-ok" : "status-warning"}">${progress}% ativo</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="--progress:${progress}%"></div></div>
          <span>${completed} de ${steps.length} etapas essenciais concluídas</span>
        </div>
        <div class="step-list">
          ${steps.map(([title, status, detail, iconName]) => `
            <div class="step-card">
              <div class="step-icon">${icon(iconName)}</div>
              <div>
                <strong>${title}</strong>
                <span>${detail}</span>
              </div>
              <span class="status-pill ${status === "Concluído" || status === "Completo" ? "status-ok" : status === "Pendente" ? "status-danger" : "status-warning"}">${status}</span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Seu consultor MB</h3>
            <p>Acompanhamento humano para transformar o onboarding em operação contínua.</p>
          </div>
        </div>
        <div class="consultant-card">
          <div>
            <strong>${client.consultant}</strong>
            <span>Responsável principal pela sua jornada</span>
          </div>
          <span class="chip is-on">Próxima revisão: 27/05</span>
        </div>
        <div class="insight-list" style="margin-top:14px">
          <div class="insight-item"><strong>Orientação MB</strong><span>${client.plan === "contabilidade" ? "Seu portal já organiza guias e documentos. Para liberar dashboards, envie arquivos financeiros ou avalie o Financeiro IA." : "Quanto mais completos os arquivos enviados, maior a precisão dos dashboards e recomendações."}</span></div>
          <div class="insight-item"><strong>IA MB</strong><span>Dados incompletos não serão usados para conclusões definitivas. A plataforma sempre informa o nível de confiança.</span></div>
        </div>
      </article>
    </section>

    <section class="grid grid-3" style="margin-top:14px">
      <article class="panel">
        <div class="panel-header"><div><h3>Conectar dados</h3><p>Próxima etapa recomendada.</p></div></div>
        <button class="btn btn-primary" type="button" data-open-client-imports>${icon("cloud-upload")} Ir para importações</button>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Documentos essenciais</h3><p>Base para fiscal, contábil e societário.</p></div></div>
        <div class="module-chips"><span class="chip is-on">DAS</span><span class="chip is-on">Guias</span><span class="chip ${client.plan === "contabilidade" ? "" : "is-on"}">OFX</span><span class="chip">XML</span></div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Liberação de análises</h3><p>Proteção contra conclusões sem base.</p></div></div>
        <span class="status-pill ${client.confidence === "Alta" ? "status-ok" : client.confidence === "Média" ? "status-warning" : "status-danger"}">Confiança ${client.confidence}</span>
      </article>
    </section>
  `;
}

function renderClientImports(client) {
  const locked = client.plan === "contabilidade";
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Envio de arquivos</h3>
            <p>O cliente envia arquivos apenas quando a MB solicita. A equipe MB continua sendo o principal canal de publicação e validação.</p>
          </div>
          <span class="status-pill ${locked ? "status-warning" : "status-ok"}">${locked ? "Envio sob solicitação" : "Importações habilitadas"}</span>
        </div>
        <div class="upload-zone">
          ${icon("cloud-upload")}
          <div>
            <strong>Arraste ou selecione o arquivo solicitado</strong>
            <p>Formatos previstos: Excel, CSV, OFX, XML e PDF. No MVP, o processamento ainda será validado pela MB.</p>
          </div>
        </div>
        <div class="button-row" style="margin-top:14px">
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("upload")} Enviar para MB</button>
          <button class="btn btn-ghost" type="button" data-simulate-action>${icon("message-square")} Tirar dúvida</button>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Tipos de arquivo</h3>
            <p>Cada arquivo alimenta uma parte diferente da inteligência financeira.</p>
          </div>
        </div>
        <div class="import-grid">
          ${[
            ["OFX", "Extrato bancário para leitura de caixa e conciliação.", "wallet-cards"],
            ["Excel/CSV", "Planilhas financeiras, contas, receitas e despesas.", "table"],
            ["XML", "Notas fiscais, faturamento e validação fiscal.", "file-code"],
            ["PDF", "Extratos, relatórios e comprovantes para leitura assistida.", "file-text"]
          ].map(([type, text, iconName]) => `
            <div class="import-type">
              ${icon(iconName)}
              <strong>${type}</strong>
              <span>${text}</span>
            </div>
          `).join("")}
        </div>
      </article>
    </section>

    <section class="panel" style="margin-top:14px">
      <div class="panel-header">
        <div>
          <h3>Histórico de importações</h3>
          <p>Status operacional dos arquivos recebidos e revisados.</p>
        </div>
      </div>
      <div class="data-table">
        <div class="data-row is-head"><span>Arquivo</span><span>Tipo</span><span>Status</span><span>Responsável</span><span>Resultado</span></div>
        ${[
          ["extrato_maio.ofx", "OFX", client.plan === "contabilidade" ? "Solicitado" : "Recebido", "Cliente", "Aguardando validação MB"],
          ["notas_maio.xml", "XML", "Validado", "MB Fiscal", "Faturamento atualizado"],
          ["despesas_maio.xlsx", "Excel", client.plan === "cfo" ? "Processado" : "Pendente", "MB Financeiro", client.plan === "cfo" ? "DRE atualizada" : "Aguardando arquivo"]
        ].map((row) => `<div class="data-row">${row.map((col) => `<span>${col}</span>`).join("")}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderAdminView() {
  if (state.adminView === "clients") return renderAdminClients();
  if (state.adminView === "new-client") return renderAdminNewClient();
  if (state.adminView === "plans") return renderAdminPlans();
  if (state.adminView === "client-content") return renderAdminClientContent();
  if (state.adminView === "documents") return renderAdminDocuments();
  if (state.adminView === "imports") return renderAdminImports();
  if (state.adminView === "users") return renderAdminUsers();
  if (state.adminView === "approvals") return renderAdminApprovals();
  if (state.adminView === "audit") return renderAdminAudit();
  if (state.adminView === "reports") return renderAdminReports();
  return renderAdminOperation();
}

function renderAdminOperation() {
  return `
    <section class="grid grid-4">
      ${renderMetric({ label: "Clientes ativos", value: "128", hint: "42 CFO", analysis: "Carteira exige prioridade para clientes com SLA vencido.", trend: [90, 104, 116, 121, 128], color: "blue" })}
      ${renderMetric({ label: "SLAs vencidos", value: "7", hint: "críticos", analysis: "Fila fiscal e aprovação de DRE concentram atrasos.", trend: [3, 4, 5, 6, 7], color: "amber" })}
      ${renderMetric({ label: "Aprovações IA", value: "18", hint: "aguardando", analysis: "Insights estratégicos não devem ser liberados sem revisão MB.", trend: [9, 12, 14, 18], color: "brand" })}
      ${renderMetric({ label: "Upsell provável", value: "14", hint: "oportunidades", analysis: "Clientes com dados suficientes podem migrar de plano.", trend: [6, 8, 9, 12, 14], color: "teal" })}
    </section>

    <section class="grid grid-2" style="margin-top:14px">
      <article class="panel">
        <div class="panel-header"><div><h3>Filas operacionais</h3><p>Organização por área para a equipe MB.</p></div></div>
        <div class="queue-list">
          ${[
            ["Fiscal", "11 guias e XMLs aguardando revisão", "3 SLAs vencidos"],
            ["Trabalhista", "6 folhas pendentes de publicação", "1 SLA vencido"],
            ["DRE", "9 DREs aguardando validação", "4 clientes CFO"],
            ["Caixa", "8 fluxos pendentes de OFX", "2 clientes críticos"],
            ["IA", "18 insights aguardando aprovação", "5 estratégicos"]
          ].map((row) => `<div class="queue-item"><strong>${row[0]}</strong><span>${row[1]}</span><span class="chip">${row[2]}</span></div>`).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Timeline da operação</h3><p>Eventos recentes da carteira MB.</p></div></div>
        <div class="timeline">
          <div class="timeline-item"><time>10:42</time><span>Bruno aprovou parecer de caixa do Comércio Silva.</span></div>
          <div class="timeline-item"><time>09:58</time><span>Ana solicitou OFX para Clínica Norte.</span></div>
          <div class="timeline-item"><time>09:21</time><span>Paula liberou DAS de 18 clientes do Simples.</span></div>
          <div class="timeline-item"><time>08:47</time><span>Sistema identificou 4 oportunidades de upgrade.</span></div>
        </div>
      </article>
    </section>
  `;
}

function renderAdminClients() {
  const client = currentClient();
  return `
    <section class="admin-editor">
      <aside class="panel">
        <div class="panel-header"><div><h3>Carteira</h3><p>Selecione um cliente para operar.</p></div></div>
        <div class="client-list">
          ${clients.map((item) => `
            <button class="client-choice ${item.id === state.selectedClientId ? "is-active" : ""}" type="button" data-select-client="${item.id}">
              <strong>${item.name}</strong>
              <span>${plans[item.plan].name} · ${item.maturity}</span>
              <span>${item.status} · último acesso: ${item.lastAccess}</span>
            </button>
          `).join("")}
        </div>
      </aside>
      <article class="panel">
        <div class="panel-header">
          <div><h3>Ficha do cliente</h3><p>Cadastro, plano, responsáveis e módulos liberados.</p></div>
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("save")} Salvar alterações</button>
        </div>
        <div class="form-section">
          <label><span>Razão social</span><input value="${client.name}"></label>
          <label><span>CNPJ</span><input value="${client.cnpj}"></label>
          <label><span>Cidade/UF</span><input value="${client.city}"></label>
          <label><span>Responsável legal</span><input value="${client.owner}"></label>
          <label><span>Consultor MB</span><input value="${client.consultant}"></label>
          <label>
            <span>Plano contratado</span>
            <select data-client-plan="${client.id}">
              ${Object.entries(plans).map(([key, plan]) => `<option value="${key}" ${client.plan === key ? "selected" : ""}>${plan.name} - ${money(plan.price)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="grid grid-3" style="margin-top:14px">
          <div class="notification-item"><strong>Maturidade</strong><span>${client.maturity}</span></div>
          <div class="notification-item"><strong>Qualidade</strong><span>Confiança ${client.confidence}</span></div>
          <div class="notification-item"><strong>Oportunidade</strong><span>${client.plan === "cfo" ? "Retenção e expansão consultiva" : "Upgrade sugerido"}</span></div>
        </div>
        <h3 style="margin:18px 0 10px">Módulos liberados</h3>
        <div class="module-chips">
          ${plans[client.plan].modules.map((module) => `<span class="chip is-on">${module}</span>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderAdminNewClient() {
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Novo cliente MB</h3>
            <p>Cadastro inicial para ativar portal, plano, responsáveis e checklist operacional.</p>
          </div>
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("save")} Criar cliente</button>
        </div>
        <div class="content-form">
          <div class="form-section two">
            <label><span>Razão social</span><input value="Nova Empresa LTDA"></label>
            <label><span>Nome fantasia</span><input value="Nova Empresa"></label>
            <label><span>CNPJ</span><input value="00.000.000/0001-00"></label>
            <label><span>Regime tributário</span><select><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select></label>
            <label><span>Segmento</span><input value="Serviços empresariais"></label>
            <label><span>Cidade/UF</span><input value="Fortaleza/CE"></label>
          </div>
          <div class="form-section two">
            <label><span>Responsável legal</span><input value="Nome do empresário"></label>
            <label><span>WhatsApp</span><input value="(85) 99999-9999"></label>
            <label><span>E-mail principal</span><input value="cliente@empresa.com.br"></label>
            <label><span>Grupo econômico</span><input value="Grupo principal ou cliente avulso"></label>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Plano, pagamento e operação</h3>
            <p>A equipe MB pode cadastrar clientes manualmente e escolher o plano contratado.</p>
          </div>
        </div>
        <div class="content-form">
          <div class="form-section two">
            <label>
              <span>Plano contratado</span>
              <select>
                ${Object.entries(plans).map(([key, plan]) => `<option value="${key}">${plan.name} - ${money(plan.price)}</option>`).join("")}
              </select>
            </label>
            <label><span>Forma de pagamento</span><select><option>Pix</option><option>Cartão de crédito</option><option>Faturamento manual MB</option></select></label>
            <label><span>Responsável operacional</span><select><option>Carla Souza</option><option>Lucas Pereira</option><option>Ana Ribeiro</option></select></label>
            <label><span>Consultor financeiro</span><select><option>A definir</option><option>Ana Ribeiro</option><option>Bruno Andrade</option></select></label>
          </div>
          <div class="step-list">
            ${[
              ["Contrato e aceite", "Pendente", "Enviar proposta, aceite e dados de cobrança."],
              ["Documentos iniciais", "Pendente", "Solicitar contrato social, procuração e certificado quando aplicável."],
              ["Usuários", "Pendente", "Criar proprietário, financeiro, RH e leitura quando necessário."],
              ["Primeira competência", "Pendente", "Definir mês inicial para documentos, DAS, folha e análises."]
            ].map(([title, status, detail]) => `
              <div class="step-card">
                <div class="step-icon">${icon("circle")}</div>
                <div><strong>${title}</strong><span>${detail}</span></div>
                <span class="status-pill status-warning">${status}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderAdminPlans() {
  return `
    <section class="grid">
      <article class="panel">
        <div class="panel-header">
          <div><h3>Valores e permissões</h3><p>Os preços ficam editáveis para a equipe MB. As permissões controlam o que aparece para cada cliente.</p></div>
          <button class="btn btn-primary" type="button" data-save-plan-prices>${icon("save")} Atualizar valores</button>
        </div>
        <div class="plan-admin-grid">
          ${Object.entries(plans).map(([key, plan]) => `
            <div class="plan-admin-card">
              <span class="status-pill ${plan.color}">${plan.name}</span>
              <h3 style="margin-top:12px">${plan.tagline}</h3>
              <label>
                <span>Valor mensal</span>
                <input type="number" min="0" step="50" value="${plan.price}" data-plan-price="${key}">
              </label>
              <div class="module-chips">
                ${plan.modules.map((module) => `<span class="chip is-on">${module}</span>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Matriz comercial resumida</h3><p>Diferença clara entre os níveis de serviço.</p></div></div>
        <div class="data-table">
          <div class="data-row is-head"><span>Módulo</span><span>Contabilidade</span><span>Financeiro IA</span><span>CFO</span><span>Regra</span></div>
          ${permissionMatrix.map((row) => `<div class="data-row">${row.map((col) => `<span>${col}</span>`).join("")}</div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderAdminClientContent() {
  const client = currentClient();
  return `
    <section class="admin-editor">
      <aside class="panel">
        <div class="panel-header"><div><h3>Cliente em edição</h3><p>Escolha onde as informações serão publicadas.</p></div></div>
        <div class="client-list">
          ${clients.map((item) => `
            <button class="client-choice ${item.id === state.selectedClientId ? "is-active" : ""}" type="button" data-select-client="${item.id}">
              <strong>${item.name}</strong>
              <span>${plans[item.plan].name} · ${item.confidence}</span>
            </button>
          `).join("")}
        </div>
      </aside>

      <article class="panel">
        <div class="panel-header">
          <div><h3>Alimentar informações do cliente</h3><p>Área para a MB informar dashboard, faturamento, caixa, fiscal, trabalhista e análises antes de publicar.</p></div>
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("send")} Salvar e enviar para aprovação</button>
        </div>

        <div class="content-form">
          <div class="form-section">
            <label><span>Faturamento do mês</span><input value="${money(client.revenue)}"></label>
            <label><span>Despesas do mês</span><input value="${client.expenses ? money(client.expenses) : "Não informado"}"></label>
            <label><span>Impostos / DAS</span><input value="${money(client.taxes)}"></label>
            <label><span>Saldo de caixa</span><input value="${client.cash ? money(client.cash) : "Dados insuficientes"}"></label>
            <label><span>Folha</span><input value="${client.payroll ? money(client.payroll) : "Não aplicável"}"></label>
            <label><span>Nível de confiança</span><select><option>${client.confidence}</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          </div>

          <div class="form-section two">
            <label><span>Análise MB para o dashboard</span><textarea>${client.insights[0]}</textarea></label>
            <label><span>Observação IA sugerida</span><textarea>${client.insights[1] || "Dados insuficientes para análise executiva."}</textarea></label>
          </div>

          <div class="form-section two">
            <label><span>Resumo fiscal</span><textarea>DAS disponível, XML em revisão e faturamento acumulado atualizado para Maio/2026.</textarea></label>
            <label><span>Resumo trabalhista</span><textarea>Folha publicada quando aplicável. Encargos e holerites seguem fluxo de conferência da MB.</textarea></label>
          </div>

          <div class="grid grid-3">
            <div class="notification-item"><strong>Publicação</strong><span>Rascunho interno até aprovação MB.</span></div>
            <div class="notification-item"><strong>Destino</strong><span>Portal do cliente, dashboard e Copiloto.</span></div>
            <div class="notification-item"><strong>Auditoria futura</strong><span>Registrar operador, data, versão anterior e nova versão.</span></div>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderAdminDocuments() {
  const client = currentClient();
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header"><div><h3>Envio MB</h3><p>Principal fluxo de publicação de documentos, guias e relatórios para o cliente.</p></div></div>
        <div class="upload-zone">
          ${icon("folder-up")}
          <div>
            <strong>Enviar documento para ${client.name}</strong>
            <p>Escolha categoria, competência, visibilidade e status antes de publicar.</p>
          </div>
        </div>
        <div class="form-section two" style="margin-top:14px">
          <label><span>Categoria</span><select><option>Fiscal</option><option>Trabalhista</option><option>Contábil</option><option>Financeiro</option><option>Societário</option></select></label>
          <label><span>Competência</span><input value="Maio/2026"></label>
          <label><span>Status</span><select><option>Disponível</option><option>Aguardando revisão</option><option>Pendente</option></select></label>
          <label><span>Visibilidade</span><select><option>Visível para cliente</option><option>Somente MB</option></select></label>
        </div>
        <div class="button-row" style="margin-top:14px"><button class="btn btn-primary" type="button" data-simulate-action>${icon("upload")} Publicar documento</button></div>
      </article>
      <article class="panel">
        <div class="panel-header"><div><h3>Arquivos recentes</h3><p>Histórico operacional do cliente selecionado.</p></div></div>
        <div class="data-table">
          <div class="data-row is-head"><span>Arquivo</span><span>Categoria</span><span>Status</span><span>Prazo</span><span>Ação</span></div>
          ${client.documents.map((doc) => `<div class="data-row"><span>${doc[0]}</span><span>${doc[1]}</span><span>${doc[2]}</span><span>${doc[3]}</span><button class="btn btn-soft" type="button">Ver</button></div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderAdminImports() {
  const client = currentClient();
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Importação operacional</h3>
            <p>Fluxo interno da MB para receber, classificar, validar e publicar dados.</p>
          </div>
          <span class="status-pill status-warning">MVP: processamento assistido</span>
        </div>
        <div class="upload-zone">
          ${icon("database-zap")}
          <div>
            <strong>Importar dados para ${client.name}</strong>
            <p>Arquivos suportados no MVP: Excel, CSV, OFX e XML. A validação humana continua obrigatória.</p>
          </div>
        </div>
        <div class="form-section two" style="margin-top:14px">
          <label><span>Tipo de arquivo</span><select><option>OFX - Extrato bancário</option><option>Excel/CSV - Financeiro</option><option>XML - Notas fiscais</option><option>PDF - Apoio documental</option></select></label>
          <label><span>Competência</span><input value="Maio/2026"></label>
          <label><span>Destino da informação</span><select><option>Dashboard</option><option>DRE</option><option>Fluxo de caixa</option><option>Fiscal</option><option>Trabalhista</option></select></label>
          <label><span>Status após upload</span><select><option>Aguardando validação MB</option><option>Validado</option><option>Rejeitado</option></select></label>
        </div>
        <div class="button-row" style="margin-top:14px">
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("upload")} Enviar para fila</button>
          <button class="btn btn-ghost" type="button" data-simulate-action>${icon("wand-sparkles")} Sugerir categorias</button>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Qualidade da fonte</h3>
            <p>Indica se os dados sustentam as análises liberadas ao cliente.</p>
          </div>
        </div>
        ${renderBars([
          ["ERP / planilha", client.plan === "contabilidade" ? 24 : 72, client.plan === "contabilidade" ? "baixo" : "bom", "blue"],
          ["Banco / OFX", client.plan === "cfo" ? 86 : 44, client.plan === "cfo" ? "validado" : "pendente", "teal"],
          ["XML fiscal", 78, "ok", "amber"],
          ["Categorias", client.plan === "cfo" ? 81 : 38, client.plan === "cfo" ? "revisadas" : "em revisão", "brand"]
        ])}
        <div class="metric-analysis" style="margin-top:14px"><strong>Regra:</strong> análises de caixa, margem e investimento dependem de fonte suficiente e validação MB.</div>
      </article>
    </section>

    <section class="panel" style="margin-top:14px">
      <div class="panel-header">
        <div><h3>Fila de processamento</h3><p>Arquivos recebidos, erros e próximos passos por responsável.</p></div>
      </div>
      <div class="data-table">
        <div class="data-row is-head"><span>Cliente</span><span>Arquivo</span><span>Status</span><span>Responsável</span><span>Próxima ação</span></div>
        ${[
          ["Comércio Silva", "extrato_maio.ofx", "Validado", "Ana Financeiro", "Atualizar fluxo de caixa"],
          ["Clínica Norte", "despesas.csv", "Erro de colunas", "Ana Financeiro", "Solicitar novo arquivo"],
          ["Serviços Prime", "xml_maio.zip", "Aguardando revisão", "Paula Fiscal", "Validar faturamento"],
          ["Comércio Silva", "folha_maio.xlsx", "Processado", "Renata Trabalhista", "Publicar encargos"]
        ].map((row) => `<div class="data-row">${row.map((col) => `<span>${col}</span>`).join("")}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderAdminUsers() {
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div><h3>Usuários internos MB</h3><p>Perfis operacionais para separar responsabilidades, permissões e filas.</p></div>
          <button class="btn btn-primary" type="button" data-simulate-action>${icon("user-plus")} Novo usuário</button>
        </div>
        <div class="data-table">
          <div class="data-row is-head"><span>Usuário</span><span>Perfil</span><span>Status</span><span>Carteira</span><span>Acesso</span></div>
          ${Object.values(operators).map((op, index) => `
            <div class="data-row">
              <span>${op.name}</span>
              <span>${op.role}</span>
              <span class="status-pill status-ok">Ativo</span>
              <span>${index % 2 === 0 ? "CFO / Financeiro" : "Operação / Fiscal"}</span>
              <span>2FA futuro</span>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div><h3>Perfis do cliente</h3><p>O perfil nunca libera algo acima do plano contratado.</p></div>
        </div>
        <div class="role-grid">
          ${[
            ["Proprietário", "Acessa todos os módulos liberados pelo plano.", "crown"],
            ["Gestor financeiro", "Dashboards, documentos financeiros, DRE e caixa quando liberados.", "line-chart"],
            ["RH", "Folha, encargos, holerites e documentos trabalhistas.", "users"],
            ["Somente leitura", "Visualiza informações sem alterar ou aprovar.", "eye"],
            ["Restrito a documentos", "Acessa apenas arquivos específicos.", "lock"]
          ].map(([role, detail, iconName]) => `
            <div class="role-card">
              ${icon(iconName)}
              <strong>${role}</strong>
              <span>${detail}</span>
            </div>
          `).join("")}
        </div>
      </article>
    </section>

    <section class="panel" style="margin-top:14px">
      <div class="panel-header"><div><h3>Criar acesso do cliente</h3><p>Protótipo do fluxo que depois terá convite por e-mail, senha e auditoria.</p></div></div>
      <div class="form-section">
        <label><span>Cliente</span><select>${clients.map((client) => `<option>${client.name}</option>`).join("")}</select></label>
        <label><span>Nome do usuário</span><input value="Nome do usuário"></label>
        <label><span>E-mail</span><input value="usuario@empresa.com.br"></label>
        <label><span>Perfil</span><select><option>Proprietário</option><option>Gestor financeiro</option><option>RH</option><option>Somente leitura</option><option>Restrito a documentos</option></select></label>
        <label><span>Status</span><select><option>Convite pendente</option><option>Ativo</option><option>Bloqueado</option></select></label>
        <label><span>Módulos visíveis</span><input value="Definidos automaticamente pelo plano"></label>
      </div>
    </section>
  `;
}

function renderAdminApprovals() {
  const approvals = [
    ["Comércio Silva", "Parecer de capacidade de investimento", "Alta", "Bruno CFO", "Aguardando aprovação"],
    ["Clínica Norte", "Insight sobre crescimento de folha", "Média", "Ana Financeiro", "Editar antes de liberar"],
    ["Serviços Prime", "Bloqueio de margem por dados insuficientes", "Baixa", "Lucas Atendimento", "Aprovar aviso"]
  ];
  return `
    <section class="panel">
      <div class="panel-header">
        <div><h3>Governança de IA e relatórios</h3><p>A IA sugere, mas a MB aprova, edita ou rejeita antes de liberar ao cliente.</p></div>
      </div>
      <div class="data-table">
        <div class="data-row is-head"><span>Cliente</span><span>Análise</span><span>Confiança</span><span>Responsável</span><span>Ação</span></div>
        ${approvals.map((row) => `
          <div class="data-row">
            <span>${row[0]}</span>
            <span>${row[1]}</span>
            <span>${row[2]}</span>
            <span>${row[3]}</span>
            <span class="button-row">
              <button class="btn btn-soft" type="button" data-simulate-action>Aprovar</button>
              <button class="btn btn-ghost" type="button" data-simulate-action>Editar</button>
            </span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAdminAudit() {
  const events = [
    ["Hoje 10:42", "Bruno Andrade", "Aprovou parecer CFO", "Comércio Silva", "Insight publicado"],
    ["Hoje 09:58", "Ana Ribeiro", "Solicitou OFX", "Clínica Norte", "Pendência criada"],
    ["Hoje 09:21", "Paula Martins", "Publicou DAS", "18 clientes", "Documentos liberados"],
    ["Ontem 17:35", "Carla Souza", "Alterou plano", "Serviços Prime", "Contabilidade mantido"],
    ["Ontem 14:10", "Sistema", "Gerou alerta de upgrade", "Clínica Norte", "Aguardando contato"]
  ];
  return `
    <section class="grid grid-2">
      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Trilha de auditoria</h3>
            <p>Toda ação relevante deve registrar quem fez, quando, o que mudou e onde impactou.</p>
          </div>
        </div>
        <div class="audit-list">
          ${events.map(([date, user, action, target, result]) => `
            <div class="audit-item">
              <time>${date}</time>
              <div>
                <strong>${action}</strong>
                <span>${user} · ${target} · ${result}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <h3>Filtros de governança</h3>
            <p>Busca futura por cliente, operador, entidade, módulo, data e tipo de alteração.</p>
          </div>
        </div>
        <div class="form-section two">
          <label><span>Cliente</span><select><option>Todos</option>${clients.map((client) => `<option>${client.name}</option>`).join("")}</select></label>
          <label><span>Operador</span><select><option>Todos</option>${Object.values(operators).map((op) => `<option>${op.name}</option>`).join("")}</select></label>
          <label><span>Módulo</span><select><option>Todos</option><option>Planos</option><option>Documentos</option><option>DRE</option><option>IA</option><option>Usuários</option></select></label>
          <label><span>Período</span><select><option>Últimos 7 dias</option><option>Últimos 30 dias</option><option>Competência atual</option></select></label>
        </div>
        <div class="metric-analysis" style="margin-top:14px"><strong>Produto:</strong> auditoria real será obrigatória antes de produção, principalmente para documentos, aprovações, permissões e relatórios.</div>
      </article>
    </section>
  `;
}

function renderAdminReports() {
  return `
    <section class="grid grid-3">
      ${[
        ["Carteira por plano", "128 clientes", "Mostra distribuição comercial e evolução de receita recorrente."],
        ["Produtividade da equipe", "84% no prazo", "Acompanha entregas, filas e SLAs por responsável."],
        ["Oportunidades de upgrade", "14 clientes", "Identifica clientes prontos para Financeiro IA ou CFO."],
        ["Status de documentos", "31 pendentes", "Mostra documentos aguardando envio, revisão ou publicação."],
        ["Integrações e importações", "9 falhas", "Acompanha OFX, CSV, Excel, XML e futuras integrações."],
        ["Risco de cancelamento", "5 clientes", "Combina baixo acesso, pendências e insatisfação operacional."]
      ].map((item) => `
        <article class="panel">
          <div class="panel-header"><div><h3>${item[0]}</h3><p>${item[2]}</p></div></div>
          <strong style="font-size:32px">${item[1]}</strong>
          <div class="button-row" style="margin-top:14px"><button class="btn btn-ghost" type="button" data-simulate-action>${icon("file-text")} Abrir relatório</button></div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderBars(items) {
  return `
    <div class="bar-chart">
      ${items.map(([label, value, text, color]) => `
        <div class="bar-row">
          <span>${label}</span>
          <div class="bar-track"><div class="bar-fill ${color || ""}" style="--value:${Math.min(value, 100)}%"></div></div>
          <strong>${text}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderSparkline(values, color) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 150;
    const y = 34 - ((value - min) / Math.max(max - min, 1)) * 28;
    return `${x},${y}`;
  }).join(" ");
  const stroke = color === "teal" ? "#0f766e" : color === "blue" ? "#1d4ed8" : color === "amber" ? "#d97706" : "#8f121b";
  return `
    <svg class="sparkline" viewBox="0 0 150 38" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

function renderLineChart(months) {
  const width = 520;
  const height = 220;
  const padding = 28;
  const values = months.flatMap((item) => [item[1], item[2]]);
  const max = Math.max(...values) * 1.12;
  const xFor = (index) => padding + (index / (months.length - 1)) * (width - padding * 2);
  const yFor = (value) => height - padding - (value / max) * (height - padding * 2);
  const line = (key) => months.map((item, index) => `${xFor(index)},${yFor(item[key])}`).join(" ");
  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de evolução financeira">
      ${[0, 1, 2, 3].map((i) => {
        const y = padding + i * 46;
        return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" stroke="#e7ebf0" stroke-width="1"></line>`;
      }).join("")}
      <polyline points="${line(1)}" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      <polyline points="${line(2)}" fill="none" stroke="#d97706" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${months.map((item, index) => `
        <circle cx="${xFor(index)}" cy="${yFor(item[1])}" r="4" fill="#1d4ed8"></circle>
        <circle cx="${xFor(index)}" cy="${yFor(item[2])}" r="4" fill="#d97706"></circle>
        <text x="${xFor(index)}" y="${height - 4}" text-anchor="middle" font-size="11" fill="#667085">${item[0]}</text>
      `).join("")}
    </svg>
  `;
}

function printReport(type) {
  const client = currentClient();
  const title = type === "dre" ? "DRE Gerencial" : "Fluxo de Caixa";
  const rows = type === "dre"
    ? client.dre.map((row) => `<tr><td>${row[0]}</td><td>${money(row[1])}</td><td>${row[2]}</td></tr>`).join("")
    : client.cashBridge.map((row) => `<tr><td>${row[0]}</td><td>${money(row[1])}</td><td>${row[2]}</td></tr>`).join("");
  const report = window.open("", "_blank");
  report.document.write(`
    <html lang="pt-BR">
      <head>
        <title>${title} - ${client.name}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:36px;color:#111318}
          header{border-bottom:3px solid #5b070b;padding-bottom:18px;margin-bottom:24px}
          h1{margin:0;font-size:28px} p{color:#667085}
          table{width:100%;border-collapse:collapse;margin-top:18px}
          th,td{border:1px solid #dfe4ea;padding:10px;text-align:left}
          th{background:#f5f6f8}
          footer{margin-top:32px;color:#667085;font-size:12px}
        </style>
      </head>
      <body>
        <header>
          <h1>${title}</h1>
          <p>${client.name} · Maio/2026 · Relatório padronizado MB Intelligence</p>
        </header>
        <table><thead><tr><th>Descrição</th><th>Valor</th><th>Referência</th></tr></thead><tbody>${rows}</tbody></table>
        <footer>Relatório gerado para validação do protótipo do produto final. Versão futura terá assinatura, auditoria e histórico.</footer>
        <script>window.print();<\/script>
      </body>
    </html>
  `);
  report.document.close();
}

function exportReport(type) {
  const client = currentClient();
  const rows = type === "dre"
    ? [["Conta", "Valor", "% Receita"], ...client.dre]
    : [["Descrição", "Valor", "Tipo"], ...client.cashBridge];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type === "dre" ? "DRE" : "Fluxo_Caixa"}_${client.name.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setToast("Arquivo Excel/CSV gerado para validação do relatório.");
}

function bindEvents() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.session = { type: "client", clientId: data.get("clientId") || "silva" };
    state.view = "intelligence";
    render();
  });

  document.querySelector("[data-login-admin]")?.addEventListener("click", () => {
    const form = document.querySelector("[data-login-form]");
    const data = new FormData(form);
    state.session = { type: "admin", operator: data.get("operator") || "master" };
    state.adminView = "operation";
    state.selectedClientId = data.get("clientId") || "silva";
    render();
  });

  document.querySelectorAll("[data-demo-client]").forEach((button) => {
    button.addEventListener("click", () => {
      state.session = { type: "client", clientId: button.dataset.demoClient };
      state.view = "intelligence";
      render();
    });
  });

  document.querySelectorAll("[data-demo-admin]").forEach((button) => {
    button.addEventListener("click", () => {
      state.session = { type: "admin", operator: button.dataset.demoAdmin };
      state.adminView = "operation";
      render();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.querySelector("[data-open-client-imports]")?.addEventListener("click", () => {
    state.view = "imports";
    render();
  });

  document.querySelectorAll("[data-admin-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.adminView = button.dataset.adminView;
      render();
    });
  });

  document.querySelectorAll("[data-select-client]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedClientId = button.dataset.selectClient;
      render();
    });
  });

  document.querySelectorAll("[data-client-plan]").forEach((select) => {
    select.addEventListener("change", () => {
      const client = clientById(select.dataset.clientPlan);
      client.plan = select.value;
      saveWorkspace();
      setToast(`Plano atualizado para ${plans[select.value].name}.`);
    });
  });

  document.querySelector("[data-save-plan-prices]")?.addEventListener("click", () => {
    document.querySelectorAll("[data-plan-price]").forEach((input) => {
      plans[input.dataset.planPrice].price = Number(input.value || 0);
    });
    saveWorkspace();
    setToast("Valores dos planos atualizados para esta sessão do produto.");
  });

  document.querySelectorAll("[data-print-report]").forEach((button) => {
    button.addEventListener("click", () => printReport(button.dataset.printReport));
  });

  document.querySelectorAll("[data-export-report]").forEach((button) => {
    button.addEventListener("click", () => exportReport(button.dataset.exportReport));
  });

  document.querySelectorAll("[data-simulate-action]").forEach((button) => {
    button.addEventListener("click", () => setToast("Ação registrada no protótipo do produto. Na versão técnica, isso gravará histórico e auditoria."));
  });

  document.querySelectorAll("[data-select-purchase]").forEach((button) => {
    button.addEventListener("click", () => {
      setToast(`Plano ${plans[button.dataset.selectPurchase].name} selecionado para contratação simulada.`);
    });
  });

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    state.session = null;
    state.view = "intelligence";
    state.adminView = "operation";
    render();
  });
}

loadWorkspace();
render();
