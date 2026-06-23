(function () {
  window.MBI = window.MBI || {};
  MBI.services = MBI.services || {};

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function currentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  function normalizeMonth(value) {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}$/.test(text)) return text;
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text.slice(0, 7);
    return currentMonth();
  }

  function monthLabel(value) {
    const [year, month] = normalizeMonth(value).split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
  }

  function higherIsBetter(value, red, green) {
    if (value >= green) return 100;
    if (value <= red) return 0;
    return ((value - red) / (green - red)) * 100;
  }

  function lowerIsBetter(value, green, red) {
    if (value <= green) return 100;
    if (value >= red) return 0;
    return ((red - value) / (red - green)) * 100;
  }

  function scoreStatus(score) {
    if (score >= 75) return "Saudavel";
    if (score >= 50) return "Atencao";
    return "Risco";
  }

  // ESPELHO OFFLINE. A implementacao canonica do MB Financial Score vive no backend
  // (apps/api/src/server-supabase.js::calculateFinancialScore) e e a fonte de verdade
  // para clientes reais. Esta copia so e usada em modo offline/demo (sem API) e em edicoes
  // locais. Qualquer mudanca de peso/limiar/penalidade deve ser feita NOS DOIS lugares.
  function calculateScore(data) {
    const revenue = Number(data.revenue || 0);
    const expenses = Number(data.expenses || 0);
    const taxes = Number(data.taxes || 0);
    const payroll = Number(data.payroll || 0);
    const cash = Number(data.cash || 0);
    const result = Number(data.result ?? (revenue - expenses));
    const margin = revenue ? (result / revenue) * 100 : 0;
    const runway = Number(data.runway || (expenses ? cash / (expenses / 30) : 0));
    const operational = Math.max(expenses - payroll - taxes, 0);
    const operationalRatio = revenue ? (operational / revenue) * 100 : 100;
    const payrollRatio = revenue ? (payroll / revenue) * 100 : 100;
    const taxRatio = revenue ? (taxes / revenue) * 100 : 100;
    const wcDays = Number(data.workingCapitalDays || 45);
    const dimensions = [
      ["Liquidez", 25, `${Math.round(runway)} dias`, higherIsBetter(runway, 15, 45)],
      ["Rentabilidade", 25, `${margin.toFixed(1).replace(".", ",")}%`, higherIsBetter(margin, 8, 20)],
      ["Eficiencia", 20, `${operationalRatio.toFixed(1).replace(".", ",")}%`, lowerIsBetter(operationalRatio, 15, 30)],
      ["Folha", 15, `${payrollRatio.toFixed(1).replace(".", ",")}%`, lowerIsBetter(payrollRatio, 22, 40)],
      ["Impostos", 10, `${taxRatio.toFixed(1).replace(".", ",")}%`, lowerIsBetter(taxRatio, 12, 20)],
      ["Capital de giro", 5, `${Math.round(wcDays)} dias`, lowerIsBetter(wcDays, 30, 90)]
    ].map(([label, weight, value, rawScore]) => {
      const score = clamp(rawScore);
      return { label, weight, value, score, status: scoreStatus(score) };
    });
    const baseScore = dimensions.reduce((sum, item) => sum + item.score * (item.weight / 100), 0);
    let dataPenalty = 0;
    if (!revenue) dataPenalty += 35;
    if (revenue && !expenses) dataPenalty += 25;
    if (!cash) dataPenalty += 12;
    if (!data.runway && expenses) dataPenalty += 8;
    if (!data.workingCapitalDays) dataPenalty += 5;
    return {
      total: Math.round(clamp(baseScore - dataPenalty)),
      dimensions
    };
  }

  function percent(amount, revenue) {
    if (!revenue) return "0%";
    return `${((Number(amount || 0) / revenue) * 100).toFixed(1).replace(".", ",")}%`;
  }

  function buildDre(data) {
    const revenue = Number(data.revenue || 0);
    if (!revenue) return [];
    const taxes = Number(data.taxes || 0);
    const expenses = Number(data.expenses || 0);
    const payroll = Number(data.payroll || 0);
    const directCosts = -Math.abs(Number(data.directCosts || 0));
    const salesExpenses = -Math.abs(Number(data.salesExpenses || 0));
    const financialExpenses = -Math.abs(Number(data.financialExpenses || 0));
    const admin = -Math.max(expenses - taxes - payroll - Math.abs(directCosts) - Math.abs(salesExpenses) - Math.abs(financialExpenses), 0);
    const payrollExpense = -payroll;
    const netRevenue = revenue - taxes;
    const gross = netRevenue + directCosts;
    const ebitda = gross + admin + payrollExpense + salesExpenses;
    const ebit = ebitda;
    const lair = ebit + financialExpenses;
    const result = revenue - expenses;
    return [
      { label: "BLOCO 1 - RECEITA", type: "section" },
      { label: "Receita bruta de vendas / servicos", amount: revenue, percent: percent(revenue, revenue), type: "normal", variation: "Base informada", ytd: monthLabel(data.competence) },
      { label: "(-) Devolucoes e abatimentos", amount: 0, percent: "0%", type: "normal", variation: "Sem movimento informado", ytd: "-" },
      { label: "(-) Impostos sobre receita", amount: -taxes, percent: percent(-taxes, revenue), type: "normal", variation: "Fiscal", ytd: "-" },
      { label: "= Receita liquida", amount: netRevenue, percent: percent(netRevenue, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
      { label: "BLOCO 2 - CUSTO", type: "section" },
      { label: "(-) CMV / custo dos servicos prestados", amount: directCosts, percent: percent(directCosts, revenue), type: "normal", variation: data.directCosts ? "Informado MB" : "Nao informado", ytd: "-" },
      { label: "= Lucro bruto", amount: gross, percent: percent(gross, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
      { label: "BLOCO 3 - DESPESAS OPERACIONAIS", type: "section" },
      { label: "(-) Despesas administrativas", amount: admin, percent: percent(admin, revenue), type: "normal", variation: "Calculado", ytd: "-" },
      { label: "(-) Despesas com pessoal / folha", amount: payrollExpense, percent: percent(payrollExpense, revenue), type: "normal", variation: "Folha", ytd: "-" },
      { label: "(-) Despesas com vendas / marketing", amount: salesExpenses, percent: percent(salesExpenses, revenue), type: "normal", variation: data.salesExpenses ? "Informado MB" : "Sem movimento informado", ytd: "-" },
      { label: "(-) Depreciacao e amortizacao", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
      { label: "= EBITDA", amount: ebitda, percent: percent(ebitda, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
      { label: "= EBIT", amount: ebit, percent: percent(ebit, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
      { label: "BLOCO 4 - RESULTADO FINANCEIRO", type: "section" },
      { label: "(+) Receitas financeiras", amount: 0, percent: "0%", type: "normal", variation: "Nao informada", ytd: "-" },
      { label: "(-) Despesas financeiras", amount: financialExpenses, percent: percent(financialExpenses, revenue), type: "normal", variation: data.financialExpenses ? "Informado MB" : "Nao informada", ytd: "-" },
      { label: "= Resultado antes do IR / LAIR", amount: lair, percent: percent(lair, revenue), type: "subtotal", variation: "Subtotal", ytd: "-" },
      { label: "BLOCO 5 - IMPOSTOS E LUCRO", type: "section" },
      { label: "(-) IR / CSLL", amount: 0, percent: "0%", type: "normal", variation: "Nao aplicavel/informado", ytd: "-" },
      { label: "= Lucro liquido gerencial", amount: result, percent: percent(result, revenue), type: "total", variation: "Resultado", ytd: "-" }
    ];
  }

  function buildCashFlow(data) {
    const revenue = Number(data.revenue || 0);
    const expenses = Number(data.expenses || 0);
    const cash = Number(data.cash || 0);
    if (!revenue && !expenses && !cash) return [];
    const taxes = Number(data.taxes || 0);
    const opening = Number(data.openingBalance || Math.max(cash - (revenue - expenses), 0));
    const receipts = Number(data.receipts || revenue);
    const payments = Number(data.payments || Math.max(expenses - taxes, 0));
    const closing = Number(data.closingBalance || cash);
    const fco = receipts - payments - taxes;
    const variation = closing - opening;
    const runway = Number(data.runway || (expenses ? cash / (expenses / 30) : 0));
    return [
      { label: "ATIVIDADES OPERACIONAIS (FCO)", type: "section" },
      { label: "(+) Recebimentos de clientes", amount: receipts, reference: "Receita informada", type: "positive" },
      { label: "(-) Pagamentos a fornecedores e despesas", amount: -payments, reference: "Despesas informadas", type: "negative" },
      { label: "(-) Pagamentos de impostos", amount: -taxes, reference: "Fiscal", type: "negative" },
      { label: "= Caixa liquido das atividades operacionais", amount: fco, reference: "FCO", type: "subtotal" },
      { label: "ATIVIDADES DE INVESTIMENTO (FCI)", type: "section" },
      { label: "Investimentos e imobilizado", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
      { label: "= Caixa liquido das atividades de investimento", amount: 0, reference: "FCI", type: "subtotal" },
      { label: "ATIVIDADES DE FINANCIAMENTO (FCF)", type: "section" },
      { label: "Emprestimos, amortizacoes e distribuicoes", amount: 0, reference: "Sem movimento validado no periodo", type: "normal" },
      { label: "= Caixa liquido das atividades de financiamento", amount: 0, reference: "FCF", type: "subtotal" },
      { label: "CONSOLIDADO", type: "section" },
      { label: "Saldo inicial de caixa", amount: opening, reference: "Inicio do periodo", type: "base" },
      { label: "Variacao liquida de caixa", amount: variation, reference: "FCO + FCI + FCF", type: "subtotal" },
      { label: "Saldo final de caixa", amount: closing, reference: "Caixa informado", type: "total" },
      { label: "Folego de caixa", amount: runway, reference: "Dias de cobertura estimada", type: "indicator" }
    ];
  }

  function selectedCompetence(clientId) {
    const session = MBI.auth.currentSession() || {};
    const selected = session.selectedCompetences?.[clientId];
    return selected || listCompetences(clientId)[0]?.value || currentMonth();
  }

  function setSelectedCompetence(clientId, competence) {
    const session = MBI.auth.currentSession();
    if (!session) return;
    session.selectedCompetences = { ...(session.selectedCompetences || {}), [clientId]: normalizeMonth(competence) };
    MBI.storage.setSession(session);
  }

  function listCompetences(clientId) {
    const item = MBI.storage.getDatabase().financials[clientId] || {};
    // A API ja envia a lista completa de competencias (ate 12 meses). Usa ela primeiro.
    if (Array.isArray(item.competences) && item.competences.length) {
      return item.competences
        .map((c) => ({ value: normalizeMonth(c.value || c), label: c.label || monthLabel(c.value || c) }))
        .sort((a, b) => b.value.localeCompare(a.value));
    }
    // Fallback: snapshots locais, periodos da API ou mes atual.
    const values = Object.keys(item.snapshots || {});
    if (Array.isArray(item.periods)) item.periods.forEach((p) => values.push(normalizeMonth(p.competence)));
    if (item.competence) values.push(normalizeMonth(item.competence));
    if (!values.length) values.push(currentMonth());
    return [...new Set(values)]
      .sort((a, b) => b.localeCompare(a))
      .map((value) => ({ value, label: monthLabel(value) }));
  }

  function listPeriods(clientId) {
    const item = MBI.storage.getDatabase().financials[clientId] || {};
    const apiRows = Array.isArray(item.periods) ? item.periods.map((row) => ({
      ...row,
      competence: normalizeMonth(row.competence)
    })) : [];
    const rows = apiRows.length ? apiRows : Object.entries(item.snapshots || {}).map(([competence, snapshot]) => ({
      ...snapshot,
      competence: normalizeMonth(competence)
    }));
    if (!rows.length && (item.competence || Number(item.revenue || 0) || Number(item.expenses || 0))) {
      rows.push({ ...item, competence: normalizeMonth(item.competence) });
    }
    return rows
      .sort((a, b) => String(b.competence).localeCompare(String(a.competence)))
      .map((row) => {
        const revenue = Number(row.revenue || 0);
        const expenses = Number(row.expenses || 0);
        const result = Number(row.result ?? (revenue - expenses));
        return {
          ...row,
          revenue,
          expenses,
          result,
          cash: Number(row.cash || 0),
          label: monthLabel(row.competence),
          margin: revenue ? Math.round((result / revenue) * 1000) / 10 : 0
        };
      });
  }

  function monthsFromSnapshots(item) {
    return Object.entries(item.snapshots || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([competence, snapshot]) => [monthLabel(competence), Number(snapshot.revenue || 0) / 1000, Number(snapshot.expenses || 0) / 1000]);
  }

  function normalize(data, clientId) {
    if (!data) return data;
    const competence = normalizeMonth(data.competence || selectedCompetence(clientId));
    // Recalcula o resultado quando vier zerado mas houver receita/despesa (evita "R$ 0"
    // com faturamento positivo). Usa o valor informado quando ele for diferente de zero.
    const computedResult = Number(data.revenue || 0) - Number(data.expenses || 0);
    const result = Number(data.result) || computedResult;
    const margin = Number(data.revenue || 0) ? Math.round((result / Number(data.revenue || 0)) * 1000) / 10 : 0;
    // Fonte de verdade do score = backend (server-supabase.js::calculateFinancialScore).
    // Quando o dado veio do servidor (score + breakdown presentes), usamos os dois JUNTOS
    // para o numero e o radar nunca se contradizerem. calculateScore local so atua offline/demo.
    const hasServerScore = data.score != null && Array.isArray(data.scoreBreakdown) && data.scoreBreakdown.length > 0;
    const score = hasServerScore
      ? { total: Number(data.score), dimensions: data.scoreBreakdown }
      : calculateScore({ ...data, result, margin });
    const withComputed = {
      ...data,
      competence,
      competenceLabel: monthLabel(competence),
      competences: listCompetences(clientId),
      result,
      margin,
      score: score.total,
      scoreBreakdown: score.dimensions,
      dre: data.dre?.length ? data.dre : buildDre({ ...data, result, margin, competence }),
      cashBridge: data.cashBridge?.length ? data.cashBridge : buildCashFlow({ ...data, result, margin, competence })
    };
    withComputed.months = monthsFromSnapshots(MBI.storage.getDatabase().financials[clientId] || {});
    if (!withComputed.months.length && data.months?.length) withComputed.months = data.months;
    withComputed.cashMonths = cashFlowFromSnapshots(MBI.storage.getDatabase().financials[clientId] || {});
    return withComputed;
  }

  // Serie mensal de fluxo de caixa: [label, entradas, saidas] (em milhares, p/ o grafico)
  function cashFlowFromSnapshots(item) {
    return Object.entries(item.snapshots || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([competence, s]) => {
        const revenue = Number(s.revenue || 0);
        const expenses = Number(s.expenses || 0);
        const taxes = Number(s.taxes || 0);
        const inflow = Number(s.receipts || revenue);
        const outflow = Number(s.payments || Math.max(expenses - taxes, 0)) + Number(s.cashTaxes || taxes);
        return [monthLabel(competence), inflow / 1000, outflow / 1000];
      });
  }

  function get(clientId) {
    const db = MBI.storage.getDatabase();
    const item = db.financials[clientId] || {};
    const competence = selectedCompetence(clientId);
    const snapshot = item.snapshots?.[competence] || item;
    return normalize({
      revenue: 0,
      expenses: 0,
      result: 0,
      cash: 0,
      margin: 0,
      taxes: 0,
      payroll: 0,
      score: 0,
      operationalScore: 0,
      runway: 0,
      investmentCapacity: 0,
      dre: [],
      cashBridge: [],
      months: [],
      insights: ["Aguardando analise da equipe MB para esta competencia."],
      ...snapshot,
      snapshots: item.snapshots || {},
      competence
    }, clientId);
  }

  function update(clientId, payload) {
    const competence = normalizeMonth(payload.competence);
    const data = MBI.storage.updateDatabase((db) => {
      db.financials[clientId] = db.financials[clientId] || {};
      const container = db.financials[clientId];
      const client = db.clients.find((item) => item.id === clientId);
      if (client && payload.nextReview) client.nextReview = payload.nextReview;
      container.snapshots = container.snapshots || {};
      const snapshot = { ...(container.snapshots[competence] || container), competence };
      Object.entries(payload).forEach(([key, value]) => {
        if (["clientId"].includes(key)) return;
        const numeric = ["revenue", "expenses", "taxes", "payroll", "cash", "score", "operationalScore", "runway", "investmentCapacity", "marginTarget", "workingCapitalDays", "directCosts", "adminExpenses", "salesExpenses", "financialExpenses", "openingBalance", "receipts", "payments", "cashTaxes", "closingBalance"].includes(key);
        snapshot[key] = numeric ? Number(value || 0) : value;
      });
      snapshot.result = Number(snapshot.revenue || 0) - Number(snapshot.expenses || 0);
      snapshot.margin = snapshot.revenue ? Math.round((snapshot.result / snapshot.revenue) * 1000) / 10 : 0;
      const score = calculateScore(snapshot);
      snapshot.score = score.total;
      snapshot.scoreBreakdown = score.dimensions;
      snapshot.dre = buildDre(snapshot);
      snapshot.cashBridge = buildCashFlow(snapshot);
      container.snapshots[competence] = snapshot;
      Object.assign(container, snapshot);
      return snapshot;
    });
    setSelectedCompetence(clientId, competence);
    MBI.services.audit.log("Atualizou indicadores", MBI.services.clients.get(clientId)?.name || clientId, `Competencia ${monthLabel(competence)}`, MBI.auth.currentUser()?.name);
    return data;
  }

  function approveInsight(approvalId) {
    return MBI.storage.updateDatabase((db) => {
      const item = db.approvals.find((row) => row.id === approvalId);
      if (!item) return null;
      item.status = "Aprovado";
      return item;
    });
  }

  MBI.services.finance = { get, update, approveInsight, currentMonth, listCompetences, listPeriods, selectedCompetence, setSelectedCompetence, monthLabel };
})();
