const { updateDatabase } = require("./store");
const { id } = require("./security");

function emptyFinancial() {
  return {
    competence: new Date().toISOString().slice(0, 7),
    snapshots: {},
    revenue: 0,
    expenses: 0,
    result: 0,
    cash: 0,
    margin: 0,
    taxes: 0,
    payroll: 0,
    score: 0,
    operationalScore: 20,
    runway: 0,
    investmentCapacity: 0,
    dre: [],
    cashBridge: [],
    months: [],
    insights: ["Cliente criado. Aguardando documentos iniciais."]
  };
}

function logAudit(db, user, action, target, result) {
  db.audit.push({
    id: id("aud"),
    at: new Date().toLocaleString("pt-BR"),
    user: user?.name || "Sistema",
    action,
    target,
    result
  });
}

function recalcFinancial(financial) {
  financial.revenue = Number(financial.revenue || 0);
  financial.expenses = Number(financial.expenses || 0);
  financial.taxes = Number(financial.taxes || 0);
  financial.payroll = Number(financial.payroll || 0);
  financial.cash = Number(financial.cash || 0);
  financial.score = Number(financial.score || 0);
  financial.result = financial.revenue - financial.expenses;
  financial.margin = financial.revenue ? Math.round((financial.result / financial.revenue) * 1000) / 10 : 0;
  return financial;
}

function createClient(db, payload) {
  const clientId = id("cli");
  const companyId = id("emp");
  const client = {
    id: clientId,
    name: payload.name || payload.companyName,
    tradeName: payload.tradeName || payload.name || payload.companyName,
    cnpj: payload.cnpj,
    city: payload.city || "",
    segment: payload.segment || "A definir",
    taxRegime: payload.taxRegime || "Simples Nacional",
    planId: payload.planId || "contabilidade",
    maturity: payload.maturity || "Onboarding",
    status: payload.status || "Onboarding",
    owner: payload.owner || payload.ownerName || "A definir",
    email: payload.email || "",
    phone: payload.phone || "",
    consultant: payload.consultant || "A definir",
    analyst: payload.analyst || "A definir",
    confidence: payload.confidence || "Baixa",
    lastAccess: "Ainda não acessou"
  };
  db.clients.push(client);
  db.companies.push({
    id: companyId,
    clientId,
    name: client.name,
    cnpj: client.cnpj,
    city: client.city
  });
  db.financials[clientId] = emptyFinancial();
  return client;
}

function canAccessClient(user, clientId) {
  return user.type === "mb" || user.clientId === clientId;
}

module.exports = {
  emptyFinancial,
  logAudit,
  recalcFinancial,
  createClient,
  canAccessClient
};
