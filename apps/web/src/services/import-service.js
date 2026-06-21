(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function list(clientId) {
    const rows = MBI.storage.getDatabase().imports;
    return clientId ? rows.filter((item) => item.clientId === clientId) : rows;
  }

  function create(payload) {
    const item = MBI.storage.updateDatabase((db) => {
      const row = {
        id: MBI.storage.nowId("imp"),
        clientId: payload.clientId,
        fileName: payload.fileName,
        type: payload.type,
        competence: payload.competence || null,
        status: payload.status || "Aguardando validação MB",
        owner: payload.owner || MBI.auth.currentUser()?.name || "MB",
        result: payload.result || "Aguardando processamento"
      };
      db.imports.push(row);
      return row;
    });
    MBI.services.audit.log("Registrou importação", item.fileName, item.status, MBI.auth.currentUser()?.name);
    return item;
  }

  MBI.services.imports = { list, create };
})();
