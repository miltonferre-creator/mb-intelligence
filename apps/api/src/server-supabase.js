const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { loadEnv } = require("./lib/env");
const {
  getConfig,
  supabaseRequest,
  uploadDocumentObject,
  createSignedDocumentUrl,
  deleteDocumentObject
} = require("./lib/supabase-client");
const { corsHeaders, ok, created, noContent, error, readBody, parseUrl } = require("./lib/http");

loadEnv(path.resolve(__dirname, "../.env"));

const port = Number(process.env.PORT || 3333);
const webRoot = path.resolve(__dirname, "../../web");
const staticTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};
const loginAttempts = new Map();
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60_000;

function bearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local").split(",")[0].trim();
}

function checkLoginRateLimit(req, res, email) {
  const key = `${clientIp(req)}:${String(email || "").toLowerCase()}`;
  const now = Date.now();
  const current = loginAttempts.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + LOGIN_WINDOW_MS;
  }
  current.count += 1;
  loginAttempts.set(key, current);
  if (current.count <= LOGIN_LIMIT) return true;
  const waitSeconds = Math.ceil((current.resetAt - now) / 1000);
  error(res, 429, `Muitas tentativas de login. Aguarde ${waitSeconds} segundos e tente novamente.`);
  return false;
}

function clearLoginRateLimit(req, email) {
  loginAttempts.delete(`${clientIp(req)}:${String(email || "").toLowerCase()}`);
}

function sessionFromTokenData(tokenData, profile, clientId) {
  return {
    id: tokenData.user.id,
    token: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    userId: tokenData.user.id,
    type: profile.type,
    clientId: profile.type === "client" ? profile.client_id : clientId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString()
  };
}

