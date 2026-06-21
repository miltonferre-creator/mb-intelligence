(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function listByClient(clientId) {
    return MBI.storage.getDatabase().documents.filter((doc) => doc.clientId === clientId);
  }

  function create(payload) {
    const document = MBI.storage.updateDatabase((db) => {
      const file = typeof File !== "undefined" && payload.file instanceof File ? payload.file : null;
      const originalFileName = payload.fileName || payload.originalFileName || file?.name || payload.name || "Documento MB";
      const row = {
        id: MBI.storage.nowId("doc"),
        clientId: payload.clientId,
        name: payload.name || originalFileName,
        description: payload.description || payload.name || originalFileName,
        fileName: originalFileName,
        originalFileName,
        category: payload.category,
        type: payload.type || payload.documentType || payload.category,
        status: payload.status || "Disponivel",
        competence: payload.competence || null,
        dueDate: payload.dueDate || null,
        due: payload.dueDate || payload.competence || payload.due || "Sem prazo",
        visibility: payload.visibility || "Cliente",
        mimeType: payload.mimeType || file?.type || "application/octet-stream",
        size: payload.size || file?.size || 0
      };
      db.documents.push(row);
      return row;
    });
    MBI.services.audit.log("Publicou documento", document.name, document.status, MBI.auth.currentUser()?.name);
    return document;
  }

  function remove(documentId) {
    let removed = null;
    MBI.storage.updateDatabase((db) => {
      const index = db.documents.findIndex((doc) => String(doc.id) === String(documentId));
      if (index >= 0) {
        removed = db.documents[index];
        db.documents.splice(index, 1);
      }
    });
    if (removed) MBI.services.audit.log("Excluiu documento", removed.fileName || removed.name, removed.clientId, MBI.auth.currentUser()?.name);
    return removed;
  }

  MBI.services.documents = { listByClient, create, remove };
})();
