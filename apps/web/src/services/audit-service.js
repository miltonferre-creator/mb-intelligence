(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function list(limit) {
    const db = MBI.storage.getDatabase();
    const rows = [...db.audit].reverse();
    return limit ? rows.slice(0, limit) : rows;
  }

  function log(action, target, result, userName) {
    MBI.storage.updateDatabase((db) => {
      db.audit.push({
        id: MBI.storage.nowId("aud"),
        at: new Date().toLocaleString("pt-BR"),
        user: userName || "Sistema",
        action,
        target,
        result
      });
    });
  }

  MBI.services.audit = { list, log };
})();
