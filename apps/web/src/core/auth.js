(function () {
  window.MBI = window.MBI || {};

  function currentSession() {
    return MBI.storage.getSession();
  }

  function currentUser() {
    const session = currentSession();
    if (!session) return null;
    const db = MBI.storage.getDatabase();
    return db.users.find((user) => user.id === session.userId) || null;
  }

  function localLogin(payload) {
    const db = MBI.storage.getDatabase();
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const user = db.users.find((item) => item.email.toLowerCase() === email && item.password === password && item.status === "Ativo");
    if (!user) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const targetClientId = payload.demoClientId || user.clientId || payload.clientId;
    if (user.type === "client" && targetClientId && !db.clients.some((client) => client.id === targetClientId)) {
      MBI.storage.resetDatabase();
      return localLogin({ ...payload, demoClientId: targetClientId });
    }

    const session = {
      userId: user.id,
      type: user.type,
      clientId: user.type === "client" ? targetClientId : (payload.clientId || targetClientId || db.clients[0].id),
      createdAt: new Date().toISOString()
    };

    MBI.storage.setSession(session);
    MBI.services.audit.log("Realizou login", user.type === "mb" ? "Administração MB" : "Portal do Cliente", "Sessão iniciada", user.name);
    return session;
  }

  async function login(payload) {
    if (payload.demoMode) return localLogin(payload);
    try {
      const result = await MBI.api.request("/auth/login", {
        method: "POST",
        auth: false,
        body: payload
      });
      const session = {
        userId: result.user.id,
        type: result.user.type,
        clientId: result.session.clientId,
        token: result.session.token,
        refreshToken: result.session.refreshToken,
        remote: true,
        createdAt: result.session.createdAt,
        expiresAt: result.session.expiresAt
      };
      MBI.storage.updateDatabase((db) => {
        const existing = db.users.find((user) => user.id === result.user.id);
        if (existing) Object.assign(existing, result.user);
        else db.users.push(result.user);
      });
      MBI.storage.setSession(session);
      await MBI.sync.refreshIfPossible();
      return MBI.storage.getSession();
    } catch (error) {
      if (!error.apiUnavailable) throw error;
      return localLogin(payload);
    }
  }

  function localLogout() {
    const user = currentUser();
    if (user) MBI.services.audit.log("Saiu da plataforma", user.type === "mb" ? "Administração MB" : "Portal do Cliente", "Sessão encerrada", user.name);
    MBI.storage.clearSession();
  }

  async function logout() {
    const session = currentSession();
    if (session?.token) {
      try {
        await MBI.api.request("/auth/logout", { method: "POST" });
      } catch (error) {}
    }
    localLogout();
  }

  function normalizeCnpj(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function isValidCnpj(value) {
    const cnpj = normalizeCnpj(value);
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    const calc = (factors) => {
      const sum = factors.reduce((total, factor, index) => total + Number(cnpj[index]) * factor, 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };
    return calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[12])
      && calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[13]);
  }

  function localRegisterClient(payload) {
    const dbBefore = MBI.storage.getDatabase();
    if (!isValidCnpj(payload.cnpj)) throw new Error("CNPJ invalido. Verifique os digitos antes de cadastrar.");
    if (dbBefore.clients.some((client) => normalizeCnpj(client.cnpj) === normalizeCnpj(payload.cnpj))) throw new Error("Ja existe um cliente cadastrado com este CNPJ.");
    let created;
    MBI.storage.updateDatabase((db) => {
      const clientId = MBI.storage.nowId("cli");
      const companyId = MBI.storage.nowId("emp");
      const userId = MBI.storage.nowId("usr");
      const planId = payload.planId || "gestao";
      const client = {
        id: clientId,
        name: payload.companyName,
        tradeName: payload.tradeName || payload.companyName,
        cnpj: payload.cnpj,
        city: payload.city,
        segment: payload.segment || "A definir",
        taxRegime: "Simples Nacional",
        planId,
        maturity: "Onboarding",
        status: "Onboarding",
        owner: payload.ownerName,
        email: payload.email,
        phone: payload.phone,
        consultant: "A definir",
        analyst: "A definir",
        confidence: "Baixa",
        nextReview: null,
        lastAccess: "Primeiro acesso"
      };
      db.clients.push(client);
      db.companies.push({ id: companyId, clientId, name: payload.companyName, cnpj: payload.cnpj, city: payload.city });
      db.users.push({
        id: userId,
        type: "client",
        clientId,
        name: payload.ownerName,
        email: payload.email,
        password: payload.password,
        role: "Proprietario",
        status: "Ativo"
      });
      db.financials[clientId] = {
        revenue: 0, expenses: 0, result: 0, cash: 0, margin: 0, taxes: 0, payroll: 0, score: 0, operationalScore: 20, runway: 0, investmentCapacity: 0,
        competence: MBI.services.finance?.currentMonth?.() || new Date().toISOString().slice(0, 7),
        snapshots: {},
        dre: [], cashBridge: [], months: [],
        insights: ["Cadastro criado. A equipe MB vai orientar os proximos documentos e dados necessarios."]
      };
      created = { client, userId, planId };
    });
    MBI.services.audit.log("Criou cadastro comercial", created.client.name, "Cliente registrado pelo fluxo de contratação", created.client.owner);
    return created;
  }

  async function registerClient(payload) {
    try {
      const result = await MBI.api.request("/auth/register-client", {
        method: "POST",
        auth: false,
        body: payload
      });
      const session = {
        userId: result.user.id,
        type: result.user.type,
        clientId: result.session.clientId,
        token: result.session.token,
        refreshToken: result.session.refreshToken,
        remote: true,
        createdAt: result.session.createdAt,
        expiresAt: result.session.expiresAt
      };
      MBI.storage.setSession(session);
      await MBI.sync.refreshIfPossible();
      return { client: result.client, userId: result.user.id, planId: result.client.planId };
    } catch (error) {
      if (!error.apiUnavailable) throw error;
      return localRegisterClient(payload);
    }
  }

  async function refreshSession() {
    const current = currentSession();
    if (!current?.refreshToken) return null;
    const result = await MBI.api.request("/auth/refresh", {
      method: "POST",
      auth: false,
      skipRefresh: true,
      body: {
        refreshToken: current.refreshToken,
        clientId: current.clientId
      }
    });
    const session = {
      ...current,
      userId: result.user.id,
      type: result.user.type,
      clientId: result.session.clientId || current.clientId,
      token: result.session.token,
      refreshToken: result.session.refreshToken || current.refreshToken,
      expiresAt: result.session.expiresAt,
      remote: true
    };
    MBI.storage.setSession(session);
    MBI.storage.updateDatabase((db) => {
      const existing = db.users.find((user) => user.id === result.user.id);
      if (existing) Object.assign(existing, result.user);
      else db.users.push(result.user);
    });
    return session;
  }

  async function resetPassword(email) {
    try {
      await MBI.api.request("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { email }
      });
    } catch (error) {
      if (!error.apiUnavailable) throw error;
    }
  }

  MBI.auth = { login, logout, currentSession, currentUser, registerClient, refreshSession, resetPassword };
})();
