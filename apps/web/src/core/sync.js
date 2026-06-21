(function () {
  window.MBI = window.MBI || {};

  async function optional(path, fallback) {
    try {
      return await MBI.api.request(path);
    } catch (error) {
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
    const me = await MBI.api.request("/auth/me");
    const plans = await MBI.api.request("/plans");
    const clients = await MBI.api.request("/clients");
    const documents = await optional("/documents", { data: local.documents || [] });
    const imports = await optional("/imports", { data: local.imports || [] });
    const tasks = await optional("/tasks", { data: local.tasks || [] });
    const messages = await optional("/messages", { data: local.messages || [] });
    const approvals = await optional("/approvals", { data: local.approvals || [] });
    const audit = await optional("/audit", { data: local.audit || [] });
    const users = await optional("/users", { data: [] });

    const financeBatch = await optional("/finance", { data: null });
    const financials = { ...(local.financials || {}), ...(financeBatch.data || {}) };
    if (!financeBatch.data) {
      const financeRows = await Promise.all((clients.data || []).map(async (client) => {
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
      version: local.version || MBI.seed.version,
      plans: plans.data?.length ? plans.data : local.plans,
      clients: clients.data?.length ? clients.data : (local.clients?.length ? local.clients : MBI.seed.clients),
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
