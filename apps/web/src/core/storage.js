(function () {
  window.MBI = window.MBI || {};

  const SESSION_KEY = "mbi.session.v3";
  const LEGACY_DB_KEY = "mbi.database.v3";

  // Os DADOS vivem em memoria e sao sempre abastecidos pelo Supabase (sync no boot
  // e no login). Nada de dados em localStorage nem seed em JS como fonte.
  // Apenas o TOKEN de sessao permanece no localStorage (para manter o login no F5).
  let memDb = null;

  function emptyDb() {
    return {
      version: 7,
      plans: [],
      clients: [],
      companies: [],
      users: [],
      financials: {},
      documents: [],
      imports: [],
      tasks: [],
      messages: [],
      approvals: [],
      audit: []
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function getDatabase() {
    if (!memDb) memDb = emptyDb();
    return memDb;
  }

  function setDatabase(db) {
    memDb = db || emptyDb();
    return memDb;
  }

  function updateDatabase(mutator) {
    const db = getDatabase();
    const result = mutator(db);
    return result;
  }

  function resetDatabase() {
    memDb = emptyDb();
    return memDb;
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // Remove o antigo cache de dados que ficava no localStorage (migracao para memoria).
  try { localStorage.removeItem(LEGACY_DB_KEY); } catch (error) {}

  MBI.storage = {
    clone,
    nowId,
    getDatabase,
    setDatabase,
    updateDatabase,
    getSession,
    setSession,
    clearSession,
    resetDatabase
  };
})();
