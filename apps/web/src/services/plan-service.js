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
      ["Documentos e guias", "Sim", "Sim", "Sim", "Base"],
      ["Faturamento e fiscal", "Básico", "Completo", "Completo", "Plano + dados"],
      ["Folha", "Documentos", "Folha e encargos", "Folha e encargos", "Plano"],
      ["Dashboard financeiro", "Não", "Sim", "Sim", "Plano"],
      ["DRE", "Não", "Básica se houver dados", "Completa e validada", "Plano + dados"],
      ["Fluxo de caixa", "Não", "Básico se houver dados", "Completo e validado", "Plano + extrato"],
      ["IA", "Não", "Observações", "Executiva + aprovação MB", "Governança"],
      ["CFO consultivo", "Não", "Não", "Sim", "Plano CFO"]
    ];
  }

  MBI.services.plans = { list, get, updatePrice, matrix };
})();
