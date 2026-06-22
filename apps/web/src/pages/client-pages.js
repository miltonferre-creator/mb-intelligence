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
    if (client.planId !== "gestao") {
      return `<div class="brief-copy"><strong>Leitura financeira disponível no Plano Gestão</strong><span>Seu plano Básico acompanha documentos, guias e obrigações fiscais. Para ver faturamento, resultado, margem e caixa com leitura executiva automática, evolua para o Plano Gestão.</span></div>`;
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

  function tabAllowed(client, tab) {
    if (tab === "overview") return true;
    // 2 planos: so o Gestao libera financeiro/dashboard; Basico = downloads.
    return client.planId === "gestao";
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
        ${MBI.ui.kpi("Resultado", data.result ? MBI.ui.money(data.result) : "Indisponível", `${data.margin || 0}% margem`, "Resultado calculado com os dados validados pela MB.", "teal", delta(current, previous, "result"), spark(rows, "result"))}
        ${MBI.ui.kpi("Impostos / DAS", MBI.ui.money(data.taxes), "Fiscal", "Acompanhamento fiscal da MB por competência.", "amber", delta(current, previous, "taxes"), spark(rows, "taxes"), true)}
        ${MBI.ui.kpi("Score MB", `${data.score || 0}/100`, "Financeiro", "Score financeiro calculado pela MB.", "brand", delta(current, previous, "score"), spark(rows, "score"))}
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
    const scorePanel = `<article class="panel"><div class="panel-header"><div><h3>Radar do score</h3><p>Seis dimensões financeiras.</p></div></div>${MBI.ui.radar(data.scoreBreakdown)}</article>`;
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
        ${(() => {
          const [tone, txt] = executiveAlert(data);
          return `<div class="exec-alert ${tone}">${MBI.ui.icon(tone === "is-good" ? "check-circle" : "alert-triangle")}<span><strong>Inteligência MB · ${tone === "is-good" ? "Situação" : "Atenção"}:</strong> ${txt}</span></div>`;
        })()}
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
      ["Cockpit liberado", client.planId === "gestao" ? "Completo" : "Parcial", "Módulos liberados conforme plano."]
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
