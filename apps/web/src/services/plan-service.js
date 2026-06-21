(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function list() {
    return MBI.storage.getDatabase().plans;
  }

  function get(id) {
    return list().find((plan) => plan.id === id);
  }

  function updatePrice(id, price) {
    const updated = MBI.storage.updateDatabase((db) => {
      const plan = db.plans.find((item) => item.id === id);
      if (!plan) return null;
      plan.price = Number(price || 0);
      return plan;
    });
    if (updated) MBI.services.audit.log("Alterou valor de plano", updated.name, `Novo valor: ${updated.price}`, MBI.auth.currentUser()?.name);
    return updated;
  }

  function matrix() {
    return [
      ["Documentos e guias", "Sim", "Sim", "Em breve", "Base"],
      ["Faturamento e fiscal", "Básico", "Completo", "Em breve", "Plano + dados"],
      ["Folha (até 5 func.)", "Não", "Sim", "Em breve", "Plano Gestão"],
      ["Dashboard financeiro", "Não", "Sim", "Em breve", "Plano Gestão"],
      ["Indicadores e alertas", "Não", "Sim", "Em breve", "Plano Gestão"],
      ["Observações IA", "Não", "Sim", "Em breve", "Plano Gestão"],
      ["DRE executiva", "Não", "Não", "Em breve", "CFO (futuro)"],
      ["Fluxo de caixa gerencial", "Não", "Não", "Em breve", "CFO (futuro)"],
      ["CFO consultivo", "Não", "Não", "Em breve", "CFO (futuro)"]
    ];
  }

  MBI.services.plans = { list, get, updatePrice, matrix };
})();
