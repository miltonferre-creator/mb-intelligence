(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function list() {
    return MBI.storage.getDatabase().clients;
  }

  function get(id) {
    return list().find((client) => client.id === id);
  }

  function current() {
    const session = MBI.auth.currentSession();
    return get(session?.clientId) || list()[0];
  }

  function setCurrentClient(clientId) {
    const session = MBI.auth.currentSession();
    if (!session) return;
    session.clientId = clientId;
    MBI.storage.setSession(session);
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

  function create(payload) {
    if (!isValidCnpj(payload.cnpj)) throw new Error("CNPJ invalido. Verifique os digitos antes de cadastrar.");
    if (list().some((client) => normalizeCnpj(client.cnpj) === normalizeCnpj(payload.cnpj))) throw new Error("Ja existe um cliente cadastrado com este CNPJ.");
    let created;
    MBI.storage.updateDatabase((db) => {
      const id = MBI.storage.nowId("cli");
      const companyId = MBI.storage.nowId("emp");
      created = {
        id,
        name: payload.name,
        tradeName: payload.tradeName || payload.name,
        cnpj: payload.cnpj,
        city: payload.city,
        segment: payload.segment,
        taxRegime: payload.taxRegime || "Simples Nacional",
        planId: payload.planId || "contabilidade",
        maturity: "Onboarding",
        status: "Onboarding",
        owner: payload.owner,
        email: payload.email,
        phone: payload.phone,
        consultant: payload.consultant || "A definir",
        analyst: payload.analyst || "A definir",
        confidence: "Baixa",
        nextReview: payload.nextReview || null,
        lastAccess: "Ainda não acessou"
      };
      db.clients.push(created);
      db.companies.push({ id: companyId, clientId: id, name: payload.name, cnpj: payload.cnpj, city: payload.city });
      db.financials[id] = {
        revenue: 0, expenses: 0, result: 0, cash: 0, margin: 0, taxes: 0, payroll: 0, score: 0, operationalScore: 20, runway: 0, investmentCapacity: 0,
        competence: MBI.services.finance?.currentMonth?.() || new Date().toISOString().slice(0, 7),
        snapshots: {},
        dre: [], cashBridge: [], months: [], insights: ["Cliente criado. Aguardando documentos iniciais."]
      };
    });
    MBI.services.audit.log("Cadastrou cliente", created.name, "Cliente criado pela Administração MB", MBI.auth.currentUser()?.name);
    return created;
  }

  function updatePlan(clientId, planId) {
    const client = MBI.storage.updateDatabase((db) => {
      const row = db.clients.find((item) => item.id === clientId);
      if (!row) return null;
      row.planId = planId;
      return row;
    });
    if (client) MBI.services.audit.log("Alterou plano do cliente", client.name, planId, MBI.auth.currentUser()?.name);
    return client;
  }

  function updateProfile(clientId, payload) {
    return MBI.storage.updateDatabase((db) => {
      const client = db.clients.find((item) => item.id === clientId);
      if (!client) return null;
      Object.assign(client, payload);
      return client;
    });
  }

  MBI.services.clients = { list, get, current, setCurrentClient, create, updatePlan, updateProfile };
})();
