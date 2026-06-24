(function () {
  window.MBI = window.MBI || {};

  // ESQUELETO DE PRIMEIRO CARREGAMENTO — sem dados ficticios.
  // Os dados reais (clientes, documentos, financas, usuarios, etc.) vem SEMPRE
  // do Supabase via MBI.sync apos o login. Este seed so garante a estrutura
  // (chaves) e a configuracao de planos para a tela publica de contratacao.
  //
  // IMPORTANTE: 'version' funciona como cache-buster do localStorage. Ao mudar
  // a estrutura/dados deste seed, BUMPAR a version -> todo navegador descarta o
  // banco local antigo (inclusive demo gravado) e recria a partir daqui.
  MBI.seed = {
    version: 8,
    plans: [
      {
        id: "basico",
        name: "Básico",
        price: 500,
        tagline: "Contabilidade, fiscal e folha: seus documentos e guias para download.",
        modules: ["Documentos", "Guias", "DAS", "Fiscal", "Folha", "Comunicacao"],
        color: "status-warning"
      },
      {
        id: "gestao",
        name: "Gestão",
        price: 770,
        tagline: "Tudo do Básico + dashboard financeiro, indicadores, score e radar.",
        modules: ["Documentos", "Fiscal", "Folha", "Faturamento", "Dashboard", "Score", "Indicadores", "Radar"],
        color: "status-ok"
      }
    ],
    config: {},
    clients: [],
    companies: [],
    users: [],
    financials: {},
    documents: [],
    imports: [],
    tasks: [],
    approvals: [],
    messages: [],
    audit: []
  };
})();
