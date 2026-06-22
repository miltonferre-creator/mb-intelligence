(function () {
  window.MBI = window.MBI || {};
  MBI.pages = MBI.pages || {};

  function login() {
    return `
      <main class="login-page login-solo">
        <div class="login-solo-card">
          <div class="login-brandbar">
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
          </div>
          <div class="section-title">
            <h2>Entrar</h2>
          </div>
          <form class="login-form" data-form="login">
            <div class="form-grid">
              <label><span>E-mail</span><input name="email" type="email" autocomplete="email" required placeholder="seu@email.com.br"></label>
              <label><span>Senha</span><input name="password" type="password" autocomplete="current-password" required placeholder="Sua senha de acesso"></label>
            </div>
            <button class="btn btn-primary login-solo-btn" type="submit">${MBI.ui.icon("log-in")} Entrar</button>
            <div class="login-footer-links">
              <button class="btn-link" type="button" data-route="#/recuperar-senha">Esqueci minha senha</button>
              <span>·</span>
              <button class="btn-link" type="button" data-route="#/privacidade">Privacidade e LGPD</button>
            </div>
          </form>
        </div>
      </main>
    `;
  }

  function register() {
    const plans = MBI.services.plans.list().filter((plan) => !plan.comingSoon);
    return `
      <main class="login-page">
        <section class="login-brand">
          <div class="brand-lockup">
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
            <div><strong>MB Intelligence</strong><span>Contratar agora</span></div>
          </div>
          <div class="login-copy">
            <h1>Cadastre sua empresa e comece.</h1>
            <p>Preencha os dados. Em ate 48 horas voce recebe o acesso ao portal e a MB orienta os proximos passos.</p>
          </div>
          <div class="proof-grid">
            <div>
              <strong>Plano Contabilidade — R$&nbsp;500/mes</strong>
              <span>Contabilidade, DAS, guias, documentos e repositorio digital.</span>
            </div>
            <div>
              <strong>Plano Gestao — R$&nbsp;770/mes</strong>
              <span>Tudo do Contabilidade + folha ate 5 funcionarios, dashboard e indicadores.</span>
            </div>
            <div>
              <strong>Sem fidelidade minima</strong>
              <span>Mensalidade simples. Cancele quando quiser.</span>
            </div>
            <div>
              <strong>Troca gratis</strong>
              <span>Se voce ja tem contador, a MB cuida de toda a migracao sem custo adicional.</span>
            </div>
          </div>
          <a class="btn btn-whatsapp" href="https://wa.me/5500000000000?text=Ola%2C%20tenho%20duvidas%20sobre%20os%20planos%20da%20MB" target="_blank" rel="noopener">
            ${MBI.ui.icon("message-circle")} Tirar duvidas no WhatsApp
          </a>
        </section>
        <section class="login-workspace">
          <div class="login-card">
            <div class="section-title"><h2>Novo cadastro</h2><p>Apos o envio, a MB confirma o plano, ativa o acesso e orienta os proximos passos.</p></div>
            <form class="login-form" data-form="register-client">
              <div class="form-grid">
                <label><span>Razao social</span><input name="companyName" required placeholder="Razao social da empresa"></label>
                <label><span>Nome fantasia</span><input name="tradeName" placeholder="Nome fantasia (opcional)"></label>
                <label><span>CNPJ</span><input name="cnpj" required placeholder="00.000.000/0001-00"></label>
                <label><span>Cidade/UF</span><input name="city" placeholder="Ex.: Fortaleza/CE"></label>
                <label><span>Segmento</span><input name="segment" placeholder="Ex.: comercio, saude, servicos"></label>
                <label><span>Plano desejado</span><select name="planId">${plans.map((plan) => `<option value="${plan.id}">${plan.name} — ${MBI.ui.money(plan.price)}/mes</option>`).join("")}</select></label>
                <label><span>Responsavel</span><input name="ownerName" required placeholder="Nome do responsavel"></label>
                <label><span>WhatsApp</span><input name="phone" placeholder="(00) 00000-0000"></label>
                <label><span>E-mail de acesso</span><input name="email" type="email" required placeholder="email@empresa.com.br"></label>
                <label><span>Crie uma senha</span><input name="password" type="password" required minlength="8" placeholder="Minimo 8 caracteres"></label>
              </div>
              <div class="purchase-box">
                <label><span>Forma de pagamento preferida</span><select name="paymentMethod"><option>Pix</option><option>Cartao de credito</option><option>Boleto bancario</option></select></label>
                <label><span>Status</span><input value="Aguardando confirmacao da MB" readonly></label>
              </div>
              <div class="login-actions">
                <button class="btn btn-primary" type="submit">${MBI.ui.icon("check-circle")} Enviar cadastro</button>
                <button class="btn btn-ghost" type="button" data-route="#/login">Ja tenho acesso</button>
              </div>
              <p class="form-legal">Ao cadastrar voce concorda com nossa <button class="btn-link" type="button" data-route="#/privacidade">Politica de Privacidade</button>.</p>
            </form>
          </div>
        </section>
      </main>
    `;
  }

  function resetPassword() {
    return `
      <main class="login-page">
        <section class="login-brand">
          <div class="brand-lockup">
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
            <div><strong>MB Intelligence</strong><span>Recuperar acesso</span></div>
          </div>
          <div class="login-copy">
            <h1>Esqueceu sua senha?</h1>
            <p>Informe o e-mail cadastrado. Voce recebera um link para criar uma nova senha.</p>
          </div>
        </section>
        <section class="login-workspace">
          <div class="login-card">
            <div class="section-title"><h2>Recuperar senha</h2><p>Enviaremos um link de redefinicao para o seu e-mail.</p></div>
            <form class="login-form" data-form="reset-password">
              <div class="form-grid">
                <label><span>E-mail cadastrado</span><input name="email" type="email" required autocomplete="email" placeholder="seu@email.com.br"></label>
              </div>
              <div class="login-actions">
                <button class="btn btn-primary" type="submit">${MBI.ui.icon("send")} Enviar link de recuperacao</button>
                <button class="btn btn-ghost" type="button" data-route="#/login">Voltar ao login</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    `;
  }

  function privacy() {
    return `
      <main class="login-page login-page--wide">
        <section class="login-workspace" style="max-width:720px;margin:0 auto;padding:40px 24px">
          <div class="login-card">
            <div class="brand-lockup" style="margin-bottom:24px">
              <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial">
              <div><strong>MB Assessoria Empresarial</strong><span>Politica de Privacidade e Protecao de Dados</span></div>
            </div>
            <div class="section-title"><h2>Politica de Privacidade</h2><p>Versao 1.0 — Junho de 2026 — Em conformidade com a LGPD (Lei 13.709/2018)</p></div>
            <div class="legal-body">
              <h3>1. Quem somos</h3>
              <p>MB Assessoria Empresarial, empresa especializada em contabilidade e consultoria financeira para PMEs. Operamos a plataforma MB Intelligence para disponibilizacao digital de documentos, relatorios e indicadores financeiros aos nossos clientes.</p>

              <h3>2. Dados que coletamos</h3>
              <p>Coletamos dados necessarios para a prestacao dos servicos contratados: nome da empresa, CNPJ, dados dos responsaveis (nome, e-mail, telefone), documentos contabeis e fiscais, dados financeiros (faturamento, despesas, saldos) fornecidos pelo proprio cliente ou pela equipe MB no processo de consultoria.</p>

              <h3>3. Como usamos seus dados</h3>
              <p>Seus dados sao usados exclusivamente para: (a) prestacao dos servicos de contabilidade e consultoria; (b) disponibilizacao do portal MB Intelligence; (c) comunicacao sobre obrigacoes fiscais e documentos; (d) cumprimento de obrigacoes legais e regulatorias.</p>

              <h3>4. Compartilhamento</h3>
              <p>Nao vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Dados sao compartilhados apenas com: orgaos reguladores (Receita Federal, PGFN, INSS, eSocial) quando exigido por lei, e prestadores de tecnologia que sustentam a plataforma (Supabase / AWS), sob acordos de confidencialidade.</p>

              <h3>5. Seus direitos (LGPD)</h3>
              <p>Voce tem direito a: acessar seus dados, corrigir informacoes incorretas, solicitar a exclusao de dados pessoais, revogar consentimento e solicitar portabilidade. Para exercer qualquer direito, entre em contato pelo WhatsApp ou e-mail da MB.</p>

              <h3>6. Seguranca</h3>
              <p>Utilizamos criptografia em transito (HTTPS/TLS), autenticacao segura com tokens temporarios, controle de acesso por perfil e auditoria de todas as operacoes criticas na plataforma.</p>

              <h3>7. Retencao de dados</h3>
              <p>Dados contabeis e fiscais sao mantidos por no minimo 5 anos, conforme exigencia legal. Dados de acesso ao portal sao mantidos pelo periodo de vigencia do contrato mais 60 dias.</p>

              <h3>8. Contato</h3>
              <p>Duvidas sobre privacidade: entre em contato com a MB pelo WhatsApp ou pelo e-mail disponivel no contrato de prestacao de servicos.</p>
            </div>
            <div style="margin-top:24px">
              <button class="btn btn-ghost" type="button" data-route="#/login">Voltar ao login</button>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  MBI.pages.auth = { login, register, resetPassword, privacy };
})();
