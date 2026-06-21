(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function list(type) {
    const users = MBI.storage.getDatabase().users;
    return type ? users.filter((user) => user.type === type) : users;
  }

  function create(payload) {
    const user = MBI.storage.updateDatabase((db) => {
      const row = {
        id: MBI.storage.nowId("usr"),
        type: payload.type || "client",
        clientId: payload.clientId || null,
        name: payload.name,
        email: payload.email,
        password: payload.password || "123456",
        role: payload.role,
        status: payload.status || "Ativo"
      };
      db.users.push(row);
      return row;
    });
    MBI.services.audit.log("Criou usuário", user.email, user.role, MBI.auth.currentUser()?.name);
    return user;
  }

  function update(userId, payload) {
    const user = MBI.storage.updateDatabase((db) => {
      const row = db.users.find((item) => item.id === userId);
      if (!row) return null;
      Object.assign(row, payload);
      return row;
    });
    if (user) MBI.services.audit.log("Atualizou usuario", user.email, user.status, MBI.auth.currentUser()?.name);
    return user;
  }

  function deactivate(userId) {
    return update(userId, { status: "Inativo" });
  }

  MBI.services.users = { list, create, update, deactivate };
})();
