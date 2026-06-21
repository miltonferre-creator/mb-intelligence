const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { loadEnv } = require("./lib/env");

loadEnv(path.resolve(__dirname, "../.env"));

const { readDatabase, updateDatabase } = require("./lib/store");
const { ok, created, noContent, error, readBody, parseUrl } = require("./lib/http");
const { id, normalizePasswordUser, verifyPassword, publicUser, token } = require("./lib/security");
const { logAudit, recalcFinancial, createClient, canAccessClient } = require("./lib/domain");

const port = Number(process.env.PORT || 3333);

function bootstrap() {
  updateDatabase((db) => {
    db.sessions = db.sessions || [];
    db.users.forEach(normalizePasswordUser);
    return db;
  });
}

function bearer(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function authContext(req) {
  const db = readDatabase();
  const accessToken = bearer(req);
  if (!accessToken) return null;
  const session = db.sessions.find((item) => item.token === accessToken);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  const user = db.users.find((item) => item.id === session.userId && item.status === "Ativo");
  if (!user) return null;
  return { db, session, user };
}

function requireAuth(req, res) {
  const ctx = authContext(req);
  if (!ctx) {
    error(res, 401, "Sessão inválida ou expirada.");
    return null;
  }
  return ctx;
}

function requireMb(req, res) {
  const ctx = requireAuth(req, res);
  if (!ctx) return null;
  if (ctx.user.type !== "mb") {
    error(res, 403, "Acesso restrito à equipe MB.");
    return null;
  }
  return ctx;
}

function listByClient(req, res, collectionName) {
  const ctx = requireAuth(req, res);
  if (!ctx) return;
  const { url } = parseUrl(req);
  const clientId = url.searchParams.get("clientId");
  let rows = ctx.db[collectionName] || [];
  if (clientId) {
    if (!canAccessClient(ctx.user, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
    rows = rows.filter((item) => item.clientId === clientId);
  } else if (ctx.user.type !== "mb") {
    rows = rows.filter((item) => item.clientId === ctx.user.clientId);
  }
  ok(res, { data: rows });
}

function localDocumentDataUrl(document, client) {
  const content = [
    "MB Intelligence - Registro local de documento",
    "",
    `Cliente: ${client?.name || document.clientId || "-"}`,
    `Documento: ${document.name || document.fileName || "Documento MB"}`,
    `Categoria: ${document.category || "-"}`,
    `Competencia: ${document.competence || "-"}`,
    `Vencimento: ${document.dueDate || document.due || "-"}`,
    `Status: ${document.status || "-"}`,
    `Visibilidade: ${document.visibility || "Cliente"}`,
    "",
    "Observacao:",
    "Este arquivo foi gerado pelo servidor local. Em producao, o arquivo original sera entregue pelo Supabase Storage."
  ].join("\n");
  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}

async function handleAuth(req, res, segments) {
  if (req.method === "POST" && segments[1] === "login") {
    const body = await readBody(req);
    const result = updateDatabase((db) => {
      db.users.forEach(normalizePasswordUser);
      const email = String(body.email || "").trim().toLowerCase();
      const user = db.users.find((item) => item.email.toLowerCase() === email && item.status === "Ativo");
      if (!user || !verifyPassword(user, String(body.password || ""))) return null;

      const session = {
        id: id("ses"),
        token: token(),
        userId: user.id,
        type: user.type,
        clientId: user.type === "client" ? user.clientId : (body.clientId || db.clients[0]?.id),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString()
      };
      db.sessions.push(session);
      if (user.type === "client") {
        const client = db.clients.find((item) => item.id === user.clientId);
        if (client) client.lastAccess = new Date().toLocaleString("pt-BR");
      }
      logAudit(db, user, "Realizou login", user.type === "mb" ? "Administração MB" : "Portal do Cliente", "Sessão iniciada");
      return { session, user: publicUser(user) };
    });

    if (!result) return error(res, 401, "E-mail ou senha inválidos.");
    return ok(res, result);
  }

  if (req.method === "POST" && segments[1] === "logout") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    updateDatabase((db) => {
      db.sessions = db.sessions.filter((item) => item.id !== ctx.session.id);
      logAudit(db, ctx.user, "Saiu da plataforma", "Sessão", "Sessão encerrada");
    });
    return noContent(res);
  }

  if (req.method === "POST" && segments[1] === "change-password") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    if (!body.currentPassword || !body.newPassword) return error(res, 400, "Informe a senha atual e a nova senha.");
    if (String(body.newPassword).length < 6) return error(res, 400, "A nova senha deve ter pelo menos 6 caracteres.");
    if (body.newPassword !== body.confirmPassword) return error(res, 400, "A confirmacao da senha nao confere.");
    if (!verifyPassword(ctx.user, String(body.currentPassword))) return error(res, 400, "Senha atual invalida.");
    updateDatabase((db) => {
      const user = db.users.find((item) => item.id === ctx.user.id);
      if (user) {
        user.password = body.newPassword;
        normalizePasswordUser(user);
        logAudit(db, user, "Alterou senha", user.email, "Senha atualizada pelo portal");
      }
    });
    return ok(res, { ok: true });
  }

  if (req.method === "GET" && segments[1] === "me") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const client = ctx.session.clientId ? ctx.db.clients.find((item) => item.id === ctx.session.clientId) : null;
    return ok(res, { user: publicUser(ctx.user), session: ctx.session, client });
  }

  if (req.method === "POST" && segments[1] === "register-client") {
    const body = await readBody(req);
    const result = updateDatabase((db) => {
      const client = createClient(db, {
        companyName: body.companyName,
        tradeName: body.tradeName,
        cnpj: body.cnpj,
        city: body.city,
        segment: body.segment,
        planId: body.planId,
        ownerName: body.ownerName,
        email: body.email,
        phone: body.phone
      });
      const user = normalizePasswordUser({
        id: id("usr"),
        type: "client",
        clientId: client.id,
        name: body.ownerName,
        email: body.email,
        password: body.password || "123456",
        role: "Proprietario",
        status: "Ativo"
      });
      db.users.push(user);
      const session = {
        id: id("ses"),
        token: token(),
        userId: user.id,
        type: "client",
        clientId: client.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString()
      };
      db.sessions.push(session);
      logAudit(db, user, "Criou cadastro comercial", client.name, "Cliente registrado pelo fluxo de contratação");
      return { client, user: publicUser(user), session };
    });
    return created(res, result);
  }

  return error(res, 404, "Rota de autenticação não encontrada.");
}

