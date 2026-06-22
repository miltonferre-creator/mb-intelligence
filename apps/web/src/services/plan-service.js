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
      ["Documentos (contábil, fiscal, folha)", "Sim", "Sim", "Base"],
      ["Download de guias e arquivos", "Sim", "Sim", "Base"],
      ["Comunicação com a MB", "Sim", "Sim", "Base"],
      ["Dashboard financeiro", "Não", "Sim", "Gestão"],
      ["Faturamento, resultado e margem", "Não", "Sim", "Gestão"],
      ["MB Financial Score + radar", "Não", "Sim", "Gestão"],
      ["Indicadores, alertas e leitura IA", "Não", "Sim", "Gestão"],
      ["DRE e fluxo de caixa", "Não", "Sim", "Gestão"]
    ];
  }

  MBI.services.plans = { list, get, updatePrice, matrix };
})();