function serveStatic(req, res, url) {
  if (req.method !== "GET") return false;
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.resolve(webRoot, requestedPath.replace(/^\/+/, ""));
  const insideWebRoot = filePath === webRoot || filePath.startsWith(`${webRoot}${path.sep}`);
  if (!insideWebRoot || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;

  res.writeHead(200, {
    "Content-Type": staticTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    ...corsHeaders()
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function isMultipart(req) {
  return String(req.headers["content-type"] || "").toLowerCase().includes("multipart/form-data");
}

function readBuffer(req, maxBytes = 25_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Arquivo muito grande. Limite atual: 25 MB."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function dispositionValue(header, key) {
  const match = String(header || "").match(new RegExp(`${key}="([^"]*)"`, "i"));
  return match ? match[1] : "";
}

async function readMultipart(req) {
  const contentType = String(req.headers["content-type"] || "");
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error("Formulario de upload invalido.");
  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const raw = (await readBuffer(req)).toString("binary");
  const fields = {};
  const files = {};

  raw.split(boundary).slice(1, -1).forEach((part) => {
    const clean = part.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const splitAt = clean.indexOf("\r\n\r\n");
    if (splitAt < 0) return;
    const headerText = clean.slice(0, splitAt);
    const bodyText = clean.slice(splitAt + 4).replace(/\r\n$/, "");
    const headers = Object.fromEntries(headerText.split("\r\n").map((line) => {
      const index = line.indexOf(":");
      return index < 0 ? [line.toLowerCase(), ""] : [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()];
    }));
    const disposition = headers["content-disposition"] || "";
    const name = dispositionValue(disposition, "name");
    const filename = dispositionValue(disposition, "filename");
    if (!name) return;
    if (filename) {
      files[name] = {
        filename,
        mimeType: headers["content-type"] || "application/octet-stream",
        buffer: Buffer.from(bodyText, "binary")
      };
      return;
    }
    fields[name] = Buffer.from(bodyText, "binary").toString("utf8");
  });

  return { fields, files };
}

function safeFileName(name) {
  return String(name || "arquivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "arquivo";
}

function extensionOf(fileName) {
  const extension = path.extname(fileName || "").replace(".", "").toLowerCase();
  return extension || "bin";
}

function dateToCompetence(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}$/.test(text)) return `${text}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brazilian) return `${brazilian[3]}-${brazilian[2]}-${brazilian[1]}`;
  return new Date().toISOString().slice(0, 10);
}

function maybeCompetence(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  return dateToCompetence(text);
}

function currentCompetence() {
  return new Date().toISOString().slice(0, 7) + "-01";
}

function competenceFolder(value) {
  return dateToCompetence(value).slice(0, 7);
}

function normalizeCnpj(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidCnpj(value) {
  const cnpj = normalizeCnpj(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base, factors) => {
    const sum = factors.reduce((total, factor, index) => total + Number(base[index]) * factor, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const digit1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
}

function fileNameFromStoragePath(storagePath) {
  const last = decodeURIComponent(String(storagePath || "").split("/").pop() || "");
  return last.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

function hasExtension(fileName) {
  return /\.[a-z0-9]{2,8}$/i.test(String(fileName || ""));
}

function documentToApi(row) {
  const storageFileName = fileNameFromStoragePath(row.storage_path);
  const fileName = hasExtension(row.file_name) ? row.file_name : (storageFileName || row.file_name);
  const description = row.description || row.document_type || fileName;
  return {
    id: row.id,
    clientId: row.client_id,
    name: description,
    description,
    fileName,
    originalFileName: fileName,
    category: row.category,
    type: row.document_type,
    status: row.status,
    competence: row.competence || null,
    dueDate: row.due_date || null,
    due: row.due_date || row.competence || "Sem prazo",
    visibility: row.visibility,
    storagePath: row.storage_path,
    size: Number(row.file_size || 0),
    mimeType: row.mime_type
  };
}

function taskToApi(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    owner: row.owner_label || row.owner_id || "MB",
    due: row.due_date || "Sem prazo",
    status: row.status,
    origin: row.origin
  };
}

function insightToApi(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    text: row.content,
    confidence: row.confidence,
    nextReview: row.next_review_date || null,
    owner: row.source_data?.reviewedBy || row.source_data?.createdBy || (row.reviewed_by ? "Operador MB" : "MB"),
    status: row.status,
    reviewNotes: row.review_notes || row.source_data?.reviewNotes || ""
  };
}

async function authUserFromToken(accessToken) {
  const config = getConfig();
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  const user = await response.json();
  if (!response.ok) throw new Error(user?.message || "Sessão inválida.");
  return user;
}

async function rest(path, options = {}) {
  return supabaseRequest(`/rest/v1${path}`, {
    ...options,
    headers: {
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    }
  });
}

async function authContext(req, res) {
  try {
    const accessToken = bearer(req);
    if (!accessToken) {
      error(res, 401, "Sessão inválida ou expirada.");
      return null;
    }
    const authUser = await authUserFromToken(accessToken);
    const profiles = await rest(`/user_profiles?id=eq.${authUser.id}&select=*`);
    const profile = profiles[0];
    if (!profile || profile.status !== "Ativo") {
      error(res, 403, "Perfil não autorizado.");
      return null;
    }
    return { accessToken, authUser, profile };
  } catch (err) {
    error(res, 401, "Sessão inválida ou expirada.");
    return null;
  }
}

async function requireMb(req, res) {
  const ctx = await authContext(req, res);
  if (!ctx) return null;
  if (ctx.profile.type !== "mb") {
    error(res, 403, "Acesso restrito à equipe MB.");
    return null;
  }
  return ctx;
}

function canAccessClient(profile, clientId) {
  return profile.type === "mb" || profile.client_id === clientId;
}

function clientToApi(row) {
  return {
    id: row.id,
    name: row.name,
    tradeName: row.trade_name,
    cnpj: row.cnpj,
    city: row.city,
    segment: row.segment,
    taxRegime: row.tax_regime,
    planId: row.plan_id,
    maturity: row.maturity,
    status: row.status,
    owner: row.owner_name,
    email: row.email,
    phone: row.phone,
    consultant: row.consultant_name,
    analyst: row.analyst_name,
    confidence: row.confidence,
    nextReview: row.next_review_date || null,
    lastAccess: row.last_access_at || "Ainda não acessou"
  };
}

function clientToDb(body, partial = false) {
  const payload = {
    name: body.name || body.companyName || (partial ? undefined : ""),
    trade_name: body.tradeName || body.name || body.companyName || (partial ? undefined : ""),
    cnpj: body.cnpj,
    city: body.city,
    segment: body.segment || (partial ? undefined : "A definir"),
    tax_regime: body.taxRegime || (partial ? undefined : "Simples Nacional"),
    plan_id: body.planId || (partial ? undefined : "contabilidade"),
    maturity: body.maturity || (partial ? undefined : "Onboarding"),
    status: body.status || (partial ? undefined : "Onboarding"),
    owner_name: body.owner || body.ownerName || (partial ? undefined : "A definir"),
    email: body.email || (partial ? undefined : ""),
    phone: body.phone || (partial ? undefined : ""),
    consultant_name: body.consultant || (partial ? undefined : "A definir"),
    analyst_name: body.analyst || (partial ? undefined : "A definir"),
    confidence: body.confidence || (partial ? undefined : "Baixa")
  };
  if (body.nextReview || body.nextReviewDate) payload.next_review_date = body.nextReview || body.nextReviewDate;
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
  return payload;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function scoreHigherIsBetter(value, red, green) {
  if (value >= green) return 100;
  if (value <= red) return 0;
  return ((value - red) / (green - red)) * 100;
}

function scoreLowerIsBetter(value, green, red) {
  if (value <= green) return 100;
  if (value >= red) return 0;
  return ((red - value) / (red - green)) * 100;
}

function scoreStatus(score) {
  if (score >= 75) return "Saudavel";
  if (score >= 50) return "Atencao";
  return "Risco";
}

function calculateFinancialScore(row) {
  const revenue = Number(row?.revenue || 0);
  const expenses = Number(row?.expenses || 0);
  const cash = Number(row?.cash || 0);
  const taxes = Number(row?.taxes || 0);
  const payroll = Number(row?.payroll || 0);
  const result = Number(row?.result ?? (revenue - expenses));
  const margin = revenue ? (result / revenue) * 100 : 0;
  const runway = Number(row?.runway_days || (expenses ? cash / (expenses / 30) : 0));
  const operatingExpenses = Math.max(expenses - payroll - taxes, 0);
  const efficiencyRatio = revenue ? (operatingExpenses / revenue) * 100 : 100;
  const payrollRatio = revenue ? (payroll / revenue) * 100 : 100;
  const taxRatio = revenue ? (taxes / revenue) * 100 : 100;
  const workingCapitalDays = Number(row?.working_capital_days || 45);
  const dimensions = [
    ["liquidez", "Liquidez", 25, `${Math.round(runway)} dias`, scoreHigherIsBetter(runway, 15, 45), "Caixa dividido pelo consumo medio diario."],
    ["rentabilidade", "Rentabilidade", 25, `${margin.toFixed(1).replace(".", ",")}%`, scoreHigherIsBetter(margin, 8, 20), "Margem liquida sobre a receita."],
    ["eficiencia", "Eficiencia", 20, `${efficiencyRatio.toFixed(1).replace(".", ",")}%`, scoreLowerIsBetter(efficiencyRatio, 15, 30), "Despesas operacionais estimadas sobre faturamento."],
    ["folha", "Folha", 15, `${payrollRatio.toFixed(1).replace(".", ",")}%`, scoreLowerIsBetter(payrollRatio, 22, 40), "Folha e encargos sobre faturamento."],
    ["impostos", "Impostos", 10, `${taxRatio.toFixed(1).replace(".", ",")}%`, scoreLowerIsBetter(taxRatio, 12, 20), "Carga tributaria efetiva sobre faturamento."],
    ["capital_giro", "Capital de giro", 5, `${Math.round(workingCapitalDays)} dias`, scoreLowerIsBetter(workingCapitalDays, 30, 90), row?.working_capital_days ? "NCG informada pela MB." : "NCG ainda nao informada; nota neutra aplicada."]
  ].map(([key, label, weight, value, rawScore, detail]) => {
    const score = clamp(rawScore);
    return { key, label, weight, value, score, status: scoreStatus(score), detail };
  });
  const baseScore = dimensions.reduce((sum, item) => sum + item.score * (item.weight / 100), 0);
  let dataPenalty = 0;
  if (!revenue) dataPenalty += 35;
  if (revenue && !expenses) dataPenalty += 25;
  if (!cash) dataPenalty += 12;
  if (!row?.runway_days && expenses) dataPenalty += 8;
  if (!row?.working_capital_days) dataPenalty += 5;
  return {
    total: Math.round(clamp(baseScore - dataPenalty)),
    dimensions
  };
}

function formatCompetenceMonth(value) {
  const date = new Date(`${String(value || "").slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Competencia";
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" }).replace(".", "");
}

function historyToMonths(historyRows) {
  return (historyRows || [])
    .filter((item) => Number(item.revenue || 0) || Number(item.expenses || 0))
    .sort((a, b) => String(a.competence).localeCompare(String(b.competence)))
    .slice(-12)
    .map((item) => [formatCompetenceMonth(item.competence), Number(item.revenue || 0) / 1000, Number(item.expenses || 0) / 1000]);
}

function linePercent(amount, revenue) {
  if (!revenue) return "0%";
  return `${((Number(amount || 0) / revenue) * 100).toFixed(1).replace(".", ",")}%`;
}

function buildProfessionalDre(row, dreLines) {
  const revenue = Number(row?.revenue || 0);
  const expenses = Number(row?.expenses || 0);
  const taxes = Number(row?.taxes || 0);
  const payroll = Number(row?.payroll || 0);
  const result = Number(row?.result ?? (revenue - expenses));
  const byName = (needle) => (dreLines || []).find((line) => String(line.account || "").toLowerCase().includes(needle));
  const amountByName = (needle) => Number(byName(needle)?.amount || 0);
  const directCosts = amountByName("custo");
  const salesExpenses = amountByName("vendas") || amountByName("marketing");
  const financialExpenses = amountByName("financeiras");
  const adminLine = amountByName("administr");
  const inferredAdmin = -(Math.max(expenses - Math.abs(directCosts) - taxes - payroll - Math.abs(salesExpenses) - Math.abs(financialExpenses), 0));
  const adminExpenses = adminLine || inferredAdmin;
  const payrollExpense = payroll ? -payroll : 0;
  const netRevenue = revenue - taxes;
  const grossProfit = netRevenue + directCosts;
  const ebitda = grossProfit + adminExpenses + payrollExpense + salesExpenses;
  const ebit = ebitda;
  const lair = ebit + financialExpenses;

  return [
    { label: "BLOCO 1 - RECEITA", type: "section" },
    { label: "Receita bruta de vendas / servicos", amount: revenue, percent: linePercent(revenue, revenue), type: "normal", variation: "Validado MB", ytd: "Competencia atual" },
    { label: "(-) Devolucoes e abatimentos", amount: 0, percent: "0%", type: "normal", variation: "Sem movimento informado", ytd: "-" },
    { label: "(-) Impostos sobre receita", amount: -taxes, percent: linePercent(-taxes, revenue), type: "normal", variation: "DAS / fiscal", ytd: "-" },
    { label: "= Receita liquida", amount: netRevenue, percent: linePercent(netRevenue, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
    { label: "BLOCO 2 - CUSTO", type: "section" },
    { label: "(-) CMV / custo dos servicos prestados", amount: directCosts, percent: linePercent(directCosts, revenue), type: "normal", variation: "Validado MB", ytd: "-" },
    { label: "= Lucro bruto", amount: grossProfit, percent: linePercent(grossProfit, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
    { label: "BLOCO 3 - DESPESAS OPERACIONAIS", type: "section" },
    { label: "(-) Despesas administrativas", amount: adminExpenses, percent: linePercent(adminExpenses, revenue), type: "normal", variation: "Calculado por diferenca validada", ytd: "-" },
    { label: "(-) Despesas com pessoal / folha", amount: payrollExpense, percent: linePercent(payrollExpense, revenue), type: "normal", variation: "Folha informada", ytd: "-" },
    { label: "(-) Despesas com vendas / marketing", amount: salesExpenses, percent: linePercent(salesExpenses, revenue), type: "normal", variation: salesExpenses ? "Informado MB" : "Sem movimento informado", ytd: "-" },
    { label: "(-) Depreciacao e amortizacao", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
    { label: "= EBITDA", amount: ebitda, percent: linePercent(ebitda, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
    { label: "= EBIT", amount: ebit, percent: linePercent(ebit, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
    { label: "BLOCO 4 - RESULTADO FINANCEIRO", type: "section" },
    { label: "(+) Receitas financeiras", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
    { label: "(-) Despesas financeiras", amount: financialExpenses, percent: linePercent(financialExpenses, revenue), type: "normal", variation: financialExpenses ? "Informado MB" : "Nao informada", ytd: "-" },
    { label: "= Resultado antes do IR / LAIR", amount: lair, percent: linePercent(lair, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
    { label: "BLOCO 5 - IMPOSTOS E LUCRO", type: "section" },
    { label: "(-) IR / CSLL", amount: 0, percent: "0%", type: "normal", variation: "Nao aplicavel/informado", ytd: "-" },
    { label: "= Lucro liquido gerencial", amount: result, percent: linePercent(result, revenue), type: "total", variation: "Resultado final", ytd: "-" }
  ];
}

function buildCashFlowReport(row, cashRow) {
  const snapshotRevenue = Number(row?.revenue || 0);
  const snapshotExpenses = Number(row?.expenses || 0);
  const snapshotTaxes = Number(row?.taxes || 0);
  const snapshotCash = Number(row?.cash || 0);
  if (!cashRow && !snapshotRevenue && !snapshotExpenses && !snapshotCash) return [];
  const opening = cashRow ? Number(cashRow.opening_balance || 0) : Math.max(snapshotCash - (snapshotRevenue - snapshotExpenses), 0);
  const receipts = cashRow ? Number(cashRow.receipts || 0) : snapshotRevenue;
  const payments = cashRow ? Number(cashRow.payments || 0) : Math.max(snapshotExpenses - snapshotTaxes, 0);
  const taxes = cashRow ? Number(cashRow.taxes || 0) : snapshotTaxes;
  const closing = cashRow ? Number(cashRow.closing_balance || 0) : snapshotCash;
  const fco = receipts - payments - taxes;
  const variation = closing - opening;
  const expenses = Number(row?.expenses || 0);
  const cash = Number(row?.cash || closing || 0);
  const runway = Number(row?.runway_days || (expenses ? cash / (expenses / 30) : 0));

  return [
    { label: "ATIVIDADES OPERACIONAIS (FCO)", type: "section" },
    { label: "(+) Recebimentos de clientes", amount: receipts, reference: cashRow ? "Entradas operacionais" : "Estimado por faturamento informado", type: "positive" },
    { label: "(-) Pagamentos a fornecedores e despesas operacionais", amount: -payments, reference: cashRow ? "Saidas operacionais consolidadas" : "Estimado por despesas informadas", type: "negative" },
    { label: "(-) Pagamentos de impostos", amount: -taxes, reference: "DAS, FGTS, INSS e tributos", type: "negative" },
    { label: "= Caixa liquido das atividades operacionais", amount: fco, reference: "FCO", type: "subtotal" },
    { label: "ATIVIDADES DE INVESTIMENTO (FCI)", type: "section" },
    { label: "Investimentos e imobilizado", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
    { label: "= Caixa liquido das atividades de investimento", amount: 0, reference: "FCI", type: "subtotal" },
    { label: "ATIVIDADES DE FINANCIAMENTO (FCF)", type: "section" },
    { label: "Emprestimos, amortizacoes e distribuicoes", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
    { label: "= Caixa liquido das atividades de financiamento", amount: 0, reference: "FCF", type: "subtotal" },
    { label: "CONSOLIDADO", type: "section" },
    { label: "Saldo inicial de caixa", amount: opening, reference: "Inicio do periodo", type: "base" },
    { label: "Variacao liquida de caixa", amount: variation, reference: "FCO + FCI + FCF", type: "subtotal" },
    { label: "Saldo final de caixa", amount: closing, reference: cashRow ? "Conferencia com saldo bancario" : "Caixa informado pela MB", type: "total" },
    { label: "Folego de caixa", amount: runway, reference: "Dias de cobertura estimada", type: "indicator" }
  ];
}

function financialInsights(row, cashRow, score) {
  const revenue = Number(row?.revenue || 0);
  const expenses = Number(row?.expenses || 0);
  const result = Number(row?.result ?? (revenue - expenses));
  const margin = revenue ? (result / revenue) * 100 : 0;
  const runway = Number(row?.runway_days || 0);
  const insights = [];

  if (!revenue) return ["Dados financeiros insuficientes para uma analise gerencial completa."];
  if (expenses > revenue) insights.push("As despesas superam o faturamento informado; a empresa exige revisao imediata de caixa e custos.");
  else insights.push(`A empresa apresentou resultado gerencial de ${Math.round(margin)}% sobre o faturamento informado.`);
  if (runway) insights.push(runway >= 45 ? "O caixa informado cobre a reserva minima de 45 dias." : "O caixa informado esta abaixo da reserva de seguranca de 45 dias recomendada pela MB.");
  insights.push(`O MB Financial Score calculado pela metodologia atual ficou em ${score.total}/100 (${scoreStatus(score.total)}).`);
  return insights;
}

function financeToApi(row, dreLines, cashRow, historyRows) {
  if (!row) return null;
  const score = calculateFinancialScore(row);
  const competences = (historyRows || [row])
    .filter(Boolean)
    .map((item) => ({ value: String(item.competence || "").slice(0, 7), label: formatCompetenceMonth(item.competence) }))
    .filter((item, index, list) => item.value && list.findIndex((other) => other.value === item.value) === index)
    .sort((a, b) => b.value.localeCompare(a.value));
  return {
    competence: String(row.competence || "").slice(0, 7),
    competenceDate: row.competence,
    competenceLabel: formatCompetenceMonth(row.competence),
    competences,
    revenue: Number(row.revenue || 0),
    expenses: Number(row.expenses || 0),
    result: Number(row.result || 0),
    cash: Number(row.cash || 0),
    margin: Number(row.margin || 0),
    taxes: Number(row.taxes || 0),
    payroll: Number(row.payroll || 0),
    score: score.total,
    scoreBreakdown: score.dimensions,
    operationalScore: Number(row.operational_score || 0),
    runway: Number(row.runway_days || 0),
    investmentCapacity: Number(row.investment_capacity || 0),
    marginTarget: Number(row.margin_target || 20),
    workingCapitalDays: Number(row.working_capital_days || 0),
    dre: buildProfessionalDre(row, dreLines),
    cashBridge: buildCashFlowReport(row, cashRow),
    months: historyToMonths(historyRows || [row]),
    periods: (historyRows || [row])
      .filter(Boolean)
      .sort((a, b) => String(b.competence).localeCompare(String(a.competence)))
      .map((item) => ({
        competence: String(item.competence || "").slice(0, 7),
        label: formatCompetenceMonth(item.competence),
        revenue: Number(item.revenue || 0),
        expenses: Number(item.expenses || 0),
        result: Number(item.result || 0),
        cash: Number(item.cash || 0),
        margin: Number(item.margin || 0),
        confidence: item.confidence || "Media",
        status: item.status || "Publicado"
      })),
    insights: financialInsights(row, cashRow, score)
  };
}

async function logAudit(profile, action, target, result) {
  await rest("/audit_logs", {
    method: "POST",
    body: {
      user_id: profile?.id || null,
      user_name: profile?.name || "Sistema",
      action,
      target,
      result
    }
  });
}

async function validateClientCnpj(body, existingClientId = null) {
  if (!body.cnpj || !isValidCnpj(body.cnpj)) {
    throw Object.assign(new Error("CNPJ invalido. Verifique os digitos e tente novamente."), { statusCode: 400 });
  }
  const rows = await rest(`/clients?cnpj=eq.${encodeURIComponent(body.cnpj)}&select=id,cnpj`);
  const duplicated = rows.find((row) => String(row.id) !== String(existingClientId || ""));
  if (duplicated) {
    throw Object.assign(new Error("Ja existe um cliente cadastrado com este CNPJ."), { statusCode: 409 });
  }
}

async function handleAuth(req, res, segments) {
  const config = getConfig();

  if (req.method === "POST" && segments[1] === "login") {
    const body = await readBody(req);
    if (!checkLoginRateLimit(req, res, body.email)) return;
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: body.email, password: body.password })
    });
    const data = await response.json();
    if (!response.ok) return error(res, 401, data?.message || "E-mail ou senha inválidos.");
    const profiles = await rest(`/user_profiles?id=eq.${data.user.id}&select=*`);
    const profile = profiles[0];
    if (!profile) return error(res, 403, "Perfil não encontrado.");
    if (profile.status !== "Ativo") return error(res, 403, "Usuário desativado. Fale com a administração MB.");
    const session = sessionFromTokenData(data, profile, body.clientId);
    clearLoginRateLimit(req, body.email);
    if (profile.type === "client" && profile.client_id) {
      await rest(`/clients?id=eq.${profile.client_id}`, { method: "PATCH", body: { last_access_at: new Date().toISOString() } });
    }
    await logAudit(profile, "Realizou login", profile.type === "mb" ? "Administração MB" : "Portal do Cliente", "Sessão iniciada");
    return ok(res, { session, user: profileToApi(profile) });
  }

  if (req.method === "POST" && segments[1] === "logout") return noContent(res);

  if (req.method === "POST" && segments[1] === "change-password") {
    const ctx = await authContext(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    if (!body.currentPassword || !body.newPassword) return error(res, 400, "Informe a senha atual e a nova senha.");
    if (String(body.newPassword).length < 6) return error(res, 400, "A nova senha deve ter pelo menos 6 caracteres.");
    if (body.newPassword !== body.confirmPassword) return error(res, 400, "A confirmacao da senha nao confere.");
    const check = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email: ctx.profile.email, password: body.currentPassword })
    });
    if (!check.ok) return error(res, 400, "Senha atual invalida.");
    const update = await fetch(`${config.url}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: config.anonKey, Authorization: `Bearer ${bearer(req)}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: body.newPassword })
    });
    const updateBody = await update.json().catch(() => ({}));
    if (!update.ok) {
      try {
        await supabaseRequest(`/auth/v1/admin/users/${ctx.authUser.id}`, { method: "PUT", body: { password: body.newPassword } });
      } catch (err) {
        return error(res, 400, updateBody?.message || err.message || "Nao foi possivel alterar a senha.");
      }
    }
    await logAudit(ctx.profile, "Alterou senha", ctx.profile.email, "Senha atualizada pelo portal");
    return ok(res, { ok: true });
  }

  if (req.method === "POST" && segments[1] === "refresh") {
    const body = await readBody(req);
    if (!body.refreshToken) return error(res, 400, "Refresh token ausente.");
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refresh_token: body.refreshToken })
    });
    const data = await response.json();
    if (!response.ok) return error(res, 401, data?.message || "Sessao expirada. Entre novamente.");
    const profiles = await rest(`/user_profiles?id=eq.${data.user.id}&select=*`);
    const profile = profiles[0];
    if (!profile) return error(res, 403, "Perfil nao encontrado.");
    return ok(res, { session: sessionFromTokenData(data, profile, body.clientId), user: profileToApi(profile) });
  }

  if (req.method === "GET" && segments[1] === "me") {
    const ctx = await authContext(req, res);
    if (!ctx) return;
    const session = {
      id: ctx.authUser.id,
      token: bearer(req),
      userId: ctx.authUser.id,
      type: ctx.profile.type,
      clientId: ctx.profile.type === "client" ? ctx.profile.client_id : null
    };
    return ok(res, { user: profileToApi(ctx.profile), session, client: null });
  }

  if (req.method === "POST" && segments[1] === "register-client") {
    const body = await readBody(req);
    await validateClientCnpj(body);
    const clientId = crypto.randomUUID();
    const companyId = crypto.randomUUID();
    const clientRows = await rest("/clients", { method: "POST", body: [{ id: clientId, ...clientToDb(body) }] });
    await rest("/companies", {
      method: "POST",
      body: [{ id: companyId, client_id: clientId, name: body.companyName, trade_name: body.tradeName || body.companyName, cnpj: body.cnpj, city: body.city }]
    });
    const createdUser = await supabaseRequest("/auth/v1/admin/users", {
      method: "POST",
      body: {
        email: body.email,
        password: body.password || "123456",
        email_confirm: true,
        user_metadata: { name: body.ownerName, type: "client", role: "Proprietario" }
      }
    });
    const profileRows = await rest("/user_profiles", {
      method: "POST",
      body: [{ id: createdUser.id, client_id: clientId, type: "client", name: body.ownerName, email: body.email, role: "Proprietario", status: "Ativo" }]
    });
    await rest("/financial_snapshots", {
      method: "POST",
      body: [{ client_id: clientId, company_id: companyId, competence: currentCompetence(), status: "Rascunho" }]
    });
    const tokenResponse = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: body.email, password: body.password || "123456" })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData?.message || "Não foi possível iniciar a sessão do cliente.");
    const session = {
      id: tokenData.user.id,
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      userId: tokenData.user.id,
      type: "client",
      clientId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString()
    };
    return created(res, { client: clientToApi(clientRows[0]), user: profileToApi(profileRows[0]), session });
  }

  return error(res, 404, "Rota de autenticação não encontrada.");
}

function profileToApi(row) {
  return {
    id: row.id,
    type: row.type,
    clientId: row.client_id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status
  };
}

async function handlePlans(req, res, segments) {
  if (req.method === "GET" && segments.length === 1) return ok(res, { data: await rest("/plans?select=*") });
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  if (req.method === "PATCH" && segments[1]) {
    const body = await readBody(req);
    const rows = await rest(`/plans?id=eq.${segments[1]}`, { method: "PATCH", body });
    return ok(res, { data: rows[0] });
  }
  return error(res, 404, "Rota de planos não encontrada.");
}

async function handleClients(req, res, segments) {
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  if (req.method === "GET" && segments.length === 1) {
    const query = ctx.profile.type === "mb" ? "/clients?select=*" : `/clients?id=eq.${ctx.profile.client_id}&select=*`;
    const rows = await rest(query);
    return ok(res, { data: rows.map(clientToApi) });
  }
  if (req.method === "GET" && segments[1]) {
    if (ctx.profile.type !== "mb" && String(ctx.profile.client_id) !== String(segments[1])) return error(res, 403, "Cliente fora do escopo do usuÃ¡rio.");
    const rows = await rest(`/clients?id=eq.${segments[1]}&select=*&limit=1`);
    if (!rows[0]) return error(res, 404, "Cliente nÃ£o encontrado.");
    return ok(res, { data: clientToApi(rows[0]) });
  }
  if (req.method === "POST" && segments.length === 1) {
    if (ctx.profile.type !== "mb") return error(res, 403, "Acesso restrito à equipe MB.");
    const body = await readBody(req);
    await validateClientCnpj(body);
    const clientId = crypto.randomUUID();
    const companyId = crypto.randomUUID();
    const rows = await rest("/clients", { method: "POST", body: [{ id: clientId, ...clientToDb(body) }] });
    await rest("/companies", { method: "POST", body: [{ id: companyId, client_id: clientId, name: body.name, trade_name: body.tradeName || body.name, cnpj: body.cnpj, city: body.city }] });
    await rest("/financial_snapshots", { method: "POST", body: [{ client_id: clientId, company_id: companyId, competence: currentCompetence(), status: "Rascunho" }] });
    await logAudit(ctx.profile, "Cadastrou cliente", rows[0].name, "Cliente criado pela Administração MB");
    return created(res, { data: clientToApi(rows[0]) });
  }
  if (req.method === "PATCH" && segments[1]) {
    if (ctx.profile.type !== "mb") return error(res, 403, "Acesso restrito à equipe MB.");
    const body = await readBody(req);
    if (body.cnpj) await validateClientCnpj(body, segments[1]);
    const rows = await rest(`/clients?id=eq.${segments[1]}`, { method: "PATCH", body: clientToDb(body, true) });
    return ok(res, { data: clientToApi(rows[0]) });
  }
  return error(res, 404, "Rota de clientes não encontrada.");
}

async function listClientScoped(req, res, table, mapper, select = "*") {
  const ctx = await authContext(req, res);
  if (!ctx) return;
  const { url } = parseUrl(req);
  const clientId = url.searchParams.get("clientId") || (ctx.profile.type === "client" ? ctx.profile.client_id : null);
  if (clientId && !canAccessClient(ctx.profile, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
  const query = clientId ? `/${table}?client_id=eq.${clientId}&select=${select}` : `/${table}?select=${select}`;
  const rows = await rest(query);
  return ok(res, { data: rows.map(mapper) });
}

async function handleDocuments(req, res, segments) {
  if (req.method === "GET" && segments[1] && segments[2] === "download") {
    const ctx = await authContext(req, res);
    if (!ctx) return;
    const rows = await rest(`/documents?id=eq.${segments[1]}&select=*`);
    const document = rows[0];
    if (!document) return error(res, 404, "Documento não encontrado.");
    if (!canAccessClient(ctx.profile, document.client_id)) return error(res, 403, "Documento fora do escopo do usuário.");
    if (ctx.profile.type === "client" && document.visibility !== "Cliente") return error(res, 403, "Documento restrito à equipe MB.");
    if (!document.storage_path) return error(res, 404, "Arquivo fisico ainda nao foi armazenado para este documento.");
    const signed = await createSignedDocumentUrl(document.storage_path, 300);
    const signedUrl = signed?.signedURL || signed?.signedUrl || signed?.signed_url;
    const url = signedUrl?.startsWith("/") ? `${getConfig().url}${signedUrl}` : signedUrl;
    if (!url) return error(res, 500, "Nao foi possivel gerar o link de download do Storage.");
    const downloadFileName = hasExtension(document.file_name) ? document.file_name : (fileNameFromStoragePath(document.storage_path) || document.file_name);
    await logAudit(ctx.profile, "Gerou link de download", downloadFileName, "URL assinada por 5 minutos");
    return ok(res, { url, fileName: downloadFileName, expiresIn: 300 });
  }

  if (req.method === "DELETE" && segments[1]) {
    const ctx = await requireMb(req, res);
    if (!ctx) return;
    const rows = await rest(`/documents?id=eq.${segments[1]}&select=*`);
    const document = rows[0];
    if (!document) return error(res, 404, "Documento nao encontrado.");
    if (!canAccessClient(ctx.profile, document.client_id)) return error(res, 403, "Documento fora do escopo do usuario.");
    if (document.storage_path) {
      try {
        await deleteDocumentObject(document.storage_path);
      } catch (err) {
        // O metadado deve poder ser removido mesmo se o arquivo ja nao existir no Storage.
      }
    }
    await rest(`/documents?id=eq.${segments[1]}`, { method: "DELETE", prefer: "return=minimal" });
    await logAudit(ctx.profile, "Excluiu documento", document.file_name, "Removido do portal e do Storage quando existente");
    return ok(res, { ok: true });
  }

  if (req.method === "GET") {
    const ctx = await authContext(req, res);
    if (!ctx) return;
    const { url } = parseUrl(req);
    const clientId = url.searchParams.get("clientId") || (ctx.profile.type === "client" ? ctx.profile.client_id : null);
    if (clientId && !canAccessClient(ctx.profile, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
    let query = clientId ? `/documents?client_id=eq.${clientId}&select=*&order=created_at.desc` : "/documents?select=*&order=created_at.desc";
    if (ctx.profile.type === "client") query += "&visibility=eq.Cliente";
    const rows = await rest(query);
    return ok(res, { data: rows.map(documentToApi) });
  }
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  const multipart = isMultipart(req) ? await readMultipart(req) : null;
  const body = multipart?.fields || await readBody(req);
  const file = multipart?.files?.file || null;
  const originalFileName = file?.filename || body.fileName || body.name || "Documento MB.pdf";
  const description = body.name || body.description || originalFileName;
  const category = body.category || "Financeiro";
  const competence = dateToCompetence(body.competence || body.due);
  const dueDate = body.dueDate ? dateToCompetence(body.dueDate) : null;
  const storagePath = file
    ? `client/${body.clientId}/documents/${competenceFolder(competence)}/${safeFileName(category)}/${crypto.randomUUID()}-${safeFileName(file.filename)}`
    : body.storagePath || `client/${body.clientId}/manual/${crypto.randomUUID()}-${safeFileName(originalFileName)}`;

  if (file) await uploadDocumentObject(storagePath, file.buffer, file.mimeType);

  const documentPayload = {
      client_id: body.clientId,
      category,
      document_type: description || body.type || body.documentType || category,
      file_name: originalFileName,
      file_extension: extensionOf(originalFileName),
      mime_type: file?.mimeType || body.mimeType || "application/octet-stream",
      file_size: file?.buffer?.length || 0,
      competence,
      status: body.status || "Disponivel",
      visibility: body.visibility || "Cliente",
      due_date: dueDate,
      uploaded_by: ctx.profile.id,
      storage_bucket: getConfig().documentsBucket,
      storage_path: storagePath
    };
  let rows;
  try {
    rows = await rest("/documents", { method: "POST", body: [documentPayload] });
  } catch (err) {
    if (!String(err.message || "").includes("due_date")) throw err;
    delete documentPayload.due_date;
    rows = await rest("/documents", { method: "POST", body: [documentPayload] });
  }
  await logAudit(ctx.profile, "Publicou documento", originalFileName, file ? "Arquivo salvo no Supabase Storage" : "Documento registrado sem arquivo anexado");
  return created(res, { data: documentToApi(rows[0]) });
}

async function handleImports(req, res) {
  if (req.method === "GET") {
    return listClientScoped(req, res, "import_jobs", (row) => ({
      id: row.id, clientId: row.client_id, fileName: row.file_name, type: row.source_type, status: row.status, owner: row.owner_id || "MB", result: row.result
    }));
  }
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  const multipart = isMultipart(req) ? await readMultipart(req) : null;
  const body = multipart?.fields || await readBody(req);
  const file = multipart?.files?.file || null;
  if (!canAccessClient(ctx.profile, body.clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
  const fileName = body.fileName || file?.filename || "arquivo-importacao";
  let documentId = null;

  if (file) {
    const competence = dateToCompetence(body.competence || new Date().toISOString().slice(0, 10));
    const storagePath = `client/${body.clientId}/imports/${competenceFolder(competence)}/${safeFileName(body.type || "Arquivo")}/${crypto.randomUUID()}-${safeFileName(file.filename)}`;
    await uploadDocumentObject(storagePath, file.buffer, file.mimeType);
    const documents = await rest("/documents", {
      method: "POST",
      body: [{
        client_id: body.clientId,
        competence,
        category: body.category || "Financeiro",
        document_type: body.type || "Importacao",
        file_name: fileName,
        file_extension: extensionOf(file.filename),
        mime_type: file.mimeType,
        file_size: file.buffer.length,
        storage_bucket: getConfig().documentsBucket,
        storage_path: storagePath,
        status: "Aguardando revisao",
        visibility: ctx.profile.type === "mb" ? "Somente MB" : "Cliente",
        uploaded_by: ctx.profile.id
      }]
    });
    documentId = documents[0]?.id || null;
  }

  const rows = await rest("/import_jobs", {
    method: "POST",
    body: [{
      client_id: body.clientId,
      document_id: documentId,
      file_name: fileName,
      source_type: body.type,
      status: body.status || "Aguardando validação MB",
      owner_id: ctx.profile.id,
      result: body.result || (file ? "Arquivo recebido no Storage. Aguardando processamento." : "Aguardando processamento")
    }]
  });
  await logAudit(ctx.profile, "Registrou importacao", fileName, file ? "Arquivo salvo no Supabase Storage" : "Importacao registrada sem arquivo anexado");
  return created(res, { data: rows[0] });
}

async function saveFinancialReportsFromForm(profile, clientId, competence, body) {
  const hasDreFields = ["directCosts", "adminExpenses", "salesExpenses", "financialExpenses"].some((key) => body[key] !== undefined);
  const hasCashFields = ["openingBalance", "receipts", "payments", "cashTaxes", "closingBalance"].some((key) => body[key] !== undefined);

  if (hasDreFields) {
    const existingReports = await rest(`/dre_reports?client_id=eq.${clientId}&competence=eq.${competence}&select=id&limit=1`);
    const reportRows = existingReports[0]
      ? await rest(`/dre_reports?id=eq.${existingReports[0].id}`, { method: "PATCH", body: { status: "Validado MB", approved_by: profile.id, approved_at: new Date().toISOString(), published_at: new Date().toISOString() } })
      : await rest("/dre_reports", { method: "POST", body: [{ client_id: clientId, competence, status: "Validado MB", approved_by: profile.id, approved_at: new Date().toISOString(), published_at: new Date().toISOString() }] });
    const reportId = reportRows[0]?.id || existingReports[0]?.id;
    if (reportId) {
      await rest(`/dre_report_lines?report_id=eq.${reportId}`, { method: "DELETE", prefer: "return=minimal" });
      const lines = [
        ["CMV / custo dos servicos prestados", -Math.abs(Number(body.directCosts || 0))],
        ["Despesas administrativas", -Math.abs(Number(body.adminExpenses || 0))],
        ["Despesas com pessoal / folha", -Math.abs(Number(body.payroll || 0))],
        ["Despesas com vendas / marketing", -Math.abs(Number(body.salesExpenses || 0))],
        ["Despesas financeiras", -Math.abs(Number(body.financialExpenses || 0))]
      ].map(([account, amount], index) => ({ report_id: reportId, sort_order: index + 1, account, amount, line_type: "normal" }));
      await rest("/dre_report_lines", { method: "POST", body: lines });
    }
  }

  if (hasCashFields) {
    const cashPayload = {
      opening_balance: Number(body.openingBalance || 0),
      receipts: Number(body.receipts || body.revenue || 0),
      payments: Number(body.payments || Math.max(Number(body.expenses || 0) - Number(body.taxes || 0), 0)),
      taxes: Number(body.cashTaxes || body.taxes || 0),
      closing_balance: Number(body.closingBalance || body.cash || 0),
      runway_days: Number(body.runway || 0),
      status: "Validado MB",
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    };
    const existingCash = await rest(`/cash_flow_reports?client_id=eq.${clientId}&competence=eq.${competence}&select=id&limit=1`);
    if (existingCash[0]) {
      await rest(`/cash_flow_reports?id=eq.${existingCash[0].id}`, { method: "PATCH", body: cashPayload });
    } else {
      await rest("/cash_flow_reports", { method: "POST", body: [{ client_id: clientId, competence, ...cashPayload }] });
    }
  }
}

async function handleFinance(req, res, segments) {
  const clientId = segments[1];
  const ctx = await authContext(req, res);
  if (!ctx) return;
  const { url } = parseUrl(req);
  const selectedCompetence = maybeCompetence(url.searchParams.get("competence"));
  const snapshotQuery = (id, competence) => competence
    ? `/financial_snapshots?client_id=eq.${id}&competence=eq.${competence}&select=*&limit=1`
    : `/financial_snapshots?client_id=eq.${id}&select=*&order=competence.desc&limit=1`;
  const reportQuery = (table, id, competence, select = "*") => competence
    ? `/${table}?client_id=eq.${id}&competence=eq.${competence}&select=${select}&limit=1`
    : `/${table}?client_id=eq.${id}&select=${select}&order=competence.desc&limit=1`;
  if (req.method === "GET" && !clientId) {
    const clientRows = ctx.profile.type === "mb"
      ? await rest("/clients?select=id")
      : await rest(`/clients?id=eq.${ctx.profile.client_id}&select=id`);
    const data = {};
    for (const client of clientRows) {
      const rows = await rest(snapshotQuery(client.id, selectedCompetence));
      const historyRows = await rest(`/financial_snapshots?client_id=eq.${client.id}&select=*&order=competence.desc&limit=12`);
      const dreReports = await rest(reportQuery("dre_reports", client.id, selectedCompetence, "id"));
      const dreLines = dreReports[0] ? await rest(`/dre_report_lines?report_id=eq.${dreReports[0].id}&select=*&order=sort_order.asc`) : [];
      const cashRows = await rest(reportQuery("cash_flow_reports", client.id, selectedCompetence));
      data[client.id] = financeToApi(rows[0], dreLines, cashRows[0], historyRows);
    }
    return ok(res, { data });
  }
  if (!canAccessClient(ctx.profile, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
  if (req.method === "GET") {
    const rows = await rest(snapshotQuery(clientId, selectedCompetence));
    const historyRows = await rest(`/financial_snapshots?client_id=eq.${clientId}&select=*&order=competence.desc&limit=12`);
    const dreReports = await rest(reportQuery("dre_reports", clientId, selectedCompetence, "id"));
    const dreLines = dreReports[0] ? await rest(`/dre_report_lines?report_id=eq.${dreReports[0].id}&select=*&order=sort_order.asc`) : [];
    const cashRows = await rest(reportQuery("cash_flow_reports", clientId, selectedCompetence));
    return ok(res, { data: financeToApi(rows[0], dreLines, cashRows[0], historyRows) });
  }
  if (req.method === "PATCH") {
    if (ctx.profile.type !== "mb") return error(res, 403, "Acesso restrito à equipe MB.");
    const body = await readBody(req);
    const competence = maybeCompetence(body.competence) || currentCompetence();
    if (body.nextReview) {
      try {
        await rest(`/clients?id=eq.${clientId}`, { method: "PATCH", body: { next_review_date: body.nextReview } });
      } catch (err) {
        if (!String(err.message || "").includes("next_review_date")) throw err;
      }
    }
    const existing = await rest(`/financial_snapshots?client_id=eq.${clientId}&competence=eq.${competence}&select=id&limit=1`);
    const payload = {
      revenue: body.revenue,
      expenses: body.expenses,
      taxes: body.taxes,
      payroll: body.payroll,
      cash: body.cash,
      financial_score: body.score,
      operational_score: body.operationalScore,
      runway_days: body.runway,
      investment_capacity: body.investmentCapacity,
      margin_target: body.marginTarget,
      working_capital_days: body.workingCapitalDays,
      confidence: body.confidence || "Media"
    };
    const computedScore = calculateFinancialScore({ ...payload, result: Number(payload.revenue || 0) - Number(payload.expenses || 0) });
    payload.financial_score = computedScore.total;
    payload.score_breakdown = computedScore.dimensions;
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    let rows;
    try {
      rows = existing[0]
        ? await rest(`/financial_snapshots?id=eq.${existing[0].id}`, { method: "PATCH", body: payload })
        : await rest("/financial_snapshots", { method: "POST", body: [{ client_id: clientId, competence, ...payload }] });
    } catch (err) {
      if (!String(err.message || "").includes("margin_target") && !String(err.message || "").includes("working_capital_days") && !String(err.message || "").includes("score_breakdown")) throw err;
      delete payload.margin_target;
      delete payload.working_capital_days;
      delete payload.score_breakdown;
      rows = existing[0]
        ? await rest(`/financial_snapshots?id=eq.${existing[0].id}`, { method: "PATCH", body: payload })
        : await rest("/financial_snapshots", { method: "POST", body: [{ client_id: clientId, competence, ...payload }] });
    }
    await saveFinancialReportsFromForm(ctx.profile, clientId, competence, body);
    const historyRows = await rest(`/financial_snapshots?client_id=eq.${clientId}&select=*&order=competence.desc&limit=12`);
    const dreReports = await rest(reportQuery("dre_reports", clientId, competence, "id"));
    const dreLines = dreReports[0] ? await rest(`/dre_report_lines?report_id=eq.${dreReports[0].id}&select=*&order=sort_order.asc`) : [];
    const cashRows = await rest(reportQuery("cash_flow_reports", clientId, competence));
    return ok(res, { data: financeToApi(rows[0], dreLines, cashRows[0], historyRows) });
  }
  return error(res, 404, "Rota financeira não encontrada.");
}

async function handleUsers(req, res, segments) {
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  if (req.method === "GET") {
    const rows = await rest("/user_profiles?select=*");
    return ok(res, { data: rows.map(profileToApi) });
  }
  if (req.method === "POST") {
    const body = await readBody(req);
    const authUser = await supabaseRequest("/auth/v1/admin/users", { method: "POST", body: { email: body.email, password: body.password || "123456", email_confirm: true, user_metadata: { name: body.name, role: body.role, type: body.type } } });
    const rows = await rest("/user_profiles", { method: "POST", body: [{ id: authUser.id, client_id: body.clientId || null, type: body.type || "client", name: body.name, email: body.email, role: body.role || "Somente leitura", status: body.status || "Ativo" }] });
    return created(res, { data: profileToApi(rows[0]) });
  }
  if (req.method === "PATCH" && segments[1]) {
    const body = await readBody(req);
    const payload = { name: body.name, email: body.email, role: body.role, status: body.status };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const rows = await rest(`/user_profiles?id=eq.${segments[1]}`, { method: "PATCH", body: payload });
    await logAudit(ctx.profile, "Atualizou usuario", rows[0]?.email || segments[1], payload.status || "Dados atualizados");
    return ok(res, { data: profileToApi(rows[0]) });
  }
  return error(res, 404, "Rota de usuários não encontrada.");
}

async function handleMessages(req, res) {
  if (req.method === "GET") {
    const ctx = await authContext(req, res);
    if (!ctx) return;
    const { url } = parseUrl(req);
    const clientId = url.searchParams.get("clientId") || (ctx.profile.type === "client" ? ctx.profile.client_id : null);
    if (clientId && !canAccessClient(ctx.profile, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
    const query = clientId ? `/messages?client_id=eq.${clientId}&select=*&order=created_at.asc` : "/messages?select=*&order=created_at.desc";
    const rows = await rest(query);
    return ok(res, { data: rows.map((row) => ({ id: row.id, clientId: row.client_id, from: row.sender_label, text: row.content, at: row.created_at })) });
  }
  const ctx = await authContext(req, res);
  if (!ctx) return;
  const body = await readBody(req);
  if (!canAccessClient(ctx.profile, body.clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
  const rows = await rest("/messages", { method: "POST", body: [{ client_id: body.clientId, sender_id: ctx.profile.id, sender_label: ctx.profile.type === "mb" ? "MB" : "Cliente", content: body.text }] });
  return created(res, { data: rows[0] });
}

async function handleTasks(req, res) {
  if (req.method === "GET") return listClientScoped(req, res, "tasks", taskToApi);
  if (req.method === "POST") {
    const ctx = await requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    if (!canAccessClient(ctx.profile, body.clientId)) return error(res, 403, "Cliente fora do escopo do usuario.");
    const rows = await rest("/tasks", {
      method: "POST",
      body: [{
        client_id: body.clientId,
        title: body.title,
        description: body.description || body.origin || "",
        priority: body.priority || "Media",
        due_date: body.due || null,
        status: body.status || "Pendente",
        origin: body.origin || "MB"
      }]
    });
    await logAudit(ctx.profile, "Criou pendencia", body.title, "Tarefa operacional registrada");
    return created(res, { data: taskToApi(rows[0]) });
  }
  return error(res, 404, "Rota de tarefas não encontrada.");
}

async function handleApprovals(req, res, segments) {
  const ctx = await requireMb(req, res);
  if (!ctx) return;
  if (req.method === "GET") {
    const rows = await rest("/ai_insights?select=*");
    return ok(res, { data: rows.map(insightToApi) });
  }
  if (req.method === "POST" && segments.length === 1) {
    const body = await readBody(req);
    const rows = await rest("/ai_insights", {
      method: "POST",
      body: [{
        client_id: body.clientId,
        competence: maybeCompetence(body.competence) || currentCompetence(),
        title: body.title,
        content: body.text || body.content || "",
        confidence: body.confidence || "Media",
        status: body.status || "Aguardando aprovação",
        source_data: { origin: "Admin MB", createdBy: ctx.profile.name }
      }]
    });
    await logAudit(ctx.profile, "Criou insight IA/MB", rows[0]?.title || body.title, "Enviado para governanca");
    return created(res, { data: insightToApi(rows[0]) });
  }
  if (req.method === "PATCH" && segments[1]) {
    const body = await readBody(req);
    const payload = {
      status: body.status,
      content: body.text || body.insightText,
      review_notes: body.reviewNotes,
      source_data: {
        ...(body.sourceData || {}),
        reviewNotes: body.reviewNotes || "",
        reviewOrigin: "Admin MB",
        reviewedBy: ctx.profile.name,
        reviewedById: ctx.profile.id
      },
      reviewed_by: ctx.profile.id,
      reviewed_at: new Date().toISOString(),
      published_at: String(body.status || "").toLowerCase().includes("aprov") ? new Date().toISOString() : null
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    let rows;
    try {
      rows = await rest(`/ai_insights?id=eq.${segments[1]}`, { method: "PATCH", body: payload });
    } catch (err) {
      if (!String(err.message || "").includes("review_notes")) throw err;
      delete payload.review_notes;
      rows = await rest(`/ai_insights?id=eq.${segments[1]}`, { method: "PATCH", body: payload });
    }
    await logAudit(ctx.profile, "Revisou insight IA", rows[0]?.title || segments[1], payload.status || "Atualizado");
    return ok(res, { data: insightToApi(rows[0]) });
  }
  return error(res, 404, "Rota de aprovações não encontrada.");
}

async function route(req, res) {
  const { url, segments } = parseUrl(req);
  if (req.method === "OPTIONS") return noContent(res);
  if (req.method === "GET" && segments[0] === "health") return ok(res, { status: "ok", name: "MB Intelligence API", driver: "supabase" });
  if (segments[0] === "auth") return handleAuth(req, res, segments);
  if (segments[0] === "plans") return handlePlans(req, res, segments);
  if (segments[0] === "clients") return handleClients(req, res, segments);
  if (segments[0] === "documents") return handleDocuments(req, res, segments);
  if (segments[0] === "imports") return handleImports(req, res);
  if (segments[0] === "finance") return handleFinance(req, res, segments);
  if (segments[0] === "users") return handleUsers(req, res, segments);
  if (segments[0] === "messages") return handleMessages(req, res);
  if (segments[0] === "tasks") return handleTasks(req, res);
  if (segments[0] === "approvals") return handleApprovals(req, res, segments);
  if (segments[0] === "audit") {
    const ctx = await requireMb(req, res);
    if (!ctx) return;
    const rows = await rest("/audit_logs?select=*&order=created_at.desc");
    return ok(res, { data: rows.map((row) => ({ id: row.id, at: row.created_at, user: row.user_name, action: row.action, target: row.target, result: row.result })) });
  }
  if (serveStatic(req, res, url)) return;
  return error(res, 404, "Rota não encontrada.");
}

async function requestHandler(req, res) {
  try {
    await route(req, res);
  } catch (err) {
    if (err.statusCode) return error(res, err.statusCode, err.message);
    error(res, 500, "Erro interno da API Supabase.", err.message);
  }
}

if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(port, () => {
    console.log(`MB Intelligence API Supabase rodando em http://localhost:${port}`);
  });
} else {
  module.exports = requestHandler;
}