async function handlePlans(req, res, segments) {
  if (req.method === "GET" && segments.length === 1) {
    return ok(res, { data: readDatabase().plans });
  }

  if (req.method === "PATCH" && segments[1]) {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const plan = updateDatabase((db) => {
      const row = db.plans.find((item) => item.id === segments[1]);
      if (!row) return null;
      if (body.price !== undefined) row.price = Number(body.price || 0);
      if (body.tagline !== undefined) row.tagline = body.tagline;
      if (Array.isArray(body.modules)) row.modules = body.modules;
      logAudit(db, ctx.user, "Alterou plano", row.name, "Configuração comercial atualizada");
      return row;
    });
    if (!plan) return error(res, 404, "Plano não encontrado.");
    return ok(res, { data: plan });
  }

  return error(res, 404, "Rota de planos não encontrada.");
}

async function handleClients(req, res, segments) {
  if (req.method === "GET" && segments.length === 1) {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const data = ctx.user.type === "mb" ? ctx.db.clients : ctx.db.clients.filter((item) => item.id === ctx.user.clientId);
    return ok(res, { data });
  }

  if (req.method === "GET" && segments[1]) {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    if (!canAccessClient(ctx.user, segments[1])) return error(res, 403, "Cliente fora do escopo do usuário.");
    const client = ctx.db.clients.find((item) => item.id === segments[1]);
    if (!client) return error(res, 404, "Cliente não encontrado.");
    return ok(res, { data: client });
  }

  if (req.method === "POST" && segments.length === 1) {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const client = updateDatabase((db) => {
      const row = createClient(db, body);
      logAudit(db, ctx.user, "Cadastrou cliente", row.name, "Cliente criado pela Administração MB");
      return row;
    });
    return created(res, { data: client });
  }

  if (req.method === "PATCH" && segments[1] && segments[2] === "plan") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const client = updateDatabase((db) => {
      const row = db.clients.find((item) => item.id === segments[1]);
      if (!row) return null;
      row.planId = body.planId;
      logAudit(db, ctx.user, "Alterou plano do cliente", row.name, body.planId);
      return row;
    });
    if (!client) return error(res, 404, "Cliente não encontrado.");
    return ok(res, { data: client });
  }

  if (req.method === "PATCH" && segments[1]) {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const client = updateDatabase((db) => {
      const row = db.clients.find((item) => item.id === segments[1]);
      if (!row) return null;
      Object.assign(row, body);
      logAudit(db, ctx.user, "Atualizou cliente", row.name, "Ficha cadastral alterada");
      return row;
    });
    if (!client) return error(res, 404, "Cliente não encontrado.");
    return ok(res, { data: client });
  }

  return error(res, 404, "Rota de clientes não encontrada.");
}

