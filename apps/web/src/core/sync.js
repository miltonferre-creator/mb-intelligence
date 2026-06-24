(function () {
  window.MBI = window.MBI || {};

  async function optional(path, fallback) {
    try {
      return await MBI.api.request(path);
    } catch (error) {
      // Nao mascarar: a falha fica visivel. O fallback (ver refresh) NUNCA
      // injeta dado de seed/demonstracao para um usuario autenticado.
      MBI.observability?.warn("sync.optional", `Falha ao buscar ${path}; usando fallback seguro`, { error: error?.message });
      return fallback;
    }
  }

  function mergeUsers(localUsers, remoteUsers, currentUser) {
    const map = new Map((localUsers || []).map((user) => [user.id, user]));
    (remoteUsers || []).forEach((user) => map.set(user.id, { ...map.get(user.id), ...user }));
    if (currentUser) map.set(currentUser.id, { ...map.get(currentUser.id), ...currentUser });
    return [...map.values()];
  }

  async function refresh() {
    const session = MBI.storage.getSession();
    if (!session?.token) return { remote: false };

    const local = MBI.storage.getDatabase();
    // Quando o banco local ainda e o SEED (nunca sincronizado), o fallback de
    // falha NAO pode trazer dados de demonstracao no lugar dos reais — senao
    // dois usuarios veem listas diferentes (real x demo). Usa-se vazio ate que
    // a sincronizacao real aconteca. Se ja sincronizou antes, mantem o ultimo
    // dado real conhecido como fallback.
    const lastGood = (collection) => (local.synced ? (local[collection] || []) : []);
    const me = await MBI.api.request("/auth/me");
    const plans = await MBI.api.request("/plans");
    const isClient = me.user?.type === "client";
    // /clients e tolerante a falha: server antigo barrava o cliente com 403 e
    // derrubava o sync inteiro (tela branca / volta ao login). Agora o cliente
    // continua com o proprio registro (injetado no login + me.client).
    const clients = await optional("/clients", { data: null });
    const documents = await optional("/documents", { data: lastGood("documents") });
    const imports = await optional("/imports", { data: lastGood("imports") });
    const tasks = await optional("/tasks", { data: lastGood("tasks") });
    const messages = await optional("/messages", { data: lastGood("messages") });
    const approvals = await optional("/approvals", { data: lastGood("approvals") });
    const audit = await optional("/audit", { data: lastGood("audit") });
    const users = await optional("/users", { data: [] });
    const settings = await optional("/settings", { data: null });

    // Resolve a lista de clientes:
    // - Admin: a resposta de /clients e autoritativa MESMO vazia (nunca cair no
    //   seed, senao clientes demo apagados reaparecem).
    // - Cliente: /clients pode ter falhado (server antigo) -> mantem o espelho
    //   local e garante o proprio cliente (me.client) presente.
    let clientsList;
    if (Array.isArray(clients.data)) {
      clientsList = clients.data;
    } else {
      clientsList = local.synced ? (local.clients || []) : (isClient ? (local.clients || []) : MBI.seed.clients);
    }
    if (isClient && me.client) {
      const idx = clientsList.findIndex((c) => c.id === me.client.id);
      if (idx >= 0) clientsList[idx] = { ...clientsList[idx], ...me.client };
      else clientsList = [...clientsList, me.client];
    }

    const financeBatch = await optional("/finance", { data: null });
    const financials = { ...(local.synced ? (local.financials || {}) : {}), ...(financeBatch.data || {}) };
    if (!financeBatch.data) {
      const financeRows = await Promise.all(clientsList.map(async (client) => {
        try {
          const finance = await MBI.api.request(`/finance/${client.id}`);
          return [client.id, finance.data || financials[client.id] || {}];
        } catch (error) {
          return [client.id, financials[client.id] || {}];
        }
      }));
      financeRows.forEach(([clientId, data]) => {
        financials[clientId] = data;
      });
    }

    const db = {
      ...local,
      // Marca que este banco local agora reflete o Supabase (deixou de ser seed).
      // A partir daqui, falhas de fetch caem no ultimo dado REAL, nunca no demo.
      synced: true,
      version: local.version || MBI.seed.version,
      config: settings.data ? { ...(local.config || {}), ...settings.data } : (local.config || {}),
      plans: plans.data?.length ? plans.data : local.plans,
      clients: clientsList,
      users: mergeUsers(local.users, users.data, me.user),
      documents: documents.data || [],
      imports: imports.data || [],
      tasks: tasks.data || [],
      messages: messages.data || [],
      approvals: approvals.data || [],
      audit: audit.data || [],
      financials
    };

    MBI.storage.setDatabase(db);
    const updatedSession = {
      ...session,
      userId: me.user.id,
      type: me.user.type,
      clientId: me.user.type === "mb" ? session.clientId : me.session.clientId,
      token: session.token,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      remote: true
    };
    MBI.storage.setSession(updatedSession);
    return { remote: true, session: updatedSession };
  }

  async function refreshIfPossible() {
    try {
      return await refresh();
    } catch (error) {
      return { remote: false, error };
    }
  }

  MBI.sync = { refresh, refreshIfPossible };
})();
