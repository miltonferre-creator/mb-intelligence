(function () {
  window.MBI = window.MBI || {};
  MBI.pages = MBI.pages || {};

  const titles = {
    "#/admin/operacao": "Operacao MB",
    "#/admin/clientes": "Gestao de clientes",
    "#/admin/novo-cliente": "Gestao de clientes",
    "#/admin/planos": "Planos e permissões",
    "#/admin/alimentar-portal": "Alimentar portal",
    "#/admin/documentos": "Documentos",
    "#/admin/usuarios": "Usuários e perfis",
    "#/admin/auditoria": "Auditoria"
  };

  function menu(active) {
    return MBI.ui.nav([
      [null, null, "Operação"],
      ["#/admin/operacao", "layout-dashboard", "Painel"],
      ["#/admin/clientes", "building-2", "Clientes"],
      [null, null, "Alimentar o portal"],
      ["#/admin/alimentar-portal", "panel-top", "Dados & importações"],
      ["#/admin/documentos", "folder-up", "Documentos"],
      [null, null, "Configuração"],
      ["#/admin/planos", "badge-dollar-sign", "Planos"],
      ["#/admin/usuarios", "users-round", "Usuários"],
      [null, null, "Registros"],
      ["#/admin/auditoria", "history", "Auditoria"]
    ], active);
  }

  function currentMonthValue() {
    return MBI.services.finance?.currentMonth?.() || new Date().toISOString().slice(0, 7);
  }

  function currentDateValue() {
    return new Date().toISOString().slice(0, 10);
  }

  function sessionFilters(key) {
    return MBI.auth.currentSession()?.uiFilters?.[key] || {};
  }

  function roleOwner(needle, fallback) {
    const text = String(needle || "").toLowerCase();
    const user = MBI.services.users.list("mb").find((item) => String(item.role || "").toLowerCase().includes(text));
    return user?.name || fallback;
  }

  function topbarClientSelector() {
    const current = MBI.services.clients.current();
    const list = MBI.services.clients.list();
    if (!list.length) return "";
    return `
      <form class="topbar-client" data-form="select-admin-client">
        <span class="topbar-client-tag">${MBI.ui.icon("building-2")} Cliente</span>
        <select name="clientId" aria-label="Cliente em operação" onchange="this.form.requestSubmit()">${list.map((c) => `<option value="${MBI.ui.escape(c.id)}" ${c.id === current?.id ? "selected" : ""}>${MBI.ui.escape(c.name)}</option>`).join("")}</select>
        <button class="competence-filter-go" type="submit" aria-label="Trocar cliente">Trocar</button>
      </form>`;
  }

  function shell(route, content) {
    const user = MBI.auth.currentUser();
    return MBI.ui.shell({
      title: titles[route] || "Administração MB",
      subtitle: `Operador: ${MBI.ui.escape(user.name)}`,
      menu: menu(route),
      content,
      sessionLabel: user.role,
      sessionName: user.name,
      topbarExtra: topbarClientSelector()
    });
  }

  function render(route) {
    if (!MBI.services.clients.list().length) return shell("#/admin/clientes", emptyClients());
    if (route === "#/admin/clientes") return shell(route, clients());
    if (route === "#/admin/novo-cliente") return shell("#/admin/clientes", clients());
    if (route === "#/admin/planos") return shell(route, plans());
    if (route === "#/admin/alimentar-portal") return shell(route, publicationCenter());
    if (route === "#/admin/documentos") return shell(route, documents());
    if (route === "#/admin/usuarios") return shell(route, users());
    if (route === "#/admin/auditoria") return shell(route, audit());
    return shell("#/admin/operacao", operationV2());
  }

  function emptyClients() {
    return `
      <section class="panel" style="text-align:center;padding:48px 24px">
        <h3 style="margin-bottom:12px">Nenhum cliente cadastrado</h3>
        <p style="color:var(--muted);margin-bottom:24px">Cadastre o primeiro cliente para comecar a operar o portal.</p>
        <button class="btn btn-primary" type="button" data-route="#/admin/novo-cliente">${MBI.ui.icon("plus")} Cadastrar primeiro cliente</button>
      </section>
    `;
  }

  function operationV2() {
    const db = MBI.storage.getDatabase();
    const selected = MBI.services.clients.current();
    if (!selected) return emptyClients();
    const data = MBI.services.finance.get(selected.id);
    const plan = MBI.services.plans.get(selected.planId);
    const selectedDocs = MBI.services.documents.listByClient(selected.id);
    const selectedImports = MBI.services.imports.list(selected.id);
    const selectedTasks = db.tasks.filter((task) => task.clientId === selected.id);
    const dataLoaded = Number(data.revenue || 0) > 0 || selectedImports.length > 0;

    const flowSteps = [
      ["1", "Cadastrar", selected.status === "Ativo" ? "Cliente ativo" : "Em ativacao", "building-2", "#/admin/clientes", selected.status === "Ativo"],
      ["2", "Alimentar dados", dataLoaded ? "Dados carregados" : "Pendente", "database-zap", "#/admin/alimentar-portal", dataLoaded],
      ["3", "Publicar documentos", selectedDocs.length ? `${selectedDocs.length} publicado(s)` : "Nenhum ainda", "folder-up", "#/admin/documentos", selectedDocs.length > 0],
      ["4", "Entregar ao cliente", "Disponivel no portal do cliente", "send", "", false]
    ];
    const workflow = `
      <section class="panel workflow-panel">
        <div class="panel-header"><div><h3>Fluxo de trabalho</h3><p>O passo a passo para deixar o portal deste cliente pronto.</p></div>${MBI.ui.pill(plan.name)}</div>
        <div class="workflow-steps">
          ${flowSteps.map(([n, title, status, ic, route, done]) => `
            <${route ? "button" : "div"} class="workflow-step ${done ? "is-done" : ""}"${route ? ` type="button" data-route="${route}"` : ""}>
              <span class="workflow-num">${done ? MBI.ui.icon("check") : n}</span>
              <div class="workflow-step-body">${MBI.ui.icon(ic)}<strong>${title}</strong><span>${MBI.ui.escape(status)}</span></div>
            </${route ? "button" : "div"}>`).join("")}
        </div>
      </section>`;

    const opStats = `
      <div class="op-stats">
        <div><span>Faturamento</span><strong>${MBI.ui.money(data.revenue || 0)}</strong></div>
        <div><span>Resultado</span><strong>${data.result ? MBI.ui.money(data.result) : "—"}</strong></div>
        <div><span>Margem</span><strong>${data.margin || 0}%</strong></div>
        <div><span>Score MB</span><strong>${data.score || 0}/100</strong></div>
      </div>`;

    return `
      <section>
        <article class="panel selected-client-card">
          <div class="panel-header"><div><h3>${MBI.ui.escape(selected.name)}</h3><p>${MBI.ui.escape(plan.name)} · ${MBI.ui.escape(selected.status)} · Confianca ${MBI.ui.escape(selected.confidence)} · ${MBI.ui.escape(data.competenceLabel || "")}</p></div>${MBI.ui.pill(selected.confidence)}</div>
          ${opStats}
          <div class="brief-actions" style="margin-top:12px">
            <button class="btn btn-primary" type="button" data-route="#/admin/alimentar-portal">${MBI.ui.icon("panel-top")} Alimentar portal</button>
            <button class="btn btn-ghost" type="button" data-route="#/admin/documentos">${MBI.ui.icon("folder-up")} Publicar documento</button>
          </div>
        </article>
      </section>
      ${workflow}
      <section style="margin-top:14px">
        <article class="panel"><div class="panel-header"><div><h3>Proximas acoes</h3><p>Tarefas deste cliente.</p></div>${MBI.ui.pill(String(selectedTasks.length))}</div><div class="priority-list">${selectedTasks.map((task) => `<div class="priority-item"><span class="priority-dot ${task.priority === "Alta" ? "high" : "medium"}"></span><div><strong>${MBI.ui.escape(task.title)}</strong><span>${MBI.ui.escape(task.owner)} · vence ${MBI.ui.escape(task.due)}</span></div>${MBI.ui.pill(task.status)}</div>`).join("") || `<div class="empty-lock">${MBI.ui.icon("check-circle")}<h3>Nenhuma tarefa aberta</h3><p>Cliente sem pendencias no momento.</p></div>`}</div></article>
      </section>
    `;
  }

  function clients() {
    const filters = sessionFilters("adminClients");
    const search = String(filters.search || "").toLowerCase();
    const filtered = MBI.services.clients.list()
      .filter((client) => !search || `${client.name} ${client.cnpj} ${client.segment}`.toLowerCase().includes(search))
      .filter((client) => !filters.planId || filters.planId === "Todos" || client.planId === filters.planId)
      .filter((client) => !filters.status || filters.status === "Todos" || client.status === filters.status)
      .filter((client) => !filters.confidence || filters.confidence === "Todos" || client.confidence === filters.confidence)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
    const rows = filtered.map((client) => {
      const plan = MBI.services.plans.get(client.planId);
      const suspended = client.status === "Pausado";
      return [
        MBI.ui.escape(client.name),
        MBI.ui.escape(plan?.name || client.planId),
        MBI.ui.pill(client.status),
        MBI.ui.escape(client.maturity),
        `<button class="btn btn-soft btn-mini" type="button" data-action="set-client" data-client-id="${MBI.ui.escape(client.id)}">${MBI.ui.icon("pencil")} Operar/Editar</button> <button class="btn btn-ghost btn-mini" type="button" data-action="suspend-client" data-client-id="${MBI.ui.escape(client.id)}">${MBI.ui.icon(suspended ? "play" : "pause")} ${suspended ? "Reativar" : "Suspender"}</button>`
      ];
    });
    const current = MBI.services.clients.current();
    return `
      <form class="filter-row" data-form="admin-client-filters" style="margin-bottom:14px">
        <input name="search" placeholder="Buscar por nome, CNPJ ou segmento" value="${MBI.ui.escape(filters.search || "")}">
        <select name="planId"><option>Todos</option>${MBI.services.plans.list().map((plan) => `<option value="${plan.id}" ${filters.planId === plan.id ? "selected" : ""}>${plan.name}</option>`).join("")}</select>
        <select name="status"><option>Todos</option>${["Ativo", "Onboarding", "Pausado", "Risco"].map((status) => `<option ${filters.status === status ? "selected" : ""}>${status}</option>`).join("")}</select>
        <button class="btn btn-primary" type="submit">${MBI.ui.icon("search")} Filtrar</button>
      </form>
      <section class="panel">
        <div class="panel-header"><div><h3>Carteira de clientes</h3><p>Operar/editar abre a ficha; suspender pausa o acesso.</p></div>${MBI.ui.pill(`${filtered.length} cliente(s)`)}</div>
        ${MBI.ui.table(["Cliente", "Plano", "Status", "Maturidade", "Ações"], rows)}
      </section>
      <details class="report-detail" style="margin-top:14px"${current ? " open" : ""}>
        <summary>Editar ficha${current ? ` — ${MBI.ui.escape(current.name)}` : " do cliente em operação"}</summary>
        ${current ? clientProfileEditor(current) : `<div class="empty-lock">${MBI.ui.icon("user")}<h3>Nenhum cliente em operação</h3><p>Clique em "Operar/Editar" em um cliente da lista.</p></div>`}
      </details>
      <details class="report-detail" style="margin-top:14px">
        <summary>Cadastrar novo cliente</summary>
        ${newClient()}
      </details>
    `;
  }

  function clientProfileEditor(client) {
    return `
      <form class="panel" data-form="update-client-profile">
        <input type="hidden" name="clientId" value="${client.id}">
        <div class="panel-header"><div><h3>Ficha do cliente</h3><p>Edite cadastro, plano contratado, status, maturidade e responsaveis MB.</p></div><button class="btn btn-primary" type="submit">${MBI.ui.icon("save")} Salvar ficha</button></div>
        <div class="form-section two">
          <label><span>Razao social</span><input name="name" value="${MBI.ui.escape(client.name)}"></label>
          <label><span>Nome fantasia</span><input name="tradeName" value="${MBI.ui.escape(client.tradeName || client.name)}"></label>
          <label><span>CNPJ</span><input name="cnpj" value="${MBI.ui.escape(client.cnpj)}"></label>
          <label><span>Cidade/UF</span><input name="city" value="${MBI.ui.escape(client.city)}"></label>
          <label><span>Segmento</span><input name="segment" value="${MBI.ui.escape(client.segment)}"></label>
          <label><span>Regime</span><select name="taxRegime"><option ${client.taxRegime === "Simples Nacional" ? "selected" : ""}>Simples Nacional</option><option ${client.taxRegime === "Lucro Presumido" ? "selected" : ""}>Lucro Presumido</option></select></label>
          <label><span>Plano contratado</span><select name="planId">${MBI.services.plans.list().map((plan) => `<option value="${plan.id}" ${plan.id === client.planId ? "selected" : ""}>${plan.name}</option>`).join("")}</select></label>
          <label><span>Status</span><select name="status"><option ${client.status === "Onboarding" ? "selected" : ""}>Onboarding</option><option ${client.status === "Ativo" ? "selected" : ""}>Ativo</option><option ${client.status === "Pausado" ? "selected" : ""}>Pausado</option><option ${client.status === "Risco" ? "selected" : ""}>Risco</option></select></label>
          <label><span>Maturidade</span><select name="maturity"><option ${client.maturity === "Fiscal basico" ? "selected" : ""}>Fiscal basico</option><option ${client.maturity === "Financeiro integrado" ? "selected" : ""}>Financeiro integrado</option><option ${client.maturity === "CFO validado" ? "selected" : ""}>CFO validado</option><option ${client.maturity === "Onboarding" ? "selected" : ""}>Onboarding</option></select></label>
          <label><span>Confianca</span><select name="confidence"><option ${client.confidence === "Baixa" ? "selected" : ""}>Baixa</option><option ${client.confidence === "Media" ? "selected" : ""}>Media</option><option ${client.confidence === "Alta" ? "selected" : ""}>Alta</option></select></label>
          <label><span>Responsavel legal</span><input name="owner" value="${MBI.ui.escape(client.owner)}"></label>
          <label><span>E-mail</span><input name="email" value="${MBI.ui.escape(client.email)}"></label>
          <label><span>WhatsApp</span><input name="phone" value="${MBI.ui.escape(client.phone)}"></label>
          <label><span>Consultor MB</span><input name="consultant" value="${MBI.ui.escape(client.consultant)}"></label>
          <label><span>Analista MB</span><input name="analyst" value="${MBI.ui.escape(client.analyst)}"></label>
          <label><span>Proxima revisao MB</span><input type="date" name="nextReview" value="${client.nextReview || currentDateValue()}"></label>
        </div>
      </form>
    `;
  }

  function newClient() {
    return `
      <form class="grid grid-2" data-form="admin-create-client">
        <article class="panel"><div class="panel-header"><div><h3>Dados cadastrais</h3><p>Cadastro operacional da empresa cliente.</p></div></div><div class="form-section two"><label><span>Razão social</span><input name="name" required placeholder="Razão social"></label><label><span>Nome fantasia</span><input name="tradeName" placeholder="Nome fantasia"></label><label><span>CNPJ</span><input name="cnpj" required placeholder="00.000.000/0001-00"></label><label><span>Cidade/UF</span><input name="city" placeholder="Cidade/UF"></label><label><span>Segmento</span><input name="segment" placeholder="Segmento"></label><label><span>Regime</span><select name="taxRegime"><option>Simples Nacional</option><option>Lucro Presumido</option></select></label></div></article>
        <article class="panel"><div class="panel-header"><div><h3>Contrato e operação</h3><p>Plano, responsáveis e primeiro acesso.</p></div></div><div class="form-section two"><label><span>Responsável</span><input name="owner" placeholder="Responsável legal"></label><label><span>E-mail</span><input name="email" type="email" placeholder="cliente@empresa.com.br"></label><label><span>WhatsApp</span><input name="phone" placeholder="(00) 00000-0000"></label><label><span>Plano</span><select name="planId">${MBI.services.plans.list().map((plan) => `<option value="${plan.id}">${plan.name}</option>`).join("")}</select></label><label><span>Consultor</span><input name="consultant" placeholder="Consultor MB"></label><label><span>Analista</span><input name="analyst" placeholder="Analista MB"></label></div><button class="btn btn-primary" style="margin-top:14px" type="submit">${MBI.ui.icon("save")} Cadastrar cliente</button></article>
      </form>
    `;
  }

  function plans() {
    const plans = MBI.services.plans.list();
    return `
      <form class="grid" data-form="update-plan-prices">
        <article class="panel"><div class="panel-header"><div><h3>Valores dos planos</h3><p>Preços editáveis pela equipe MB.</p></div><button class="btn btn-primary" type="submit">${MBI.ui.icon("save")} Salvar preços</button></div><div class="plan-admin-grid">${plans.map((plan) => `<div class="plan-admin-card"><span class="status-pill ${plan.color}">${plan.name}</span><h3 style="margin-top:12px">${plan.tagline}</h3><label><span>Valor mensal</span><input type="number" name="price_${plan.id}" value="${plan.price}" step="50"></label><div class="module-chips">${plan.modules.map((module) => `<span class="chip is-on">${module}</span>`).join("")}</div></div>`).join("")}</div></article>
        <article class="panel"><div class="panel-header"><div><h3>Matriz de permissões</h3><p>Regra de liberação por plano.</p></div></div>${MBI.ui.table(["Módulo", "Básico", "Gestão", "Regra"], MBI.services.plans.matrix())}</article>
      </form>
    `;
  }

  function publicationCenter() {
    const client = MBI.services.clients.current();
    const data = MBI.services.finance.get(client.id);
    const periods = MBI.services.finance.listPeriods(client.id);
    const comp = data.competence || currentMonthValue();
    const today = new Date().toISOString().slice(0, 10);
    const conf = (v) => client.confidence === v ? "selected" : "";

    return `
      <form class="panel" data-form="update-finance">
        <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
        <div class="panel-header">
          <div><h3>Dados financeiros &middot; ${MBI.ui.escape(client.name)}</h3><p>Preencha os numeros do mes. Resultado, margem, score e folego sao calculados pela MB.</p></div>
          <button class="btn btn-primary" type="submit">${MBI.ui.icon("save")} Salvar dados</button>
        </div>
        <div class="form-section two" style="margin-bottom:12px">
          <label><span>Competencia dos dados</span><input type="month" name="competence" value="${comp}"></label>
          <label><span>Proxima revisao MB</span><input type="date" name="nextReview" value="${client.nextReview || currentDateValue()}"></label>
        </div>
        <div class="form-section">
          <label><span>Faturamento</span><input name="revenue" type="number" value="${data.revenue || 0}"></label>
          <label><span>Despesas</span><input name="expenses" type="number" value="${data.expenses || 0}"></label>
          <label><span>Impostos / DAS</span><input name="taxes" type="number" value="${data.taxes || 0}"></label>
          <label><span>Folha</span><input name="payroll" type="number" value="${data.payroll || 0}"></label>
          <label><span>Caixa atual</span><input name="cash" type="number" value="${data.cash || 0}"></label>
          <label><span>Confianca dos dados</span><select name="confidence"><option ${conf("Baixa")}>Baixa</option><option ${conf("Media")}>Media</option><option ${conf("Alta")}>Alta</option></select></label>
        </div>
        <div class="op-stats" style="margin-top:14px">
          <div><span>Resultado (calc.)</span><strong>${MBI.ui.money(data.result || 0)}</strong></div>
          <div><span>Margem (calc.)</span><strong>${data.margin || 0}%</strong></div>
          <div><span>Score MB (calc.)</span><strong>${data.score || 0}/100</strong></div>
          <div><span>Folego (calc.)</span><strong>${data.runway || 0} dias</strong></div>
        </div>
        <label style="display:block;margin-top:14px"><span>Analise MB para o dashboard</span><textarea name="insight" placeholder="Leitura executiva do mes (opcional).">${MBI.ui.escape(data.insights?.[0] || "")}</textarea></label>
        <details class="report-detail" style="margin-top:14px">
          <summary>Detalhamento opcional &mdash; DRE, fluxo de caixa e metas</summary>
          <div class="panel-subtitle" style="margin-top:14px"><strong>DRE gerencial</strong></div>
          <div class="form-section">
            <label><span>Custos diretos / CMV</span><input name="directCosts" type="number" value="${data.directCosts || 0}"></label>
            <label><span>Despesas administrativas</span><input name="adminExpenses" type="number" value="${data.adminExpenses || 0}"></label>
            <label><span>Despesas comerciais</span><input name="salesExpenses" type="number" value="${data.salesExpenses || 0}"></label>
            <label><span>Despesas financeiras</span><input name="financialExpenses" type="number" value="${data.financialExpenses || 0}"></label>
          </div>
          <div class="panel-subtitle" style="margin-top:14px"><strong>Fluxo de caixa</strong></div>
          <div class="form-section">
            <label><span>Saldo inicial</span><input name="openingBalance" type="number" value="${data.openingBalance || 0}"></label>
            <label><span>Recebimentos</span><input name="receipts" type="number" value="${data.receipts || data.revenue || 0}"></label>
            <label><span>Pagamentos</span><input name="payments" type="number" value="${data.payments || Math.max((data.expenses || 0) - (data.taxes || 0), 0)}"></label>
            <label><span>Impostos pagos</span><input name="cashTaxes" type="number" value="${data.cashTaxes || data.taxes || 0}"></label>
            <label><span>Saldo final</span><input name="closingBalance" type="number" value="${data.closingBalance || data.cash || 0}"></label>
          </div>
          <div class="panel-subtitle" style="margin-top:14px"><strong>Parametros MB</strong></div>
          <div class="form-section two">
            <label><span>Meta de margem (%)</span><input name="marginTarget" type="number" value="${data.marginTarget || 20}"></label>
            <label><span>NCG / capital de giro (dias)</span><input name="workingCapitalDays" type="number" value="${data.workingCapitalDays || 45}"></label>
          </div>
        </details>
      </form>

      <section class="panel" style="margin-top:14px">
        <div class="panel-header"><div><h3>Periodos registrados</h3><p>Historico salvo. Clique em editar para reabrir um mes.</p></div>${MBI.ui.pill(`${periods.length} periodo(s)`)}</div>
        ${periods.length ? MBI.ui.table(["Competencia", "Faturamento", "Despesas", "Resultado", "Caixa", "Margem", "Acao"], periods.map((row) => [MBI.ui.escape(row.label), MBI.ui.money(row.revenue), MBI.ui.money(row.expenses), MBI.ui.money(row.result), MBI.ui.money(row.cash), `${row.margin}%`, `<button class="btn btn-soft btn-mini" type="button" data-action="edit-finance-period" data-client-id="${MBI.ui.escape(client.id)}" data-competence="${MBI.ui.escape(row.competence)}">${MBI.ui.icon("pencil")} Editar</button>`])) : `<div class="empty-lock">${MBI.ui.icon("calendar")}<h3>Nenhum periodo registrado</h3><p>Salve os primeiros indicadores para criar o historico.</p></div>`}
      </section>

      <details class="report-detail" style="margin-top:14px">
        <summary>Outras ações — importar arquivo e criar tarefa</summary>
      <section class="grid grid-2" style="margin-top:12px">
        <form class="panel" data-form="admin-import" enctype="multipart/form-data">
          <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
          <input type="hidden" name="status" value="Aguardando validacao MB">
          <input type="hidden" name="result" value="Atualizar dados do portal">
          <div class="panel-header"><div><h3>Importar arquivo</h3><p>DRE, fluxo, OFX, CSV, Excel, XML.</p></div></div>
          <label class="upload-zone"><input class="sr-only" type="file" name="file" required>${MBI.ui.icon("database-zap")}<div><strong>Selecionar arquivo</strong><p>Entra na fila de validacao da MB.</p></div></label>
          <div class="form-section two" style="margin-top:12px">
            <label><span>Nome exibido</span><input name="fileName" placeholder="Preenchido ao selecionar"></label>
            <label><span>Tipo</span><select name="type"><option>DRE padrao MB</option><option>Fluxo de caixa</option><option>OFX bancario</option><option>CSV financeiro</option><option>Excel gerencial</option><option>XML fiscal</option><option>PDF / relatorio</option></select></label>
            <label><span>Competencia</span><input type="month" name="competence" value="${comp}"></label>
          </div>
          <button class="btn btn-primary" style="margin-top:12px" type="submit">${MBI.ui.icon("upload")} Carregar</button>
        </form>

        <form class="panel" data-form="create-task">
          <input type="hidden" name="clientId" value="${MBI.ui.escape(client.id)}">
          <div class="panel-header"><div><h3>Criar tarefa</h3><p>Vira pendencia no portal do cliente.</p></div></div>
          <div class="form-section">
            <label><span>Titulo</span><input name="title" required placeholder="Ex.: Enviar extrato bancario"></label>
            <label><span>Responsavel</span><select name="owner"><option>MB</option><option>Cliente</option></select></label>
            <label><span>Prioridade</span><select name="priority"><option>Alta</option><option>Media</option><option>Baixa</option></select></label>
            <label><span>Prazo</span><input name="due" type="date" value="${today}"></label>
          </div>
          <button class="btn btn-primary" style="margin-top:12px" type="submit">${MBI.ui.icon("plus")} Criar tarefa</button>
        </form>
      </section>
      </details>
    `;
  }

  function documents() {
    const client = MBI.services.clients.current();
    const filters = sessionFilters("adminDocuments");
    const docs = MBI.services.documents.listByClient(client.id)
      .filter((doc) => !filters.category || filters.category === "Todas" || doc.category === filters.category)
      .filter((doc) => !filters.status || filters.status === "Todos" || doc.status === filters.status)
      .filter((doc) => !filters.competence || String(doc.competence || doc.due || "").startsWith(filters.competence))
      .sort((a, b) => String(b.competence || b.due || "").localeCompare(String(a.competence || a.due || "")));
    return `
      <section>
        <form class="panel" data-form="publish-document" enctype="multipart/form-data">
          <input type="hidden" name="clientId" value="${client.id}">
          <div class="panel-header"><div><h3>Publicar documento</h3><p>Envio principal realizado pela equipe MB com arquivo salvo no Storage.</p></div></div>
          <label class="upload-zone"><input class="sr-only" type="file" name="file" required>${MBI.ui.icon("file-up")}<div><strong>Selecionar arquivo para o cliente</strong><p>DAS, guias, folha, relatórios, certidões, contratos e comprovantes. Limite atual: 25 MB.</p></div></label>
          <input type="hidden" name="status" value="Disponivel">
          <div class="form-section two" style="margin-top:14px"><label><span>Descricao para o cliente</span><input name="name" placeholder="Ex.: DAS Maio/2026, Folha, Contrato social"></label><label><span>Categoria</span><select name="category"><option>Fiscal</option><option>Trabalhista</option><option>Contábil</option><option>Financeiro</option><option>Societário</option><option>Contratos</option><option>Certidões</option></select></label><label><span>Tipo</span><input name="type" value="DAS"></label><label><span>Competência</span><input type="month" name="competence" value="${currentMonthValue()}"></label><label><span>Vencimento</span><input type="date" name="dueDate" value="${currentDateValue()}"></label><label><span>Status</span><input value="Publicado diretamente ao cliente" readonly></label><label><span>Visibilidade</span><select name="visibility"><option>Cliente</option><option>Somente MB</option></select></label></div>
          <button class="btn btn-primary" style="margin-top:14px" type="submit">${MBI.ui.icon("upload")} Publicar documento</button>
        </form>
      </section>
      <section class="panel" style="margin-top:14px">
        <div class="panel-header"><div><h3>Documentos do cliente</h3><p>Historico publicado com filtros por categoria, status e competencia.</p></div></div>
        <form class="filter-row" data-form="document-filters">
          <input type="hidden" name="scope" value="admin">
          <select name="category"><option>Todas</option>${["Fiscal", "Trabalhista", "Contábil", "Financeiro", "Societário", "Contratos", "Certidões"].map((item) => `<option ${filters.category === item ? "selected" : ""}>${item}</option>`).join("")}</select>
          <select name="status"><option>Todos</option>${["Disponivel", "Pendente", "Pago", "Vencido"].map((item) => `<option ${filters.status === item ? "selected" : ""}>${item}</option>`).join("")}</select>
          <input type="month" name="competence" value="${filters.competence || ""}">
          <button class="btn btn-primary" type="submit">${MBI.ui.icon("filter")} Aplicar</button>
        </form>
        ${MBI.ui.table(["Descricao", "Arquivo original", "Categoria", "Status", "Competencia", "Vencimento", "Visibilidade", "Acoes"], docs.map((doc) => [MBI.ui.escape(doc.description || doc.name || "-"), MBI.ui.escape(doc.fileName || doc.originalFileName || doc.name || "-"), MBI.ui.escape(doc.category), MBI.ui.pill(doc.status), MBI.ui.escape(doc.competence || "-"), MBI.ui.escape(doc.dueDate || doc.due || "-"), MBI.ui.escape(doc.visibility), `<button class="btn btn-soft btn-mini" type="button" data-action="document-download" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("download")} Baixar</button> <button class="btn btn-ghost btn-mini" type="button" data-action="delete-document" data-document-id="${MBI.ui.escape(doc.id)}">${MBI.ui.icon("trash-2")} Excluir</button>`]))}
      </section>
    `;
  }

  function users() {
    const rows = MBI.services.users.list().map((user) => [
      MBI.ui.escape(user.name),
      user.type === "mb" ? "MB" : "Cliente",
      MBI.ui.escape(user.role),
      MBI.ui.escape(user.email),
      MBI.ui.pill(user.status),
      `<button class="btn btn-soft btn-mini" type="button" data-action="edit-user" data-user-id="${MBI.ui.escape(user.id)}">${MBI.ui.icon("pencil")} Editar</button> <button class="btn btn-ghost btn-mini" type="button" data-action="deactivate-user" data-user-id="${MBI.ui.escape(user.id)}">${MBI.ui.icon("user-x")} Desativar</button>`
    ]);
    return `
      <section class="panel">
        <div class="panel-header"><div><h3>Usuários</h3><p>Equipe MB e acessos de cliente.</p></div>${MBI.ui.pill(`${rows.length} usuário(s)`)}</div>
        ${MBI.ui.table(["Nome", "Tipo", "Perfil", "E-mail", "Status", "Ações"], rows)}
      </section>
      <details class="report-detail" style="margin-top:14px">
        <summary>Criar usuário</summary>
        <form class="panel" data-form="create-user" style="margin-top:14px"><div class="form-section two"><label><span>Tipo</span><select name="type"><option value="client">Cliente</option><option value="mb">MB</option></select></label><label><span>Cliente</span><select name="clientId">${MBI.services.clients.list().map((client) => `<option value="${MBI.ui.escape(client.id)}">${MBI.ui.escape(client.name)}</option>`).join("")}</select></label><label><span>Nome</span><input name="name" required placeholder="Nome do usuário"></label><label><span>E-mail</span><input name="email" type="email" required placeholder="email@empresa.com.br"></label><label><span>Senha</span><input name="password" type="password" required minlength="8" placeholder="Mínimo 8 caracteres"></label><label><span>Perfil</span><input name="role" placeholder="Ex.: Somente leitura"></label></div><button class="btn btn-primary" style="margin-top:14px" type="submit">${MBI.ui.icon("user-plus")} Criar usuário</button></form>
      </details>
    `;
  }

  function audit() {
    const rows = MBI.services.audit.list().map((row) => [
      MBI.ui.escape(row.at),
      MBI.ui.escape(row.action),
      MBI.ui.escape(row.user),
      MBI.ui.escape(row.target),
      MBI.ui.escape(row.result)
    ]);
    return `
      <section class="panel">
        <div class="panel-header"><div><h3>Trilha de auditoria</h3><p>Registro de ações relevantes na operação da MB.</p></div>${MBI.ui.pill(`${rows.length} registro(s)`)}</div>
        ${rows.length ? MBI.ui.table(["Quando", "Ação", "Usuário", "Alvo", "Resultado"], rows) : `<div class="empty-lock">${MBI.ui.icon("history")}<h3>Sem registros ainda</h3><p>As ações relevantes da MB aparecerão aqui.</p></div>`}
      </section>
    `;
  }

  MBI.pages.admin = { render };
})();