async function handleDocuments(req, res, segments = []) {
  if (req.method === "GET" && segments[1] && segments[2] === "download") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const document = (ctx.db.documents || []).find((item) => String(item.id) === String(segments[1]));
    if (!document) return error(res, 404, "Documento nao encontrado.");
    if (!canAccessClient(ctx.user, document.clientId)) return error(res, 403, "Documento fora do escopo do usuario.");
    if (ctx.user.type === "client" && document.visibility && document.visibility !== "Cliente") return error(res, 403, "Documento restrito a equipe MB.");
    const client = ctx.db.clients.find((item) => item.id === document.clientId);
    const url = document.url || document.downloadUrl || localDocumentDataUrl(document, client);
    logAudit(ctx.db, ctx.user, "Gerou link de download", document.name || document.fileName || document.id, "Ambiente local");
    return ok(res, { url, fileName: document.fileName || document.originalFileName || document.name || "Documento_MB.txt", local: !document.url && !document.downloadUrl });
  }

  if (req.method === "DELETE" && segments[1]) {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const removed = updateDatabase((db) => {
      const index = db.documents.findIndex((item) => String(item.id) === String(segments[1]));
      if (index < 0) return null;
      const row = db.documents[index];
      if (!canAccessClient(ctx.user, row.clientId)) return false;
      db.documents.splice(index, 1);
      logAudit(db, ctx.user, "Excluiu documento", row.fileName || row.name || row.id, "Removido do portal do cliente");
      return row;
    });
    if (removed === false) return error(res, 403, "Documento fora do escopo do usuario.");
    if (!removed) return error(res, 404, "Documento nao encontrado.");
    return ok(res, { ok: true });
  }

  if (req.method === "GET") return listByClient(req, res, "documents");

  if (req.method === "POST") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const document = updateDatabase((db) => {
      const row = {
        id: id("doc"),
        clientId: body.clientId,
        name: body.name || body.fileName,
        description: body.description || body.name || body.fileName,
        fileName: body.fileName || body.name,
        originalFileName: body.originalFileName || body.fileName || body.name,
        category: body.category,
        type: body.type || body.documentType || body.category,
        status: body.status || "Disponivel",
        competence: body.competence || null,
        dueDate: body.dueDate || null,
        due: body.due || "Sem prazo",
        visibility: body.visibility || "Cliente",
        mimeType: body.mimeType || "application/octet-stream",
        size: body.size || 0
      };
      db.documents.push(row);
      logAudit(db, ctx.user, "Publicou documento", row.name, row.status);
      return row;
    });
    return created(res, { data: document });
  }

  return error(res, 404, "Rota de documentos não encontrada.");
}

