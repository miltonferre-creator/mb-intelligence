(function () {
  window.MBI = window.MBI || {};
  MBI.pages = MBI.pages || {};

  function login() {
    const clients = MBI.services.clients.list();
    return `
      <main class="login-page">
        <section class="login-brand">
          <div class="brand-lockup">
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
            <div><strong>MB Intelligence</strong><span>Plataforma de inteligencia financeira</span></div>
          </div>
          <div class="login-copy">
            <h1>Inteligencia financeira para empresas modernas.</h1>
            <p>Portal seguro para clientes e equipe MB acompanharem documentos, analises, indicadores e decisoes financeiras.</p>
          </div>
          <div class="proof-grid">
            <div><strong>Inteligencia</strong><span>Dashboards, DRE, caixa, score e analises por plano.</span></div>
            <div><strong>Governanca</strong><span>Documentos, aprovacoes, auditoria e operacao MB.</span></div>
            <div><strong>Planos</strong><span>Contabilidade, Financeiro IA e CFO as a Service.</span></div>
            <div><strong>Acesso unico</strong><span>Cliente ou operador MB direcionado ao ambiente correto.</span></div>
          </div>
        </section>

        <section class="login-workspace">
          <div class="login-card">
            <div class="section-title">
              <h2>Entrar</h2>
              <p>Acesse sua empresa ou a administracao operacional da MB.</p>
            </div>
            <form class="login-form" data-form="login">
              <input type="hidden" name="demoClientId" value="">
              <input type="hidden" name="demoMode" value="">
              <div class="form-grid">
                <label><span>E-mail</span><input name="email" type="email" value="admin@mbempresas.com.br" autocomplete="email" required></label>
                <label><span>Senha</span><input name="password" type="password" value="123456" autocomplete="current-password" required></label>
              </div>
              <label>
                <span>Cliente em operacao para usuario MB</span>
                <select name="clientId">${clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("")}</select>
              </label>
              <div class="login-actions">
                <button class="btn btn-primary" type="submit">${MBI.ui.icon("log-in")} Entrar</button>
                <button class="btn btn-ghost" type="button" data-route="#/contratar">${MBI.ui.icon("shopping-bag")} Criar conta e contratar</button>
              </div>
              <div class="demo-strip">
                <button type="button" data-fill-login="admin@mbempresas.com.br" data-demo-client-id="silva" data-demo-mode="admin">Entrar como Admin MB</button>
                <button type="button" data-fill-login="financeiro@mbempresas.com.br" data-demo-client-id="clinica" data-demo-mode="admin">Entrar como Financeiro MB</button>
                <button type="button" data-fill-login="cfo@cliente.com" data-demo-client-id="silva" data-demo-mode="client">Entrar como Cliente CFO</button>
                <button type="button" data-fill-login="financeiro@cliente.com" data-demo-client-id="clinica" data-demo-mode="client">Entrar como Financeiro IA</button>
                <button type="button" data-fill-login="contabilidade@cliente.com" data-demo-client-id="prime" data-demo-mode="client">Entrar como Contabilidade</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    `;
  }

  function register() {
    const plans = MBI.services.plans.list();
    return `
      <main class="login-page">
        <section class="login-brand">
          <div class="brand-lockup">
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
            <div><strong>MB Intelligence</strong><span>Contratacao</span></div>
          </div>
          <div class="login-copy">
            <h1>Cadastre sua empresa e escolha o plano.</h1>
            <p>Informe os dados da empresa. A ativacao comercial e concluida pela equipe MB apos confirmacao do plano.</p>
          </div>
          <div class="proof-grid">
            ${plans.map((plan) => `<div><strong>${MBI.ui.money(plan.price)}</strong><span>${plan.name}: ${plan.tagline}</span></div>`).join("")}
          </div>
        </section>
        <section class="login-workspace">
          <div class="login-card">
            <div class="section-title"><h2>Novo cadastro</h2><p>Apos o envio, a MB confirma o plano, ativa o acesso e orienta os proximos passos.</p></div>
            <form class="login-form" data-form="register-client">
              <div class="form-grid">
                <label><span>Razao social</span><input name="companyName" required placeholder="Razao social da empresa"></label>
                <label><span>Nome fantasia</span><input name="tradeName" placeholder="Nome fantasia"></label>
                <label><span>CNPJ</span><input name="cnpj" required placeholder="00.000.000/0001-00"></label>
                <label><span>Cidade/UF</span><input name="city" placeholder="Cidade/UF"></label>
                <label><span>Segmento</span><input name="segment" placeholder="Ex.: comercio, saude, servicos"></label>
                <label><span>Plano</span><select name="planId">${plans.map((plan) => `<option value="${plan.id}">${plan.name} - ${MBI.ui.money(plan.price)}</option>`).join("")}</select></label>
                <label><span>Responsavel</span><input name="ownerName" required placeholder="Nome do responsavel"></label>
                <label><span>WhatsApp</span><input name="phone" placeholder="(00) 00000-0000"></label>
                <label><span>E-mail de acesso</span><input name="email" type="email" required placeholder="email@empresa.com.br"></label>
                <label><span>Senha</span><input name="password" type="password" required minlength="6" placeholder="Crie uma senha de acesso"></label>
              </div>
              <div class="purchase-box">
                <label><span>Pagamento previsto</span><select name="paymentMethod"><option>Pix</option><option>Cartao de credito</option></select></label>
                <label><span>Status comercial</span><input value="Aguardando confirmacao de pagamento" readonly></label>
              </div>
              <div class="login-actions">
                <button class="btn btn-primary" type="submit">${MBI.ui.icon("check-circle")} Criar conta</button>
                <button class="btn btn-ghost" type="button" data-route="#/login">Voltar ao login</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    `;
  }

  MBI.pages.auth = { login, register };
})();
