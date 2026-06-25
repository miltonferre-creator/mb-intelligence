/* Faithful reconstruction of MB Intelligence screens for marketing material.
   Uses the REAL ui.js component library + REAL styles.css so output matches
   production pixel-for-pixel. Data is clean, professional demo data. */
(function () {
  const ui = MBI.ui;
  const money = ui.money;
  const icon = ui.icon;

  // ---- Demo data (professional, fictional) -------------------------------
  const CLIENT = { id: "aurora", name: "Comercial Aurora LTDA", owner: "Mariana Alves", confidence: "Alta" };
  const FIN = {
    competence: "2026-06", competenceLabel: "jun de 26",
    revenue: 184000, result: 42000, margin: 22.8, taxes: 13900, cash: 132000, score: 74, runway: 58,
    months: [
      ["jan de 26", 156, 126], ["fev de 26", 168, 132], ["mar de 26", 159, 128],
      ["abr de 26", 171, 134], ["mai de 26", 176, 138], ["jun de 26", 184, 142]
    ],
    cashMonths: [
      ["jan de 26", 150, 130], ["fev de 26", 162, 136], ["mar de 26", 158, 133],
      ["abr de 26", 168, 138], ["mai de 26", 172, 141], ["jun de 26", 181, 146]
    ],
    scoreBreakdown: [
      { label: "Liquidez", score: 88 }, { label: "Rentabilidade", score: 82 },
      { label: "Endividamento", score: 64 }, { label: "Eficiência", score: 70 },
      { label: "Crescimento", score: 78 }, { label: "Pontualidade", score: 62 }
    ]
  };

  function clientMenu(active) {
    return ui.nav([
      ["#/cliente/inicio", "home", "Início"],
      ["#/cliente/inteligencia", "layout-dashboard", "Dashboard"],
      ["#/cliente/documentos", "folder-open", "Documentos"],
      ["#/cliente/comunicacao", "messages-square", "Comunicação"],
      ["#/cliente/perfil", "user-round", "Perfil"]
    ], active);
  }
  function adminMenu(active) {
    return ui.nav([
      ["#/admin/operacao", "layout-dashboard", "Operação"],
      ["#/admin/clientes", "building-2", "Clientes"],
      ["#/admin/alimentar-portal", "panel-top", "Alimentar portal"],
      ["#/admin/documentos", "folder-up", "Documentos"],
      ["#/admin/configuracao", "settings", "Configuração"],
      ["#/admin/usuarios", "users", "Usuários"],
      ["#/admin/auditoria", "history", "Auditoria"]
    ], active);
  }

  // ---- Client Dashboard (intelligence) -----------------------------------
  function kpiGrid() {
    return `<section class="grid grid-4 kpi-grid">
      ${ui.kpi("Faturamento", money(FIN.revenue), FIN.competenceLabel, "Receita atualizada para a competência.", "blue", 4.5, [156,168,159,171,176,184], false, "banknote")}
      ${ui.kpi("Resultado", money(FIN.result), `${FIN.margin}% margem`, "Resultado validado pela MB.", "teal", 10.5, [30,36,31,37,38,42], false, "trending-up")}
      ${ui.kpi("Impostos / DAS", money(FIN.taxes), "Fiscal", "Acompanhamento fiscal por competência.", "amber", 6.9, [12,12.5,12.8,13,13.5,13.9], true, "receipt")}
      ${ui.kpi("Score MB", `${FIN.score}/100`, "Financeiro", "Score financeiro calculado pela MB.", "brand", 1.4, [70,71,72,72,73,74], false, "shield")}
    </section>`;
  }
  function competenceTopbar() {
    return `<form class="topbar-client">
      <span class="topbar-client-tag">${icon("calendar-days")} Competência</span>
      <select aria-label="Competência"><option>jun de 26</option><option>mai de 26</option><option>abr de 26</option></select>
      <button class="competence-filter-go" type="button">Ver</button>
    </form>`;
  }
  function dashboard() {
    const scoreWord = "Bom";
    const scorePanel = `<article class="panel score-panel"><div class="panel-header"><div><h3>Saúde financeira</h3><p>Score consolidado MB · ${FIN.scoreBreakdown.length} dimensões</p></div></div>${ui.scoreGauge(FIN.score, `${scoreWord} · meta 80`)}${ui.scoreBars(FIN.scoreBreakdown)}</article>`;
    const content = `
      <div class="exec-dash">
        ${kpiGrid()}
        <section class="exec-action exec-action--inline" style="margin-top:10px">
          <div class="exec-alert is-good">${icon("check-circle")}<span><strong>Inteligência MB · Situação:</strong> Indicadores dentro do esperado em ${FIN.competenceLabel}. Siga acompanhando o fechamento mensal com a MB.</span></div>
          <button class="btn btn-primary btn-mini" type="button">${icon("messages-square")} Falar com a MB</button>
        </section>
        <section class="grid dash-split" style="margin-top:10px">
          <article class="panel chart">
            <div class="panel-header"><div><h3>Receita, Despesa e Resultado</h3><p>Linha temporal — passe o mouse ou clique numa competência.</p></div></div>
            ${ui.execTimeChart(FIN.months)}
            <div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesa</span><span><i class="legend-dot teal"></i> Resultado</span></div>
          </article>
          ${scorePanel}
        </section>
      </div>`;
    return ui.shell({
      title: "Dashboard",
      subtitle: `${CLIENT.name} · Confiança ${CLIENT.confidence}`,
      menu: clientMenu("#/cliente/inteligencia"),
      content, sessionLabel: "Cliente", sessionName: CLIENT.owner,
      topbarExtra: competenceTopbar()
    });
  }

  // ---- Client Home -------------------------------------------------------
  function trend(text) { return `<span class="delta-pill is-up">▲ ${text}</span>`; }
  function home() {
    const docsPanel = `<article class="panel home-panel">
      <div class="panel-header"><div><h3>Documento mais recente</h3><p>Último arquivo liberado pela MB para você.</p></div><button class="btn btn-ghost btn-mini" type="button">Ver todos (4)</button></div>
      <div class="home-list"><div class="home-row">
        <div class="home-row-main"><strong>Apuração e guia DAS — Maio/2026</strong><span>Fiscal · 2026-06 · <b class="home-due">vence 20/06/2026</b></span></div>
        <button class="btn btn-primary btn-mini" type="button">${icon("download")} Baixar</button>
      </div></div></article>`;
    const quickActions = `<section class="home-actions">
      <button class="btn btn-primary" type="button">${icon("folder-open")} Meus documentos</button>
      <button class="btn btn-soft" type="button">${icon("messages-square")} Falar com a MB</button>
      <button class="btn btn-soft" type="button">${icon("layout-dashboard")} Ver dashboard</button>
    </section>`;
    const brief = `<div class="exec-headline">
        <div class="exec-metric"><span>Faturou</span><strong>${money(FIN.revenue)}</strong>${trend("4,5%")}</div>
        <div class="exec-metric"><span>Resultado</span><strong>${money(FIN.result)}</strong>${trend("10,5%")}</div>
        <div class="exec-metric"><span>Em caixa</span><strong>${money(FIN.cash)}</strong>${trend("3,1%")}</div>
        <div class="exec-metric"><span>Margem</span><strong>22,8%</strong><span class="delta-pill is-flat">58 dias de fôlego</span></div>
      </div>
      <div class="exec-alert is-good">${icon("check-circle")}<span><strong>Situação:</strong> Indicadores dentro do esperado em jun de 26. Siga acompanhando o fechamento mensal com a MB. Comparado a mai de 26.</span></div>`;
    const financeBlock = `<article class="panel"><div class="panel-header"><div><h3>Resumo financeiro · ${FIN.competenceLabel}</h3><p>Leitura rápida. Detalhes completos em Financeiro.</p></div></div>${brief}</article>`;
    const content = `
      <section class="home-hero is-warn">
        <div class="home-hero-text"><span>Boa tarde, ${CLIENT.owner}.</span><strong>${CLIENT.name} · ${FIN.competenceLabel}</strong></div>
        <div class="home-status is-warn">${icon("alert-triangle")}<span>2 pendência(s) aguardando você ou a MB</span></div>
      </section>
      <section style="margin-top:14px">${docsPanel}</section>
      ${quickActions}
      <section style="margin-top:14px">${financeBlock}</section>`;
    return ui.shell({
      title: "Início", subtitle: `${CLIENT.name} · Confiança ${CLIENT.confidence}`,
      menu: clientMenu("#/cliente/inicio"), content,
      sessionLabel: "Cliente", sessionName: CLIENT.owner, topbarExtra: ""
    });
  }

  // ---- Admin Operação ----------------------------------------------------
  function adminTopbar() {
    return `<form class="topbar-client">
      <span class="topbar-client-tag">${icon("building-2")} Cliente</span>
      <select aria-label="Cliente"><option>Comercial Aurora LTDA</option></select>
      <button class="competence-filter-go" type="button">Trocar</button>
    </form>`;
  }
  function operacao() {
    const fee = "R$ 890/mês";
    const opStats = `<div class="op-stats">
      <div><span>Faturamento</span><strong>${money(FIN.revenue)}</strong></div>
      <div><span>Resultado</span><strong>${money(FIN.result)}</strong></div>
      <div><span>Margem</span><strong>${FIN.margin}%</strong></div>
      <div><span>Score MB</span><strong>${FIN.score}/100</strong></div>
    </div>`;
    const steps = [
      ["1", "Cadastrar", "Cliente ativo", "building-2", true],
      ["2", "Alimentar dados", "Dados carregados", "database-zap", true],
      ["3", "Publicar documentos", "4 publicado(s)", "folder-up", true],
      ["4", "Entregar ao cliente", "Disponível no portal do cliente", "send", false]
    ];
    const workflow = `<section class="panel workflow-panel">
      <div class="panel-header"><div><h3>Fluxo de trabalho</h3><p>O passo a passo para deixar o portal deste cliente pronto.</p></div>${ui.pill(fee)}</div>
      <div class="workflow-steps">${steps.map(([n,title,status,ic,done]) => `
        <div class="workflow-step ${done ? "is-done" : ""}"><span class="workflow-num">${done ? icon("check") : n}</span>
          <div class="workflow-step-body">${icon(ic)}<strong>${title}</strong><span>${status}</span></div></div>`).join("")}
      </div></section>`;
    const tasks = [
      ["Enviar extrato bancário de junho", "Cliente · vence 10/07/2026", "Aguardando cliente", "high"],
      ["Revisar despesas administrativas", "MB · vence 15/07/2026", "Em andamento", "medium"]
    ];
    const taskList = `<section style="margin-top:14px"><article class="panel"><div class="panel-header"><div><h3>Próximas ações</h3><p>Tarefas deste cliente.</p></div>${ui.pill("2")}</div>
      <div class="priority-list">${tasks.map(([t,m,s,p]) => `<div class="priority-item"><span class="priority-dot ${p}"></span><div><strong>${t}</strong><span>${m}</span></div>${ui.pill(s)}</div>`).join("")}</div></article></section>`;
    const content = `
      <section><article class="panel selected-client-card">
        <div class="panel-header"><div><h3>${CLIENT.name}</h3><p>${fee} · Ativo · Confiança ${CLIENT.confidence} · ${FIN.competenceLabel}</p></div>${ui.pill(CLIENT.confidence)}</div>
        ${opStats}
        <div class="brief-actions" style="margin-top:12px">
          <button class="btn btn-primary" type="button">${icon("panel-top")} Alimentar portal</button>
          <button class="btn btn-ghost" type="button">${icon("folder-up")} Publicar documento</button>
        </div>
      </article></section>
      ${workflow}
      ${taskList}`;
    return ui.shell({
      title: "Operação MB", subtitle: "Operador: MB Admin",
      menu: adminMenu("#/admin/operacao"), content,
      sessionLabel: "Administrador", sessionName: "MB Admin", topbarExtra: adminTopbar()
    });
  }

  // ---- Login -------------------------------------------------------------
  function login() {
    return `<main class="login-page login-solo">
      <div class="login-solo-card">
        <div class="login-brandbar"><img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial"></div>
        <div class="section-title"><h2>Acesse seu portal</h2><p>Documentos, guias e inteligência financeira da sua empresa em um só lugar.</p></div>
        <form class="login-form">
          <div class="form-grid">
            <label><span>E-mail</span><input type="email" value="mariana@comercialaurora.com.br" readonly></label>
            <label><span>Senha</span><input type="password" value="123456789" readonly></label>
          </div>
          <button class="btn btn-primary login-solo-btn" type="button">${icon("log-in")} Entrar</button>
          <div class="login-footer-links"><button class="btn-link" type="button">Esqueci minha senha</button><span>·</span><button class="btn-link" type="button">Privacidade e LGPD</button></div>
        </form>
      </div>
    </main>`;
  }

  window.SCREENS = { dashboard, home, operacao, login };
})();