async function handleImports(req, res) {
  if (req.method === "GET") return listByClient(req, res, "imports");

  if (req.method === "POST") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const item = updateDatabase((db) => {
      const row = {
        id: id("imp"),
        clientId: body.clientId,
        fileName: body.fileName,
        type: body.type,
        competence: body.competence || null,
        status: body.status || "Aguardando validação MB",
        owner: body.owner || ctx.user.name,
        result: body.result || "Aguardando processamento"
      };
      db.imports.push(row);
      logAudit(db, ctx.user, "Registrou importação", row.fileName, row.status);
      return row;
    });
    return created(res, { data: item });
  }

  return error(res, 404, "Rota de importações não encontrada.");
}

async function handleFinance(req, res, segments) {
  const clientId = segments[1];
  if (!clientId && req.method === "GET") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const clientIds = ctx.user.type === "mb" ? ctx.db.clients.map((client) => client.id) : [ctx.user.clientId];
    const data = {};
    clientIds.forEach((id) => {
      data[id] = ctx.db.financials[id] || null;
    });
    return ok(res, { data });
  }
  if (!clientId) return error(res, 400, "Informe o cliente.");

  if (req.method === "GET") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    if (!canAccessClient(ctx.user, clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
    return ok(res, { data: ctx.db.financials[clientId] || null });
  }

  if (req.method === "PATCH") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const financial = updateDatabase((db) => {
      db.financials[clientId] = db.financials[clientId] || {};
      const competence = String(body.competence || new Date().toISOString().slice(0, 7)).slice(0, 7);
      const container = db.financials[clientId];
      container.snapshots = container.snapshots || {};
      const snapshot = {
        ...(container.snapshots[competence] || {}),
        ...body,
        competence
      };
      recalcFinancial(snapshot);
      container.snapshots[competence] = snapshot;
      Object.assign(container, snapshot);
      const client = db.clients.find((item) => item.id === clientId);
      logAudit(db, ctx.user, "Atualizou indicadores", client?.name || clientId, `Competencia ${competence}`);
      return container;
    });
    return ok(res, { data: financial });
  }

  return error(res, 404, "Rota financeira não encontrada.");
}

async function handleUsers(req, res) {
  if (req.method === "GET") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    return ok(res, { data: ctx.db.users.map(publicUser) });
  }

  if (req.method === "POST") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const user = updateDatabase((db) => {
      const row = normalizePasswordUser({
        id: id("usr"),
        type: body.type || "client",
        clientId: body.clientId || null,
        name: body.name,
        email: body.email,
        password: body.password || "123456",
        role: body.role || "Somente leitura",
        status: body.status || "Ativo"
      });
      db.users.push(row);
      logAudit(db, ctx.user, "Criou usuário", row.email, row.role);
      return row;
    });
    return created(res, { data: publicUser(user) });
  }

  return error(res, 404, "Rota de usuários não encontrada.");
}

async function handleMessages(req, res) {
  if (req.method === "GET") return listByClient(req, res, "messages");

  if (req.method === "POST") {
    const ctx = requireAuth(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    if (!canAccessClient(ctx.user, body.clientId)) return error(res, 403, "Cliente fora do escopo do usuário.");
    const message = updateDatabase((db) => {
      const row = {
        id: id("msg"),
        clientId: body.clientId,
        from: ctx.user.type === "mb" ? "MB" : "Cliente",
        text: body.text,
        at: new Date().toLocaleString("pt-BR")
      };
      db.messages.push(row);
      logAudit(db, ctx.user, "Enviou mensagem", body.clientId, "Mensagem registrada");
      return row;
    });
    return created(res, { data: message });
  }

  return error(res, 404, "Rota de mensagens não encontrada.");
}

async function handleTasks(req, res) {
  if (req.method === "GET") return listByClient(req, res, "tasks");

  if (req.method === "POST") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const task = updateDatabase((db) => {
      const row = {
        id: id("tsk"),
        clientId: body.clientId,
        title: body.title,
        priority: body.priority || "Media",
        owner: body.owner || ctx.user.name,
        due: body.due || "Sem prazo",
        status: body.status || "Pendente"
      };
      db.tasks.push(row);
      logAudit(db, ctx.user, "Criou tarefa", row.title, row.status);
      return row;
    });
    return created(res, { data: task });
  }

  return error(res, 404, "Rota de tarefas não encontrada.");
}

