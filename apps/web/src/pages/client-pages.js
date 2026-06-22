(function () {
  window.MBI = window.MBI || {};
  MBI.pages = MBI.pages || {};

  const routeTitles = {
    "#/cliente/inicio": "Início",
    "#/cliente/inteligencia": "Dashboard",
    "#/cliente/onboarding": "Onboarding",
    "#/cliente/documentos": "Documentos e guias",
    "#/cliente/comunicacao": "Comunicação MB",
    "#/cliente/perfil": "Perfil e acessos"
  };

  function menu(active, client) {
    const items = [["#/cliente/inicio", "home", "Início"]];
    if (client && tabAllowed(client, "finance")) items.push(["#/cliente/inteligencia", "layout-dashboard", "Dashboard"]);
    items.push(
      ["#/cliente/documentos", "folder-open", "Documentos"],
      ["#/cliente/comunicacao", "messages-square", "Comunicação"],
      ["#/cliente/perfil", "user-round", "Perfil"]
    );
    return MBI.ui.nav(items, active);
  }

  function currentMonthValue() {
    return MBI.services.finance?.currentMonth?.() || new Date().toISOString().slice(0, 7);
  }

  function sessionFilters(key) {
    return MBI.auth.currentSession()?.uiFilters?.[key] || {};
  }

  function competenceSelector(client, data) {
    const options = data.competences?.length ? data.competences : MBI.services.finance.listCompetences(client.id);
    return `
      <div class="competence-bar">
        <form class="competence-filter" data-form="select-competence">
          <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
          <span class="competence-filter-ic">${MBI.ui.icon("calendar-days")}</span>
          <span class="competence-filter-tag">Competência</span>
          <select name="competence" aria-label="Competência" onchange="this.form.requestSubmit()">${options.map((item) => `<option value="${MBI.ui.escape(item.value)}" ${item.value === data.competence ? "selected" : ""}>${MBI.ui.escape(item.label)}</option>`).join("")}</select>
          <button class="competence-filter-go" type="submit" aria-label="Aplicar competência">Ver</button>
        </form>
      </div>
    `;
  }

  function shell(route, content) {
    const client = MBI.services.clients.current();
    const plan = MBI.services.plans.get(client.planId);
    return MBI.ui.shell({
      title: routeTitles[route] || "Portal do Cliente",
      subtitle: `${MBI.ui.escape(client.name)} · ${MBI.ui.escape(plan.name)} · Confiança ${MBI.ui.escape(client.confidence)}`,
      menu: menu(route, client),
      content,
      sessionLabel: plan.name,
      sessionName: client.owner
    });
  }

  function render(route) {
    const client = MBI.services.clients.current();
    if (route === "#/cliente/inicio") return shell(route, home(client));
    if (route === "#/cliente/onboarding") return shell(route, onboarding(client));
    if (route === "#/cliente/documentos") return shell(route, documents(client));
    if (route === "#/cliente/importacoes") return shell("#/cliente/documentos", documents(client));
    if (route === "#/cliente/comunicacao") return shell(route, communication(client));
    if (route === "#/cliente/perfil") return shell(route, profile(client));
    if (route === "#/cliente/inteligencia") return shell(route, intelligence(client));
    return shell("#/cliente/inicio", home(client));
  }

  function processStatus(client, data) {
    const docs = MBI.services.documents.listByClient(client.id);
    const imports = MBI.services.imports.list(client.id);
    const tasks = MBI.storage.getDatabase().tasks.filter((task) => task.clientId === client.id);
    const financeReady = Number(data.revenue || 0) > 0;
    const cashReady = client.planId === "cfo" ? data.cashBridge?.length > 0 : imports.some((item) => item.status?.includes("Valid"));
    return [
      ["Documentos", docs.length ? "Em dia" : "Pendente", docs.length ? `${docs.length} arquivo(s) liberado(s)` : "Aguardando primeira publicacao MB", "folder-check"],
      ["Dados", financeReady ? "Atualizado" : "Insuficiente", financeReady ? "Base financeira disponivel para leitura" : "A MB ainda vai carregar ou solicitar dados", "database"],
      ["Caixa", cashReady ? "Validado" : "Em revisao", cashReady ? "Fluxo de caixa pode ser acompanhado" : "Depende de OFX, Excel ou conciliacao", "wallet"],
      ["Acoes", tasks.length ? `${tasks.length} abertas` : "Sem pendencias", tasks.length ? "Existe acompanhamento ativo" : "Nenhuma acao pendente no momento", "list-checks"]
    ];
  }

  function copilotSignals(client, data) {
    const signals = [];
    const tasks = MBI.storage.getDatabase().tasks.filter((task) => task.clientId === client.id);
    const docs = MBI.services.documents.listByClient(client.id);
    const margin = Number(data.margin || 0);
    const target = Number(data.marginTarget || 20);
    const runway = Number(data.runway || 0);
    const expenses = Number(data.expenses || 0);
    const revenue = Number(data.revenue || 0);
    if (tasks.some((task) => task.priority === "Alta")) signals.push(["Alta", "Resolver pendencia critica", tasks.find((task) => task.priority === "Alta")?.title || "Pendencia prioritaria da MB", "MB"]);
    if (client.planId !== "contabilidade" && revenue && expenses > revenue) signals.push(["Alta", "Revisar consumo de caixa", "Despesas acima do faturamento informado.", "IA MB"]);
    if (client.planId !== "contabilidade" && runway && runway < 30) signals.push(["Alta", "Preservar caixa", `Folego estimado em ${runway} dias; priorizar reducao de saidas.`, "IA MB"]);
    if (client.planId === "cfo" && margin < target) signals.push(["Media", "Recuperar margem", `Margem atual ${margin}% abaixo da meta MB de ${target}%.`, "MB CFO"]);
    if (!docs.length) signals.push(["Media", "Aguardar documentos base", "A MB ainda vai publicar documentos iniciais no portal.", "Sistema"]);
    if (!signals.length) signals.push(["Normal", "Acompanhar fechamento", "Nenhuma prioridade critica aberta nesta competencia.", "Copiloto"]);
    return signals.slice(0, 4);
  }

  function liveFeed(client, data) {
    const db = MBI.storage.getDatabase();
    const docs = MBI.services.documents.listByClient(client.id).slice(-2).map((doc) => ["Documento", MBI.ui.escape(doc.name || doc.fileName), MBI.ui.escape(doc.competence || doc.due || "Publicado")]);
    const messages = (db.messages || []).filter((message) => message.clientId === client.id).slice(-2).map((message) => ["Mensagem", MBI.ui.escape(message.text), MBI.ui.escape(message.at || "Agora")]);
    const tasks = (db.tasks || []).filter((task) => task.clientId === client.id).slice(-2).map((task) => ["Acao", MBI.ui.escape(task.title), MBI.ui.escape(task.status || task.due || "Em acompanhamento")]);
    const rows = [...tasks, ...docs, ...messages].slice(-5);
    if (!rows.length) rows.push(["Sistema", "Aguardando primeira atualizacao operacional da MB.", data.competenceLabel || "Competencia atual"]);
    return `<div class="timeline">${rows.map(([type, text, meta]) => `<div class="timeline-item"><time>${type}</time><span><strong>${text}</strong><br>${meta}</span></div>`).join("")}</div>`;
  }

  function percentOf(value, base) {
    const denominator = Number(base || 0);
    if (!denominator) return 0;
    return Math.max(0, Math.min(100, Math.round((Math.abs(Number(value || 0)) / denominator) * 100)));
  }

  function scoreBars(data) {
    const rows = data.scoreBreakdown || [];
    if (!rows.length) return [["Score calculado", data.score || 0, `${data.score || 0}/100`, "brand"]];
    return rows.map((item) => [item.label, Math.round(item.score || 0), `${Math.round(item.score || 0)}/100 · ${item.value}`, item.status === "Saudavel" ? "teal" : item.status === "Risco" ? "amber" : "blue"]);
  }

  function expenseCompositionBars(data) {
    const revenue = Number(data.revenue || 0);
    const payroll = Number(data.payroll || 0);
    const taxes = Number(data.taxes || 0);
    const expenses = Number(data.expenses || 0);
    const remaining = Math.max(expenses - payroll - taxes, 0);
    return [
      ["Despesas operacionais", percentOf(remaining, revenue), MBI.ui.money(remaining), "brand"],
      ["Folha", percentOf(payroll, revenue), MBI.ui.money(payroll), "teal"],
      ["Impostos", percentOf(taxes, revenue), MBI.ui.money(taxes), "blue"],
      ["Total de despesas", percentOf(expenses, revenue), MBI.ui.money(expenses), "amber"]
    ];
  }

  // Tendencia formatada vs mes anterior. invert=true para indicadores onde subir e ruim.
  function pctText(value) {
    const r = Math.round(Number(value || 0) * 10) / 10;
    return `${r > 0 ? "+" : ""}${String(r).replace(".", ",")}%`;
  }

  function trendTag(value, invert, label) {
    if (label) return `<span class="trend-tag is-flat">${label}</span>`;
    const v = Number(value || 0);
    if (!v) return `<span class="trend-tag is-flat">estável</span>`;
    const good = invert ? v < 0 : v > 0;
    return `<span class="trend-tag ${good ? "is-good" : "is-bad"}">${v > 0 ? "▲" : "▼"} ${pctText(v)}</span>`;
  }

  // Escolhe o alerta executivo mais importante do mes (1 acao clara).
  function executiveAlert(data) {
    const result = Number(data.result || 0);
    const margin = Number(data.margin || 0);
    const runway = Number(data.runway || 0);
    const target = Number(data.marginTarget || 20);
    if (result < 0) return ["is-bad", `Sua empresa fechou ${data.competenceLabel} com prejuízo de ${MBI.ui.money(Math.abs(result))}. Vale revisar custos e caixa com a MB.`];
    if (runway && runway < 45) return ["is-warn", `O caixa cobre cerca de ${Math.round(runway)} dias de operação — abaixo da reserva de 45 dias recomendada pela MB.`];
    if (margin && margin < target) return ["is-warn", `A margem de ${String(margin).replace(".", ",")}% está abaixo da meta de ${target}%. Há espaço para melhorar o resultado.`];
    return ["is-good", `Indicadores dentro do esperado em ${data.competenceLabel}. Siga acompanhando o fechamento mensal com a MB.`];
  }

  // Leitura executiva: responde em 5s quanto faturou, lucrou, tem em caixa e o que exige atencao.
  function executiveBrief(client, data) {
    if (client.planId === "contabilidade") {
      return `<div class="brief-copy"><strong>Leitura financeira disponível no Plano Gestão</strong><span>Seu plano acompanha documentos, guias e obrigações fiscais. Para ver faturamento, resultado, margem e caixa com leitura executiva automática, evolua para o Plano Gestão.</span></div>`;
    }
    if (!(Number(data.revenue || 0) > 0)) {
      return `<div class="brief-copy"><strong>Aguardando sua base financeira</strong><span>A MB ainda não carregou os dados de ${data.competenceLabel}. Assim que entrarem, sua leitura executiva — quanto faturou, lucrou e tem em caixa — aparece aqui automaticamente.</span></div>`;
    }
    const { current, previous } = currentAndPrevious(client, data);
    const [tone, alertText] = executiveAlert(data);
    const since = previous?.label ? ` Comparado a ${previous.label}.` : "";
    return `
      <div class="exec-headline">
        <div class="exec-metric"><span>Faturou</span><strong>${MBI.ui.money(data.revenue)}</strong>${trendTag(delta(current, previous, "revenue"))}</div>
        <div class="exec-metric"><span>Resultado</span><strong>${MBI.ui.money(data.result)}</strong>${trendTag(delta(current, previous, "result"))}</div>
        <div class="exec-metric"><span>Em caixa</span><strong>${MBI.ui.money(data.cash)}</strong>${trendTag(delta(current, previous, "cash"))}</div>
        <div class="exec-metric"><span>Margem</span><strong>${String(data.margin || 0).replace(".", ",")}%</strong>${trendTag(0, false, `${data.runway || 0} dias de fôlego`)}</div>
      </div>
      <div class="exec-alert ${tone}">${MBI.ui.icon(tone === "is-good" ? "check-circle" : "alert-triangle")}<span><strong>${tone === "is-good" ? "Situação" : "Atenção"}:</strong> ${alertText}${since}</span></div>
    `;
  }

  function cockpit(client, data) {
    const plan = MBI.services.plans.get(client.planId);
    const tasks = MBI.storage.getDatabase().tasks.filter((task) => task.clientId === client.id);
    const primaryTask = tasks[0];

    return `
      <section class="journey-hero">
        <article class="panel executive-brief">
          <div class="panel-header">
            <div><h3>Leitura executiva</h3><p>${MBI.ui.escape(plan.name)} · ${MBI.ui.escape(data.competenceLabel || "competência atual")}.</p></div>
            ${MBI.ui.pill(client.status)}
          </div>
          ${executiveBrief(client, data)}
          <div class="brief-actions">
            <button class="btn btn-primary" type="button" data-route="#/cliente/documentos">${MBI.ui.icon("folder-open")} Ver documentos</button>
            <button class="btn btn-ghost" type="button" data-route="#/cliente/comunicacao">${MBI.ui.icon("messages-square")} Falar com a MB</button>
          </div>
        </article>
        <article class="panel priority-panel">
          <div class="panel-header"><div><h3>Prioridade agora</h3><p>O que move sua empresa para a proxima etapa.</p></div></div>
          <div class="priority-callout">
            <span class="priority-dot ${primaryTask?.priority === "Alta" ? "high" : "medium"}"></span>
            <div><strong>${primaryTask?.title || "Acompanhar atualizacao MB"}</strong><p>${primaryTask ? `${primaryTask.owner} · vence ${primaryTask.due}` : "Sem pendencias criticas neste momento."}</p></div>
          </div>
          <div class="metric-analysis"><strong>IA MB:</strong> ${data.insights?.[0] || "A qualidade da analise aumenta conforme os dados sao enviados e revisados."}</div>
        </article>
      </section>
      <section class="process-strip">
        ${processStatus(client, data).map(([title, status, detail, icon]) => `
          <article class="process-step">
            <div>${MBI.ui.icon(icon)}</div>
            <strong>${title}</strong>
            ${MBI.ui.pill(status)}
            <span>${detail}</span>
          </article>
        `).join("")}
      </section>
    `;
  }

  const intelligenceTabDefs = [
    ["overview", "Visão Geral", "layout-dashboard"],
    ["finance", "Financeiro", "line-chart"],
    ["analysis", "Análise", "radar"],
    ["history", "Histórico", "bar-chart-3"],
    ["scenarios", "Cenários", "sliders-horizontal"]
  ];

  function tabAllowed(client, tab) {
    if (tab === "overview") return true;
    if (client.planId === "cfo") return true;
    if (client.planId === "gestao") return ["finance", "analysis", "history"].includes(tab);
    return false;
  }

  function currentIntelligenceTab(client) {
    const selected = MBI.auth.currentSession()?.uiFilters?.intelligenceTab || "overview";
    return tabAllowed(client, selected) ? selected : "overview";
  }

  function intelligenceTabs(client, active) {
    return `
      <div class="intel-tabs">
        ${intelligenceTabDefs.map(([key, label, icon]) => {
          const allowed = tabAllowed(client, key);
          return `<button class="intel-tab ${active === key ? "is-active" : ""} ${allowed ? "" : "is-locked"}" type="button" ${allowed ? `data-action="set-intelligence-tab" data-tab="${key}"` : ""} title="${allowed ? label : "Disponível em plano superior"}">${MBI.ui.icon(allowed ? icon : "lock")}<span>${label}</span></button>`;
        }).join("")}
      </div>
    `;
  }

  function periodsAsc(client) {
    return MBI.services.finance.listPeriods(client.id).slice().sort((a, b) => String(a.competence).localeCompare(String(b.competence)));
  }

  function currentAndPrevious(client, data) {
    const rows = periodsAsc(client);
    const index = rows.findIndex((row) => row.competence === data.competence);
    const current = index >= 0 ? rows[index] : rows.at(-1);
    const previous = index > 0 ? rows[index - 1] : null;
    return { rows, current, previous };
  }

  function delta(current, previous, key) {
    const now = Number(current?.[key] ?? 0);
    const before = Number(previous?.[key] ?? 0);
    if (!before) return 0;
    return ((now - before) / Math.abs(before)) * 100;
  }

  function spark(rows, key) {
    return rows.slice(-7).map((row) => Number(row[key] || 0));
  }

  function kpiGrid(client, data) {
    const { rows, current, previous } = currentAndPrevious(client, data);
    return `
      <section class="grid grid-4 kpi-grid">
        ${MBI.ui.kpi("Faturamento", MBI.ui.money(data.revenue), data.competenceLabel, data.revenue ? "Receita atualizada para a competência selecionada." : "Aguardando base financeira da MB.", "blue", delta(current, previous, "revenue"), spark(rows, "revenue"))}
        ${MBI.ui.kpi("Resultado", data.result ? MBI.ui.money(data.result) : "Indisponível", `${data.margin || 0}% margem`, client.planId === "contabilidade" ? "Plano atual não libera lucro gerencial completo." : "Resultado calculado com dados disponíveis.", "teal", delta(current, previous, "result"), spark(rows, "result"))}
        ${MBI.ui.kpi("Impostos / DAS", MBI.ui.money(data.taxes), "Fiscal", "Acompanhamento fiscal da MB por competência.", "amber", delta(current, previous, "taxes"), spark(rows, "taxes"), true)}
        ${MBI.ui.kpi(client.planId === "cfo" ? "Score MB" : "Fôlego", client.planId === "cfo" ? `${data.score || 0}/100` : `${data.runway || 0} dias`, client.planId === "cfo" ? "Financeiro" : "Caixa", client.planId === "cfo" ? "Score financeiro liberado para leitura executiva." : "Fôlego visual disponível nos planos financeiros.", "brand", delta(current, previous, client.planId === "cfo" ? "score" : "cash"), spark(rows, client.planId === "cfo" ? "score" : "cash"))}
      </section>
    `;
  }

  function lockedUpgrade(title, plan, text) {
    return `
      <article class="panel locked-upgrade">
        <div>${MBI.ui.icon("lock")}</div>
        <h3>${title}</h3>
        <p>${text}</p>
        <span class="status-pill status-warning">Disponível no ${plan}</span>
      </article>
    `;
  }

  function documentDonut(client) {
    const docs = MBI.services.documents.listByClient(client.id);
    const fiscal = docs.filter((doc) => /fiscal|das/i.test(`${doc.category} ${doc.name}`)).length;
    const labor = docs.filter((doc) => /trabalh|folha|fgts|inss/i.test(`${doc.category} ${doc.name}`)).length;
    const finance = docs.filter((doc) => /financ|dre|caixa|relat/i.test(`${doc.category} ${doc.name}`)).length;
    const other = Math.max(docs.length - fiscal - labor - finance, 0);
    return MBI.ui.donut([
      { label: "Fiscal", value: fiscal || 1, text: `${fiscal} arquivo(s)`, color: "brand" },
      { label: "Trabalhista", value: labor || 1, text: `${labor} arquivo(s)`, color: "blue" },
      { label: "Financeiro", value: finance || 1, text: `${finance} arquivo(s)`, color: "teal" },
      { label: "Outros", value: other || 1, text: `${other} arquivo(s)`, color: "amber" }
    ], `${docs.length}`);
  }

  function expenseRanking(data) {
    const payroll = Number(data.payroll || 0);
    const taxes = Number(data.taxes || 0);
    const direct = Number(data.directCosts || 0);
    const total = Number(data.expenses || 0);
    const admin = Math.max(total - payroll - taxes - direct, 0);
    const items = [
      ["Folha", payroll, "teal"],
      ["Impostos", taxes, "blue"],
      ["CMV / Custos", direct, "amber"],
      ["Administrativas", admin, "brand"]
    ].filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
    if (!items.length) return `<div class="empty-lock">${MBI.ui.icon("bar-chart-big")}<h3>Sem despesas no período</h3><p>A MB ainda não detalhou a composição das despesas desta competência.</p></div>`;
    const base = total || items.reduce((sum, [, value]) => sum + value, 0) || 1;
    return MBI.ui.bars(items.map(([label, value, color]) => [label, Math.min((value / base) * 100, 100), `${MBI.ui.money(value)} · ${Math.round((value / base) * 100)}%`, color]));
  }

  function overviewTab(client, data) {
    const locked = client.planId === "contabilidade"
      ? `<section class="grid grid-3" style="margin-top:14px">${lockedUpgrade("DRE gerencial", "Gestao", "Visualize a cascata de resultado e entenda lucro, margem e custos.")}${lockedUpgrade("Score financeiro", "Gestao", "Libere o score com dimensões de liquidez, rentabilidade e eficiência.")}${lockedUpgrade("CFO consultivo", "CFO (em breve)", "Receba cenários, pareceres e recomendações executivas da MB.")}</section>`
      : client.planId === "gestao"
        ? `<section class="grid grid-2" style="margin-top:14px">${lockedUpgrade("Radar CFO", "CFO (em breve)", "Compare as seis dimensões do score com leitura executiva.")}${lockedUpgrade("Cenários consultivos", "CFO (em breve)", "Simule investimento, margem e caixa mínimo com parecer MB.")}</section>`
        : "";
    return `
      ${cockpit(client, data)}
      ${kpiGrid(client, data)}
      ${tabAllowed(client, "finance") && (data.months || []).length ? `
      <section class="panel chart" style="margin-top:14px"><div class="panel-header"><div><h3>Evolução: receita × despesas</h3><p>Como sua empresa vem se comportando mês a mês.</p></div><button class="btn btn-ghost btn-mini" type="button" data-action="set-intelligence-tab" data-tab="history">Ver histórico completo</button></div>${MBI.ui.lineChart(data.months)}<div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesas</span></div></section>` : ""}
      <section class="grid grid-2" style="margin-top:14px">
        <article class="panel"><div class="panel-header"><div><h3>Copiloto financeiro</h3><p>Prioridades, recomendacoes e proximos passos.</p></div>${MBI.ui.pill("Vivo")}</div><div class="priority-list">${copilotSignals(client, data).map(([priority, title, detail, origin]) => `<div class="priority-item"><span class="priority-dot ${priority === "Alta" ? "high" : priority === "Media" ? "medium" : ""}"></span><div><strong>${title}</strong><span>${detail}</span></div><small>${origin}</small></div>`).join("")}</div></article>
        <article class="panel"><div class="panel-header"><div><h3>Linha do tempo</h3><p>Ultimas movimentacoes do acompanhamento.</p></div></div>${liveFeed(client, data)}</article>
      </section>
      <section class="grid grid-2" style="margin-top:14px">
        <article class="panel"><div class="panel-header"><div><h3>Saúde documental</h3><p>Documentos publicados pela MB por categoria.</p></div></div>${documentDonut(client)}</article>
        <article class="panel"><div class="panel-header"><div><h3>IA MB</h3><p>Leitura principal da competência.</p></div></div><div class="insight-list">${(data.insights || []).map((text) => `<div class="insight-item"><strong>Observação</strong><span>${text}</span></div>`).join("")}</div></article>
      </section>
      ${locked}
    `;
  }

  function financeTab(client, data) {
    if (!tabAllowed(client, "finance")) return lockedUpgrade("Financeiro gerencial", "Gestao", "DRE, DFC e evolução financeira ficam disponíveis nos planos financeiros.");
    const dreActions = client.planId === "cfo"
      ? `<div class="report-actions"><button class="btn btn-ghost" type="button" data-action="print-report" data-report="dre">${MBI.ui.icon("printer")} Imprimir</button><button class="btn btn-soft" type="button" data-action="export-report" data-report="dre">${MBI.ui.icon("file-spreadsheet")} Excel</button></div>`
      : "";
    const cashActions = client.planId === "cfo"
      ? `<div class="report-actions"><button class="btn btn-ghost" type="button" data-action="print-report" data-report="cash">${MBI.ui.icon("printer")} Imprimir</button><button class="btn btn-soft" type="button" data-action="export-report" data-report="cash">${MBI.ui.icon("file-spreadsheet")} Excel</button></div>`
      : "";
    return `
      <section class="grid grid-2">
        <article class="panel">
          <div class="panel-header"><div><h3>DRE em cascata</h3><p>Como a receita se transforma em resultado.</p></div>${dreActions}</div>
          ${MBI.ui.waterfall(data.dre)}
          <details class="report-detail"><summary>Tabela completa da DRE</summary>${MBI.ui.dreTable(data.dre)}</details>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>DFC em cascata</h3><p>Saldo inicial, entradas, saídas e saldo final.</p></div>${cashActions}</div>
          ${MBI.ui.waterfall(data.cashBridge)}
          <details class="report-detail"><summary>Tabela completa do fluxo de caixa</summary>${cashBridge(data.cashBridge)}</details>
        </article>
      </section>
    `;
  }

  function analysisTab(client, data) {
    if (!tabAllowed(client, "analysis")) return lockedUpgrade("Análise financeira", "Gestao", "Score, composição de despesas e fôlego de caixa ficam disponíveis nos planos financeiros.");
    return `
      <section class="grid grid-3">
        <article class="panel"><div class="panel-header"><div><h3>MB Financial Score</h3><p>Leitura visual do risco financeiro.</p></div></div>${MBI.ui.scoreGauge(data.score, "MB Financial Score")}${MBI.ui.bars(scoreBars(data))}</article>
        <article class="panel"><div class="panel-header"><div><h3>Onde você mais gasta</h3><p>Maiores despesas do período, em ordem.</p></div></div>${expenseRanking(data)}<div class="metric-analysis" style="margin-top:14px"><strong>IA MB:</strong> ranking calculado sobre as despesas validadas pela MB nesta competência.</div></article>
        <article class="panel"><div class="panel-header"><div><h3>Fôlego de caixa</h3><p>Runway visual com zonas de risco.</p></div></div>${MBI.ui.runway(data.runway)}<div class="metric-analysis" style="margin-top:14px"><strong>MB:</strong> abaixo de 45 dias exige acompanhamento mais próximo.</div></article>
      </section>
      <section class="grid grid-2" style="margin-top:14px">
        <article class="panel"><div class="panel-header"><div><h3>Margem e meta MB</h3><p>Eficiência da operação.</p></div></div>${MBI.ui.bars([["Margem atual", Math.min(Math.max(data.margin || 0, 0) * 3, 100), `${data.margin || 0}%`, "teal"], ["Meta MB", Math.min(Math.max(data.marginTarget || 20, 0) * 3, 100), `${data.marginTarget || 20}%`, "blue"], ["Pressão de custo", percentOf(data.expenses || 0, data.revenue || 1), `${percentOf(data.expenses || 0, data.revenue || 1)}% da receita`, "amber"]])}</article>
        ${client.planId === "cfo" ? `<article class="panel"><div class="panel-header"><div><h3>Radar CFO</h3><p>Seis dimensões do score financeiro.</p></div></div>${MBI.ui.radar(data.scoreBreakdown)}</article>` : lockedUpgrade("Radar CFO", "CFO (em breve)", "O radar executivo mostra as dimensões de score com leitura consultiva.")}
      </section>
    `;
  }

  function historyTab(client, data) {
    if (!tabAllowed(client, "history")) return lockedUpgrade("Histórico financeiro", "Gestao", "Acompanhe evolução, comparativos e tendências por competência.");
    const periods = MBI.services.finance.listPeriods(client.id);
    return `
      <section class="grid grid-2">
        <article class="panel chart"><div class="panel-header"><div><h3>Evolução receita x despesas</h3><p>Gráfico de área com tooltip e eixo de valores.</p></div></div>${MBI.ui.lineChart(data.months)}<div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesas</span></div></article>
        <article class="panel chart"><div class="panel-header"><div><h3>Comparativo multi-período</h3><p>Receita, despesas e resultado por mês.</p></div></div>${MBI.ui.groupedBars(data.months)}<div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesas</span><span><i class="legend-dot teal"></i> Resultado</span></div></article>
      </section>
      <section class="panel" style="margin-top:14px"><div class="panel-header"><div><h3>Snapshots históricos</h3><p>Competências registradas pela MB.</p></div></div>${MBI.ui.table(["Competência", "Receita", "Despesas", "Resultado", "Caixa", "Margem"], periods.map((row) => [row.label, MBI.ui.money(row.revenue), MBI.ui.money(row.expenses), MBI.ui.money(row.result), MBI.ui.money(row.cash), `${row.margin}%`]))}</section>
    `;
  }

  function scenariosTab(client, data) {
    if (!tabAllowed(client, "scenarios")) return lockedUpgrade("Cenários executivos", "CFO (em breve)", "Simulações de margem, investimento, caixa mínimo e parecer MB ficam no plano CFO.");
    const safeInvestment = Number(data.investmentCapacity || 0);
    const marginGap = Math.max(Number(data.marginTarget || 20) - Number(data.margin || 0), 0);
    return `
      <section class="grid grid-3">
        <article class="panel"><div class="panel-header"><div><h3>Capacidade de investimento</h3><p>Limite prudencial estimado.</p></div></div><div class="score-radar"><div><strong>${MBI.ui.money(safeInvestment)}</strong><span>Investimento seguro</span></div><div><strong>${data.runway || 0} dias</strong><span>Fôlego atual</span></div></div><div class="metric-analysis"><strong>MB CFO:</strong> preservar reserva mínima antes de novas decisões.</div></article>
        <article class="panel"><div class="panel-header"><div><h3>Meta de margem</h3><p>Distância até a meta MB.</p></div></div>${MBI.ui.bars([["Margem atual", Math.min((data.margin || 0) * 3, 100), `${data.margin || 0}%`, "teal"], ["Meta", Math.min((data.marginTarget || 20) * 3, 100), `${data.marginTarget || 20}%`, "blue"], ["Gap", Math.min(marginGap * 5, 100), `${marginGap.toFixed(1).replace(".", ",")} p.p.`, "amber"]])}</article>
        <article class="panel"><div class="panel-header"><div><h3>Parecer consultivo</h3><p>Próxima decisão recomendada.</p></div></div><div class="insight-item"><strong>Recomendação MB</strong><span>${data.insights?.[1] || "Aguardar validação consultiva da MB para decisão executiva."}</span></div><button class="btn btn-primary" style="margin-top:14px" type="button" data-action="print-report" data-report="dre">${MBI.ui.icon("file-text")} Exportar parecer</button></article>
      </section>
      <form class="panel scenario-simulator" style="margin-top:14px" data-revenue="${data.revenue || 0}" data-expenses="${data.expenses || 0}" data-cash="${data.cash || 0}">
        <div class="panel-header"><div><h3>Simulador CFO</h3><p>Teste crescimento de receita, redução de despesas e investimento desejado.</p></div><button class="btn btn-primary" type="button" data-action="simulate-cfo-scenario">${MBI.ui.icon("calculator")} Simular cenário</button></div>
        <div class="form-section">
          <label><span>Crescimento de receita (%)</span><input type="number" name="revenueGrowth" value="8"></label>
          <label><span>Redução de despesas (%)</span><input type="number" name="expenseReduction" value="5"></label>
          <label><span>Investimento desejado</span><input type="number" name="investment" value="${Math.round(safeInvestment * .7)}"></label>
        </div>
        <div class="scenario-output" data-scenario-output><strong>Cenário base</strong><span>Simule para estimar resultado projetado e caixa após investimento.</span></div>
      </form>
    `;
  }

  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  }

  function isGuia(doc) {
    return /fiscal|das|guia|imposto|inss|fgts|darf|tribut|dae|gps/i.test(`${doc.category || ""} ${doc.name || ""} ${doc.type || ""}`);
  }

  function dueLabel(value) {
    const iso = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    return String(value || "") || "Sem prazo";
  }

  function guiasToPay(client) {
    return MBI.services.documents.listByClient(client.id)
      .filter((doc) => isGuia(doc) && (doc.dueDate || /\d{2}/.test(String(doc.due || ""))))
      .sort((a, b) => String(a.dueDate || a.due).localeCompare(String(b.dueDate || b.due)));
  }

  function recentDocs(client) {
    return MBI.services.documents.listByClient(client.id).slice().reverse().slice(0, 4);
  }

  function openTasks(client) {
    return MBI.storage.getDatabase().tasks.filter((task) => task.clientId === client.id && !/conclu|feito|encerr|finaliz/i.test(task.status || ""));
  }

  // Tela inicial orientada as tarefas reais do mes: guias a pagar, documentos,
  // status "tudo em dia?" e acoes rapidas. Para Gestao/CFO inclui leitura financeira;
  // para Contabilidade, um convite (e nao um muro de cadeados).
  function home(client) {
    const data = MBI.services.finance.get(client.id);
    const guias = guiasToPay(client);
    const recents = recentDocs(client);
    const tasks = openTasks(client);
    const statusTone = tasks.length ? "is-warn" : "is-good";
    const statusText = tasks.length
      ? `${tasks.length} pendência(s) aguardando você ou a MB`
      : guias.length ? "Suas guias do mês estão disponíveis para pagamento" : "Tudo em dia este mês";

    const guiasPanel = `
      <article class="panel home-panel">
        <div class="panel-header"><div><h3>Guias e impostos a pagar</h3><p>Publicados pela MB para você pagar no prazo.</p></div>${MBI.ui.pill(String(guias.length))}</div>
        ${guias.length ? `<div class="home-list">${guias.map((doc) => `
          <div class="home-row">
            <div class="home-row-main"><strong>${MBI.ui.escape(doc.name || doc.fileName)}</strong><span>Vence ${MBI.ui.escape(dueLabel(doc.dueDate || doc.due))}</span></div>
            <button class="btn btn-soft btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("download")} Baixar</button>
          </div>`).join("")}</div>`
          : `<div class="home-empty">${MBI.ui.icon("check-circle")}<p>Nenhuma guia em aberto. Assim que a MB publicar suas guias do mês, elas aparecem aqui.</p></div>`}
      </article>`;

    const docsPanel = `
      <article class="panel home-panel">
        <div class="panel-header"><div><h3>Documentos recentes</h3><p>Últimos arquivos liberados pela MB.</p></div><button class="btn btn-ghost btn-mini" type="button" data-route="#/cliente/documentos">Ver todos</button></div>
        ${recents.length ? `<div class="home-list">${recents.map((doc) => `
          <div class="home-row">
            <div class="home-row-main"><strong>${MBI.ui.escape(doc.name || doc.fileName)}</strong><span>${MBI.ui.escape(doc.category || "Documento")}${doc.competence ? ` · ${MBI.ui.escape(doc.competence)}` : ""}</span></div>
            <button class="btn btn-soft btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("download")} Baixar</button>
          </div>`).join("")}</div>`
          : `<div class="home-empty">${MBI.ui.icon("folder-open")}<p>Nenhum documento publicado ainda. A MB disponibiliza seus documentos aqui.</p></div>`}
      </article>`;

    const quickActions = `
      <section class="home-actions">
        <button class="btn btn-primary" type="button" data-route="#/cliente/documentos">${MBI.ui.icon("folder-open")} Meus documentos</button>
        <button class="btn btn-soft" type="button" data-route="#/cliente/comunicacao">${MBI.ui.icon("messages-square")} Falar com a MB</button>
        ${tabAllowed(client, "finance") ? `<button class="btn btn-soft" type="button" data-route="#/cliente/inteligencia">${MBI.ui.icon("layout-dashboard")} Ver dashboard</button>` : ""}
      </section>`;

    const financeBlock = tabAllowed(client, "finance")
      ? `<article class="panel"><div class="panel-header"><div><h3>Resumo financeiro · ${MBI.ui.escape(data.competenceLabel || "competência atual")}</h3><p>Leitura rápida. Detalhes completos em Financeiro.</p></div></div>${executiveBrief(client, data)}</article>`
      : `<article class="panel home-invite"><div class="home-invite-icon">${MBI.ui.icon("trending-up")}</div><div class="home-invite-text"><h3>Quer enxergar o financeiro da sua empresa?</h3><p>O Plano Gestão libera faturamento, lucro, margem, indicadores e alertas automáticos — além de tudo que você já tem no Contabilidade.</p></div><a class="btn btn-primary" href="https://wa.me/5500000000000?text=Quero%20conhecer%20o%20Plano%20Gest%C3%A3o%20da%20MB" target="_blank" rel="noopener">${MBI.ui.icon("message-circle")} Conhecer o Plano Gestão</a></article>`;

    return `
      <section class="home-hero ${statusTone}">
        <div class="home-hero-text"><span>${greeting()}, ${MBI.ui.escape(client.owner || client.name)}.</span><strong>${MBI.ui.escape(client.name)} · ${MBI.ui.escape(data.competenceLabel || "")}</strong></div>
        <div class="home-status ${statusTone}">${MBI.ui.icon(tasks.length ? "alert-triangle" : "check-circle")}<span>${statusText}</span></div>
      </section>
      <section class="grid grid-2" style="margin-top:14px">${guiasPanel}${docsPanel}</section>
      ${quickActions}
      <section style="margin-top:14px">${financeBlock}</section>
    `;
  }

  // Dashboard executivo em UMA tela (sem abas): KPIs, evolucao, onde gasta,
  // leitura MB e score. DRE/fluxo ficam recolhidos. Menos e mais.
  function intelligence(client) {
    const data = MBI.services.finance.get(client.id);
    if (!tabAllowed(client, "finance")) {
      return lockedUpgrade("Dashboard financeiro", "Gestao", "Faturamento, lucro, margem, evolução e indicadores ficam disponíveis no Plano Gestão.");
    }
    const scorePanel = client.planId === "cfo"
      ? `<article class="panel"><div class="panel-header"><div><h3>Radar do score</h3><p>Seis dimensões financeiras.</p></div></div>${MBI.ui.radar(data.scoreBreakdown)}</article>`
      : `<article class="panel"><div class="panel-header"><div><h3>MB Financial Score</h3><p>Leitura de risco financeiro.</p></div></div>${MBI.ui.scoreGauge(data.score, "MB Financial Score")}</article>`;
    return `
      <div class="exec-dash">
      ${competenceSelector(client, data)}
      ${kpiGrid(client, data)}
      <section class="grid dash-trio" style="margin-top:12px">
        <article class="panel chart">
          <div class="panel-header"><div><h3>Receita ao longo do tempo</h3><p>Evolução de faturamento.</p></div></div>
          ${MBI.ui.execLineChart(data.months)}
          <div class="chart-legend"><span><i class="legend-dot brand"></i> Receita</span><span><i class="legend-dot dashed"></i> Tendência</span></div>
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Onde você mais gasta</h3><p>Maiores despesas.</p></div></div>
          ${expenseRanking(data)}
        </article>
        ${scorePanel}
      </section>
      <section style="margin-top:12px">
        <article class="panel">
          <div class="panel-header"><div><h3>Inteligência MB</h3><p>Leitura executiva da competência.</p></div></div>
          ${executiveBrief(client, data)}
        </article>
      </section>
      <details class="report-detail" style="margin-top:14px">
        <summary>Ver relatórios completos — DRE e fluxo de caixa</summary>
        <section class="grid grid-2" style="margin-top:14px">
          <article class="panel"><div class="panel-header"><div><h3>DRE em cascata</h3><p>Como a receita vira resultado.</p></div></div>${MBI.ui.waterfall(data.dre)}</article>
          <article class="panel"><div class="panel-header"><div><h3>Fluxo de caixa</h3><p>Entradas, saídas e saldo.</p></div></div>${MBI.ui.waterfall(data.cashBridge)}</article>
        </section>
      </details>
      </div>
    `;
  }

  function cashBridge(rows) {
    if (!rows.length) return `<div class="empty-lock">${MBI.ui.icon("lock")}<h3>Caixa não validado</h3><p>A MB precisa carregar OFX ou planilha para liberar a DFC gerencial.</p></div>`;
    const normalized = rows.map((row) => Array.isArray(row)
      ? { label: row[0], amount: row[1], type: row[2], reference: row[2] }
      : row);
    return `
      <div class="cashflow-table">
        <div class="cashflow-row is-head"><span>Descrição</span><span>Valor</span><span>Referência</span></div>
        ${normalized.map((row) => `
          <div class="cashflow-row ${row.type === "section" ? "is-section" : ""} ${row.type === "subtotal" ? "is-subtotal" : ""} ${row.type === "total" ? "is-total" : ""}">
            <span>${MBI.ui.escape(row.label)}</span>
            <strong>${row.type === "section" ? "" : row.type === "indicator" ? `${Math.round(row.amount || 0)} dias` : MBI.ui.money(row.amount || 0)}</strong>
            <span>${MBI.ui.escape(row.reference || "")}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function onboarding(client) {
    const data = MBI.services.finance.get(client.id);
    const nextReview = client.nextReview
      ? new Date(`${client.nextReview}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      : "Aguardando agendamento MB";
    const steps = [
      ["Cadastro aprovado", "Concluído", "Dados cadastrais validados pela MB."],
      ["Documentos base", MBI.services.documents.listByClient(client.id).length ? "Concluído" : "Pendente", "Contrato social, guias e documentos fiscais."],
      ["Dados financeiros", data.revenue ? "Em andamento" : "Pendente", "Planilhas, OFX, XML ou integrações."],
      ["Validação MB", client.confidence === "Alta" ? "Concluído" : "Em revisão", "Equipe MB revisa antes de publicar."],
      ["Cockpit liberado", client.planId === "cfo" ? "Completo" : "Parcial", "Módulos liberados conforme plano."]
    ];
    const done = steps.filter((step) => ["Concluído", "Completo"].includes(step[1])).length;
    const progress = Math.round((done / steps.length) * 100);
    return `
      <section class="grid grid-2">
        <article class="panel"><div class="panel-header"><div><h3>Ativação da plataforma</h3><p>Checklist guiado do cliente.</p></div>${MBI.ui.pill(`${progress}% ativo`, progress >= 80 ? "status-ok" : "status-warning")}</div><div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="--progress:${progress}%"></div></div><span>${done} de ${steps.length} etapas concluídas</span></div><div class="step-list">${steps.map(([title, status, detail]) => `<div class="step-card"><div class="step-icon">${MBI.ui.icon("check-circle")}</div><div><strong>${title}</strong><span>${detail}</span></div>${MBI.ui.pill(status)}</div>`).join("")}</div></article>
        <article class="panel"><div class="panel-header"><div><h3>Seu consultor MB</h3><p>Acompanhamento humano do onboarding.</p></div></div><div class="consultant-card"><div><strong>${MBI.ui.escape(client.consultant)}</strong><span>Responsável principal</span></div><span class="chip is-on">Próxima revisão: ${MBI.ui.escape(nextReview)}</span></div><div class="insight-list" style="margin-top:14px"><div class="insight-item"><strong>IA MB</strong><span>Quanto melhor a qualidade dos dados, maior a profundidade da análise.</span></div></div></article>
      </section>
    `;
  }

  function documents(client) {
    const filters = sessionFilters("clientDocuments");
    const docs = MBI.services.documents.listByClient(client.id)
      .filter((doc) => !filters.category || filters.category === "Todas" || doc.category === filters.category)
      .filter((doc) => !filters.competence || String(doc.competence || doc.due || "").startsWith(filters.competence))
      .sort((a, b) => String(b.competence || b.due || "").localeCompare(String(a.competence || a.due || "")));
    return `
      <section class="grid grid-2">
        <article class="panel"><div class="panel-header"><div><h3>Documentos liberados</h3><p>Arquivos publicados pela equipe MB para consulta e download.</p></div></div><form class="filter-row" data-form="document-filters"><input type="hidden" name="scope" value="client"><select name="category"><option>Todas</option>${["Fiscal", "Trabalhista", "Contábil", "Financeiro", "Societário", "Contratos", "Certidões"].map((item) => `<option ${filters.category === item ? "selected" : ""}>${item}</option>`).join("")}</select><input type="month" name="competence" value="${filters.competence || ""}"><button class="btn btn-primary" type="submit">${MBI.ui.icon("filter")} Filtrar</button></form>${MBI.ui.table(["Descricao", "Arquivo original", "Categoria", "Status", "Competencia", "Vencimento", "Arquivo"], docs.map((doc) => [MBI.ui.escape(doc.description || doc.name || "-"), MBI.ui.escape(doc.fileName || doc.originalFileName || doc.name || "-"), MBI.ui.escape(doc.category), MBI.ui.pill(doc.status), MBI.ui.escape(doc.competence || "-"), MBI.ui.escape(doc.dueDate || doc.due || "-"), `<button class="btn btn-soft btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("download")} Baixar</button>`]))}</article>
        <article class="panel"><div class="panel-header"><div><h3>Como a MB envia documentos</h3><p>O envio oficial acontece do escritorio para o cliente.</p></div>${MBI.ui.pill("Somente visualizacao")}</div><div class="flow-map"><div><strong>1. MB publica</strong><span>DAS, guias, folha, relatorios e documentos ficam disponiveis nesta tela.</span></div><div><strong>2. Cliente visualiza</strong><span>O empresario baixa arquivos, acompanha vencimentos e consulta o historico.</span></div><div><strong>3. Solicitacoes</strong><span>Se a MB precisar de algum arquivo, a solicitacao aparece como pendencia ou mensagem.</span></div></div><button class="btn btn-primary" type="button" data-route="#/cliente/comunicacao">${MBI.ui.icon("messages-square")} Falar com a MB</button></article>
      </section>
    `;
  }

  function imports(client) {
    const rows = MBI.services.imports.list(client.id);
    return `<section class="panel"><div class="panel-header"><div><h3>Histórico de importações</h3><p>Arquivos recebidos e status de validação.</p></div></div>${MBI.ui.table(["Arquivo", "Tipo", "Status", "Responsável", "Resultado"], rows.map((row) => [MBI.ui.escape(row.fileName), MBI.ui.escape(row.type), MBI.ui.pill(row.status), MBI.ui.escape(row.owner), MBI.ui.escape(row.result)]))}</section>`;
  }

  function communication(client) {
    const messages = MBI.storage.getDatabase().messages.filter((message) => message.clientId === client.id);
    return `
      <section class="grid grid-2">
        <article class="panel"><div class="panel-header"><div><h3>Seu consultor MB</h3><p>Canal operacional centralizado.</p></div></div><div class="notification-item"><strong>${MBI.ui.escape(client.consultant)}</strong><span>Responsável principal</span></div><div class="notification-item"><strong>${MBI.ui.escape(client.analyst)}</strong><span>Responsável financeiro</span></div></article>
        <article class="panel"><div class="panel-header"><div><h3>Mensagens</h3><p>Histórico cliente x MB.</p></div></div><div class="insight-list">${messages.map((msg) => `<div class="insight-item"><strong>${MBI.ui.escape(msg.from)}</strong><span>${MBI.ui.escape(msg.text)}</span><em>${MBI.ui.escape(msg.at)}</em></div>`).join("")}</div><form class="button-row" style="margin-top:14px" data-form="message"><input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}"><input name="text" placeholder="Escrever mensagem para a MB"><button class="btn btn-primary" type="submit">${MBI.ui.icon("send")} Enviar</button></form></article>
      </section>
    `;
  }

  function profile(client) {
    const plan = MBI.services.plans.get(client.planId);
    return `
      <section class="grid grid-2">
        <article class="panel"><div class="panel-header"><div><h3>Empresa</h3><p>Dados cadastrais principais.</p></div></div>${MBI.ui.table(["Campo", "Informação", ""], [["Razão social", client.name, ""], ["CNPJ", client.cnpj, ""], ["Cidade/UF", client.city, ""], ["Segmento", client.segment, ""], ["Plano", plan.name, ""]])}</article>
        <article class="panel"><div class="panel-header"><div><h3>Módulos liberados</h3><p>Permissões calculadas pelo plano contratado.</p></div></div><div class="module-chips">${plan.modules.map((module) => `<span class="chip is-on">${module}</span>`).join("")}</div><div class="metric-analysis" style="margin-top:14px"><strong>MB:</strong> módulos adicionais dependem do plano e da qualidade dos dados enviados.</div></article>
        <form class="panel" data-form="change-password"><div class="panel-header"><div><h3>Alterar senha</h3><p>Atualize seu acesso sem acionar a equipe MB.</p></div><button class="btn btn-primary" type="submit">${MBI.ui.icon("key-round")} Salvar senha</button></div><div class="form-section two"><label><span>Senha atual</span><input type="password" name="currentPassword" required></label><label><span>Nova senha</span><input type="password" name="newPassword" required minlength="6"></label><label><span>Confirmar nova senha</span><input type="password" name="confirmPassword" required minlength="6"></label></div></form>
      </section>
    `;
  }

  MBI.pages.client = { render };
})();
