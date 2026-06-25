(function () {
  window.MBI = window.MBI || {};
  MBI.pages = MBI.pages || {};

  const routeTitles = {
    "#/cliente/inicio": "Início",
    "#/cliente/inteligencia": "Dashboard",
    "#/cliente/onboarding": "Onboarding",
    "#/cliente/documentos": "Documentos e guias",
    "#/cliente/integracoes": "Integrações e lançamentos",
    "#/cliente/comunicacao": "Comunicação MB",
    "#/cliente/perfil": "Perfil e acessos"
  };

  function menu(active, client) {
    const items = [["#/cliente/inicio", "home", "Início"]];
    if (client) items.push(["#/cliente/inteligencia", "layout-dashboard", "Dashboard"]);
    items.push(
      ["#/cliente/documentos", "folder-open", "Documentos"],
      ["#/cliente/integracoes", "plug", "Integrações"],
      ["#/cliente/comunicacao", "messages-square", "Comunicação"],
      ["#/cliente/perfil", "user-round", "Perfil"]
    );
    return MBI.ui.nav(items, active);
  }

  function sessionFilters(key) {
    return MBI.auth.currentSession()?.uiFilters?.[key] || {};
  }

  // Seletor de competencia no topo (ao lado de notificacao/ajuda), estilo escuro da topbar.
  function competenceTopbar(client, data) {
    const options = data.competences?.length ? data.competences : MBI.services.finance.listCompetences(client.id);
    if (!options.length) return "";
    return `
      <form class="topbar-client" data-form="select-competence">
        <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
        <span class="topbar-client-tag">${MBI.ui.icon("calendar-days")} Competência</span>
        <select name="competence" aria-label="Competência" onchange="this.form.requestSubmit()">${options.map((item) => `<option value="${MBI.ui.escape(item.value)}" ${item.value === data.competence ? "selected" : ""}>${MBI.ui.escape(item.label)}</option>`).join("")}</select>
        <button class="competence-filter-go" type="submit" aria-label="Aplicar competência">Ver</button>
      </form>
    `;
  }

  function shell(route, content) {
    const client = MBI.services.clients.current();
    let topbarExtra = "";
    if (route === "#/cliente/inteligencia" || route === "#/cliente/integracoes") {
      topbarExtra = competenceTopbar(client, MBI.services.finance.get(client.id));
    }
    return MBI.ui.shell({
      title: routeTitles[route] || "Portal do Cliente",
      subtitle: `${MBI.ui.escape(client.name)} · Confiança ${MBI.ui.escape(client.confidence)}`,
      menu: menu(route, client),
      content,
      sessionLabel: "Cliente",
      sessionName: client.owner,
      topbarExtra
    });
  }

  function render(route) {
    const client = MBI.services.clients.current();
    if (route === "#/cliente/inicio") return shell(route, home(client));
    if (route === "#/cliente/onboarding") return shell(route, onboarding(client));
    if (route === "#/cliente/documentos") return shell(route, documents(client));
    if (route === "#/cliente/integracoes") return shell(route, clientIntegrations(client));
    if (route === "#/cliente/importacoes") return shell("#/cliente/documentos", documents(client));
    if (route === "#/cliente/comunicacao") return shell(route, communication(client));
    if (route === "#/cliente/perfil") return shell(route, profile(client));
    if (route === "#/cliente/inteligencia") return shell(route, intelligence(client));
    return shell("#/cliente/inicio", home(client));
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

  function tabAllowed() {
    // Plano unico: todo cliente tem acesso completo (dashboard, financeiro, etc.).
    return true;
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
        ${MBI.ui.kpi("Faturamento", MBI.ui.money(data.revenue), data.competenceLabel, data.revenue ? "Receita atualizada para a competência selecionada." : "Aguardando base financeira da MB.", "blue", delta(current, previous, "revenue"), spark(rows, "revenue"), false, "banknote")}
        ${MBI.ui.kpi("Resultado", data.result ? MBI.ui.money(data.result) : "Indisponível", `${data.margin || 0}% margem`, "Resultado calculado com os dados validados pela MB.", "teal", delta(current, previous, "result"), spark(rows, "result"), false, "trending-up")}
        ${MBI.ui.kpi("Impostos / DAS", MBI.ui.money(data.taxes), "Fiscal", "Acompanhamento fiscal da MB por competência.", "amber", delta(current, previous, "taxes"), spark(rows, "taxes"), true, "receipt")}
        ${MBI.ui.kpi("Score MB", `${data.score || 0}/100`, "Financeiro", "Score financeiro calculado pela MB.", "brand", delta(current, previous, "score"), spark(rows, "score"), false, "shield")}
      </section>
    `;
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
    const allDocs = MBI.services.documents.listByClient(client.id);
    const latest = recentDocs(client)[0] || null;
    const tasks = openTasks(client);
    const statusTone = tasks.length ? "is-warn" : "is-good";
    const statusText = tasks.length
      ? `${tasks.length} pendência(s) aguardando você ou a MB`
      : guias.length ? "Suas guias do mês estão disponíveis para pagamento" : "Tudo em dia este mês";

    // Um unico painel de documentos: o mais recente em destaque + "Ver todos".
    // Se o ultimo arquivo for uma guia com vencimento, o selo "vence dd/mm"
    // preserva o lembrete de pagamento sem repetir o documento em outro painel.
    const latestDue = latest && isGuia(latest) && (latest.dueDate || /\d{2}/.test(String(latest.due || "")))
      ? dueLabel(latest.dueDate || latest.due)
      : "";
    const docsPanel = `
      <article class="panel home-panel">
        <div class="panel-header"><div><h3>Documento mais recente</h3><p>Último arquivo liberado pela MB para você.</p></div>${allDocs.length > 1 ? `<button class="btn btn-ghost btn-mini" type="button" data-route="#/cliente/documentos">Ver todos (${allDocs.length})</button>` : ""}</div>
        ${latest ? `<div class="home-list">
          <div class="home-row">
            <div class="home-row-main"><strong>${MBI.ui.escape(latest.name || latest.fileName)}</strong><span>${MBI.ui.escape(latest.category || "Documento")}${latest.competence ? ` · ${MBI.ui.escape(latest.competence)}` : ""}${latestDue ? ` · <b class="home-due">vence ${MBI.ui.escape(latestDue)}</b>` : ""}</span></div>
            <button class="btn btn-primary btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(latest.id)}">${MBI.ui.icon("download")} Baixar</button>
          </div></div>`
          : `<div class="home-empty">${MBI.ui.icon("folder-open")}<p>Nenhum documento publicado ainda. A MB disponibiliza seus documentos aqui.</p></div>`}
      </article>`;

    const quickActions = `
      <section class="home-actions">
        <button class="btn btn-primary" type="button" data-route="#/cliente/documentos">${MBI.ui.icon("folder-open")} Meus documentos</button>
        <button class="btn btn-soft" type="button" data-route="#/cliente/comunicacao">${MBI.ui.icon("messages-square")} Falar com a MB</button>
        <button class="btn btn-soft" type="button" data-route="#/cliente/inteligencia">${MBI.ui.icon("layout-dashboard")} Ver dashboard</button>
      </section>`;

    const financeBlock = `<article class="panel"><div class="panel-header"><div><h3>Resumo financeiro · ${MBI.ui.escape(data.competenceLabel || "competência atual")}</h3><p>Leitura rápida. Detalhes completos em Financeiro.</p></div></div>${executiveBrief(client, data)}</article>`;

    return `
      <section class="home-hero ${statusTone}">
        <div class="home-hero-text"><span>${greeting()}, ${MBI.ui.escape(client.owner || client.name)}.</span><strong>${MBI.ui.escape(client.name)} · ${MBI.ui.escape(data.competenceLabel || "")}</strong></div>
        <div class="home-status ${statusTone}">${MBI.ui.icon(tasks.length ? "alert-triangle" : "check-circle")}<span>${statusText}</span></div>
      </section>
      <section style="margin-top:14px">${docsPanel}</section>
      ${quickActions}
      <section style="margin-top:14px">${financeBlock}</section>
    `;
  }

  // Dashboard executivo em UMA tela (sem abas): KPIs, evolucao, onde gasta,
  // leitura MB e score. DRE/fluxo ficam recolhidos. Menos e mais.
  function intelligence(client) {
    const data = MBI.services.finance.get(client.id);
    const scoreWord = (s) => (s >= 80 ? "Excelente" : s >= 65 ? "Bom" : s >= 50 ? "Regular" : "Atenção");
    const scorePanel = `<article class="panel score-panel"><div class="panel-header"><div><h3>Saúde financeira</h3><p>Score consolidado MB · ${(data.scoreBreakdown || []).length} dimensões</p></div></div>${MBI.ui.scoreGauge(data.score, `${scoreWord(Number(data.score || 0))} · meta 80`)}${MBI.ui.scoreBars(data.scoreBreakdown)}</article>`;
    const [alertTone, alertTxt] = executiveAlert(data);
    return `
      <div class="exec-dash">
      ${kpiGrid(client, data)}
      <section class="exec-action exec-action--inline" style="margin-top:10px">
        <div class="exec-alert ${alertTone}">${MBI.ui.icon(alertTone === "is-good" ? "check-circle" : "alert-triangle")}<span><strong>Inteligência MB · ${alertTone === "is-good" ? "Situação" : "Atenção"}:</strong> ${alertTxt}</span></div>
        <button class="btn btn-primary btn-mini" type="button" data-route="#/cliente/comunicacao">${MBI.ui.icon("messages-square")} Falar com a MB</button>
      </section>
      <section class="grid dash-split" style="margin-top:10px">
        <article class="panel chart">
          <div class="panel-header"><div><h3>Receita, Despesa e Resultado</h3><p>Linha temporal — passe o mouse ou clique numa competência.</p></div></div>
          ${MBI.ui.execTimeChart(data.months)}
          <div class="chart-legend"><span><i class="legend-dot blue"></i> Receita</span><span><i class="legend-dot amber"></i> Despesa</span><span><i class="legend-dot teal"></i> Resultado</span></div>
        </article>
        ${scorePanel}
      </section>
      <details class="report-detail" style="margin-top:10px">
        <summary>Ver relatórios completos — fluxo de caixa, onde você gasta e DRE/DFC</summary>
        <section class="grid dash-split" style="margin-top:14px">
          <article class="panel chart">
            <div class="panel-header"><div><h3>Fluxo de caixa</h3><p>Entradas e saídas por competência.</p></div></div>
            ${MBI.ui.cashFlowChart(data.cashMonths)}
            <div class="chart-legend"><span><i class="legend-dot teal"></i> Entradas</span><span><i class="legend-dot amber"></i> Saídas</span></div>
          </article>
          <article class="panel">
            <div class="panel-header"><div><h3>Onde você mais gasta</h3><p>Maiores despesas.</p></div></div>
            ${expenseRanking(data)}
          </article>
        </section>
        <section class="grid grid-2" style="margin-top:14px">
          <article class="panel"><div class="panel-header"><div><h3>DRE em cascata</h3><p>Como a receita vira resultado.</p></div></div>${MBI.ui.waterfall(data.dre)}</article>
          <article class="panel"><div class="panel-header"><div><h3>Fluxo de caixa detalhado</h3><p>Entradas, saídas e saldo.</p></div></div>${MBI.ui.waterfall(data.cashBridge)}</article>
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
      ["Cockpit liberado", "Completo", "Todos os módulos disponíveis."]
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
      <section class="panel">
        <div class="panel-header"><div><h3>Seus documentos</h3><p>Arquivos publicados pela equipe MB para consulta e download.</p></div>${MBI.ui.pill(`${docs.length} arquivo(s)`)}</div>
        <form class="filter-row" data-form="document-filters" style="margin-bottom:14px"><input type="hidden" name="scope" value="client"><select name="category"><option>Todas</option>${["Fiscal", "Trabalhista", "Contábil", "Financeiro", "Societário", "Contratos", "Certidões"].map((item) => `<option ${filters.category === item ? "selected" : ""}>${item}</option>`).join("")}</select><input type="month" name="competence" value="${filters.competence || ""}"><button class="btn btn-primary" type="submit">${MBI.ui.icon("filter")} Filtrar</button></form>
        ${MBI.ui.docList(docs, (doc) => `<button class="btn btn-primary btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("download")} Baixar</button>`)}
      </section>
      <p class="doc-hint">${MBI.ui.icon("shield-check")} O envio é feito pela MB e os arquivos ficam disponíveis aqui. Precisa de algo? <button class="btn-link" type="button" data-route="#/cliente/comunicacao">Fale com a MB</button>.</p>
    `;
  }

  function imports(client) {
    const rows = MBI.services.imports.list(client.id);
    return `<section class="panel"><div class="panel-header"><div><h3>Histórico de importações</h3><p>Arquivos recebidos e status de validação.</p></div></div>${MBI.ui.table(["Arquivo", "Tipo", "Status", "Responsável", "Resultado"], rows.map((row) => [MBI.ui.escape(row.fileName), MBI.ui.escape(row.type), MBI.ui.pill(row.status), MBI.ui.escape(row.owner), MBI.ui.escape(row.result)]))}</section>`;
  }

  // Pessoa de contato so aparece quando ha um nome real (nao "A definir"/vazio),
  // para nao parecer dado ficticio.
  function namedContact(name, role) {
    const value = String(name || "").trim();
    if (!value || /a definir/i.test(value)) return "";
    return `<div class="notification-item"><strong>${MBI.ui.escape(value)}</strong><span>${MBI.ui.escape(role)}</span></div>`;
  }

  function communication(client) {
    const notices = MBI.storage.getDatabase().messages
      .filter((message) => message.clientId === client.id)
      .slice()
      .reverse();
    const waText = `Olá, MB! Sou ${client.owner || client.name} (${client.name}) e preciso de ajuda.`;
    const contacts = `${namedContact(client.consultant, "Consultor responsável")}${namedContact(client.analyst, "Responsável financeiro")}`;
    return `
      <section class="grid dash-split">
        <article class="panel comm-channel">
          <div class="panel-header"><div><h3>Fale com a MB</h3><p>Atendimento direto pelo WhatsApp — é o nosso canal oficial.</p></div></div>
          <a class="btn btn-whatsapp comm-wa" href="${MBI.ui.whatsappUrl(waText)}" target="_blank" rel="noopener">${MBI.ui.icon("message-circle")} Conversar no WhatsApp</a>
          ${contacts ? `<div class="comm-contacts">${contacts}</div>` : `<p class="comm-hint">${MBI.ui.icon("info")} Sua equipe de atendimento aparece aqui assim que for definida pela MB.</p>`}
        </article>
        <article class="panel">
          <div class="panel-header"><div><h3>Avisos da MB</h3><p>Comunicados e mensagens registrados no portal.</p></div>${MBI.ui.pill(String(notices.length))}</div>
          ${notices.length
            ? `<div class="insight-list">${notices.map((msg) => `<div class="insight-item"><strong>${MBI.ui.escape(msg.from)}</strong><span>${MBI.ui.escape(msg.text)}</span><em>${MBI.ui.escape(MBI.ui.dateTime(msg.at))}</em></div>`).join("")}</div>`
            : `<div class="home-empty">${MBI.ui.icon("bell")}<p>Nenhum aviso ainda. Comunicados importantes da MB aparecem aqui.</p></div>`}
        </article>
      </section>
    `;
  }

  // Lista de campos rotulo/valor; esconde o que estiver vazio em vez de mostrar
  // celula em branco (parece dado faltando/quebrado).
  function fieldList(rows) {
    const visible = rows.filter(([, value]) => String(value || "").trim() && !/^a definir$/i.test(String(value).trim()));
    if (!visible.length) return `<p class="comm-hint">${MBI.ui.icon("info")} Dados ainda não preenchidos pela MB.</p>`;
    return `<dl class="profile-fields">${visible.map(([label, value]) => `<div><dt>${MBI.ui.escape(label)}</dt><dd>${MBI.ui.escape(value)}</dd></div>`).join("")}</dl>`;
  }

  // Tela do CLIENTE: conexao bancaria (em breve) + lancamento MANUAL da parte dele
  // (despesas + conciliacao). Grava via PATCH /finance (o backend forca o proprio
  // client_id e so os campos do cliente; faturamento/impostos/folha sao da MB).
  function clientIntegrations(client) {
    const data = MBI.services.finance.get(client.id);
    const comp = data.competence || new Date().toISOString().slice(0, 7);
    const periods = MBI.services.finance.listPeriods(client.id);
    const card = (icon, title, desc) => `
      <article class="panel">
        <div class="panel-header">
          <div style="display:flex;align-items:center;gap:12px"><span class="doc-icon is-fin">${MBI.ui.icon(icon)}</span><div><h3>${title}</h3><p>${desc}</p></div></div>
          ${MBI.ui.pill("Em breve")}
        </div>
        <div class="brief-actions" style="margin-top:10px"><button class="btn btn-primary" type="button" disabled>${MBI.ui.icon("plug")} Conectar — em breve</button></div>
      </article>`;
    const historyTable = periods.length
      ? MBI.ui.table(["Competência", "Despesas", "Caixa", "Resultado", "Margem", "Ações"], periods.map((row) => [
          MBI.ui.escape(row.label),
          MBI.ui.money(row.expenses),
          MBI.ui.money(row.cash),
          MBI.ui.money(row.result),
          `${row.margin}%`,
          `<button class="btn btn-soft btn-mini" type="button" data-action="client-edit-period" data-client-id="${MBI.ui.escape(client.id)}" data-competence="${MBI.ui.escape(row.competence)}">${MBI.ui.icon("pencil")} Editar</button>`
        ]))
      : `<div class="empty-lock">${MBI.ui.icon("calendar")}<h3>Nenhum lançamento ainda</h3><p>Preencha o mês abaixo para começar o seu histórico.</p></div>`;
    return `
      <section class="panel" style="margin-bottom:14px">
        <div class="panel-header"><div><h3>Suas integrações e lançamentos</h3><p>Conecte seu banco (em breve) ou lance manualmente enquanto a integração não está ativa.</p></div>${MBI.ui.pill("Sua parte")}</div>
        <div class="metric-analysis"><strong>Como funciona:</strong> a MB cuida de <strong>faturamento, impostos e folha</strong>. Você informa as <strong>despesas</strong> e a <strong>conciliação bancária</strong> — e o seu dashboard atualiza na hora.</div>
      </section>
      <section class="grid grid-2" style="margin-bottom:14px">
        ${card("landmark", "Open Finance — banco automático", "Conecte sua conta para puxar extrato, recebimentos, pagamentos e saldo automaticamente.")}
        ${card("plug-zap", "Importar extrato (OFX)", "Suba o arquivo do banco e o sistema concilia para você.")}
      </section>
      <section class="panel" style="margin-bottom:14px">
        <div class="panel-header"><div><h3>Seus lançamentos</h3><p>Histórico do que você já informou. Use a competência no topo para trocar de mês.</p></div>${MBI.ui.pill(`${periods.length} mês(es)`)}</div>
        ${historyTable}
      </section>
      <form class="panel" data-form="client-finance">
        <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
        <div class="panel-header"><div><h3>Lançar / editar &middot; ${MBI.ui.escape(MBI.services.finance.monthLabel(comp))}</h3><p>Informe os números do mês. Faturamento, impostos e folha são lançados pela MB.</p></div><button class="btn btn-primary" type="submit">${MBI.ui.icon("save")} Salvar lançamento</button></div>
        <div class="form-section two" style="margin-bottom:6px">
          <label><span>Competência</span><input type="month" name="competence" value="${comp}"></label>
        </div>
        <div class="panel-subtitle" style="margin-top:8px"><strong>Despesas</strong></div>
        <div class="form-section">
          ${MBI.ui.moneyField("Despesas totais do mês", "expenses", data.expenses)}
          ${MBI.ui.moneyField("Caixa atual", "cash", data.cash)}
        </div>
        <div class="panel-subtitle" style="margin-top:14px"><strong>Conciliação bancária</strong></div>
        <div class="form-section">
          ${MBI.ui.moneyField("Saldo inicial", "openingBalance", data.openingBalance)}
          ${MBI.ui.moneyField("Recebimentos", "receipts", data.receipts)}
          ${MBI.ui.moneyField("Pagamentos", "payments", data.payments)}
          ${MBI.ui.moneyField("Saldo final", "closingBalance", data.closingBalance || data.cash)}
        </div>
        <p class="doc-hint" style="margin-top:10px">${MBI.ui.icon("shield-check")} Seus números atualizam o dashboard na hora. A MB valida no acompanhamento mensal.</p>
      </form>
    `;
  }

  function profile(client) {
    const empresa = fieldList([
      ["Razão social", client.name],
      ["Nome fantasia", client.tradeName],
      ["CNPJ", MBI.ui.cnpj(client.cnpj)],
      ["Cidade/UF", client.city],
      ["Segmento", client.segment],
      ["Regime tributário", client.taxRegime]
    ]);
    const responsavel = fieldList([
      ["Responsável", client.owner],
      ["E-mail de acesso", client.email],
      ["WhatsApp", client.phone],
      ["Mensalidade", client.monthlyFee != null ? `${MBI.ui.money(client.monthlyFee)}/mês` : "A definir"]
    ]);
    return `
      <section class="grid grid-2">
        <article class="panel"><div class="panel-header"><div><h3>Dados da empresa</h3><p>Cadastro principal mantido pela MB.</p></div>${MBI.ui.icon("building-2")}</div>${empresa}</article>
        <article class="panel"><div class="panel-header"><div><h3>Responsável e contato</h3><p>Dados de contato e mensalidade.</p></div>${MBI.ui.icon("user-round")}</div>${responsavel}</article>
        <form class="panel profile-security" data-form="change-password"><div class="panel-header"><div><h3>Segurança e senha</h3><p>Atualize seu acesso sem acionar a equipe MB.</p></div><button class="btn btn-primary" type="submit">${MBI.ui.icon("key-round")} Salvar senha</button></div><div class="form-section"><label><span>Senha atual</span><input type="password" name="currentPassword" autocomplete="current-password" required></label><label><span>Nova senha</span><input type="password" name="newPassword" autocomplete="new-password" required minlength="6"></label><label><span>Confirmar nova senha</span><input type="password" name="confirmPassword" autocomplete="new-password" required minlength="6"></label></div><p class="doc-hint" style="margin-top:4px">${MBI.ui.icon("shield-check")} Precisa corrigir algum dado cadastral? <button class="btn-link" type="button" data-route="#/cliente/comunicacao">Fale com a MB</button>.</p></form>
      </section>
    `;
  }

  MBI.pages.client = { render };
})();