async function handleApprovals(req, res, segments) {
  if (req.method === "GET") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    return ok(res, { data: ctx.db.approvals });
  }

  if (req.method === "PATCH" && segments[1]) {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    const body = await readBody(req);
    const item = updateDatabase((db) => {
      const row = db.approvals.find((approval) => approval.id === segments[1]);
      if (!row) return null;
      Object.assign(row, body);
      logAudit(db, ctx.user, "Atualizou aprovação", row.title, row.status);
      return row;
    });
    if (!item) return error(res, 404, "Aprovação não encontrada.");
    return ok(res, { data: item });
  }

  return error(res, 404, "Rota de aprovações não encontrada.");
}

async function route(req, res) {
  const { segments } = parseUrl(req);

  if (req.method === "OPTIONS") return noContent(res);
  if (req.method === "GET" && segments[0] === "health") {
    return ok(res, { status: "ok", name: "MB Intelligence API", version: "0.1.0" });
  }

  if (segments[0] === "auth") return handleAuth(req, res, segments);
  if (segments[0] === "plans") return handlePlans(req, res, segments);
  if (segments[0] === "clients") return handleClients(req, res, segments);
  if (segments[0] === "documents") return handleDocuments(req, res, segments);
  if (segments[0] === "imports") return handleImports(req, res);
  if (segments[0] === "finance") return handleFinance(req, res, segments);
  if (segments[0] === "users") return handleUsers(req, res);
  if (segments[0] === "messages") return handleMessages(req, res);
  if (segments[0] === "tasks") return handleTasks(req, res);
  if (segments[0] === "approvals") return handleApprovals(req, res, segments);
  if (segments[0] === "audit") {
    const ctx = requireMb(req, res);
    if (!ctx) return;
    return ok(res, { data: [...ctx.db.audit].reverse() });
  }

  // ── Servir frontend estático (SPA) ──────────────────────────────────────
  const webDir = process.env.MBI_WEB_DIR
    ? path.resolve(process.env.MBI_WEB_DIR)
    : path.resolve(__dirname, "../../web");

  if (fs.existsSync(webDir)) {
    const urlPath = req.url.split("?")[0].split("#")[0];
    let filePath = path.join(webDir, urlPath === "/" ? "index.html" : urlPath);

    // Proteção de path traversal
    if (!filePath.startsWith(webDir)) return error(res, 403, "Acesso negado.");

    // SPA fallback — rota não encontrada? serve index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(webDir, "index.html");
    }

    const MIME = {
      ".html": "text/html; charset=utf-8",
      ".js":   "application/javascript; charset=utf-8",
      ".css":  "text/css; charset=utf-8",
      ".json": "application/json",
      ".png":  "image/png",
      ".jpg":  "image/jpeg",
      ".jpeg": "image/jpeg",
      ".ico":  "image/x-icon",
      ".svg":  "image/svg+xml",
      ".woff": "font/woff",
      ".woff2":"font/woff2",
      ".ttf":  "font/ttf",
      ".map":  "application/json",
    };
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    return fs.createReadStream(filePath).pipe(res);
  }

  return error(res, 404, "Rota não encontrada.");
}

bootstrap();

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (err) {
    error(res, 500, "Erro interno da API.", err.message);
  }
});

server.listen(port, () => {
  console.log(`MB Intelligence API rodando em http://localhost:${port}`);
});
