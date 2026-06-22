(function () {
  window.MBI = window.MBI || {};

  const DB_KEY = "mbi.database.v3";
  const SESSION_KEY = "mbi.session.v3";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function readDatabase() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeDatabase(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function ensureDatabase() {
    const db = readDatabase();
    if (db && db.version === MBI.seed.version) return db;
    const seeded = clone(MBI.seed);
    writeDatabase(seeded);
    return seeded;
  }

  function getDatabase() {
    return ensureDatabase();
  }

  function setDatabase(db) {
    writeDatabase(db);
    return db;
  }

  function updateDatabase(mutator) {
    const db = getDatabase();
    const result = mutator(db);
    writeDatabase(db);
    return result;
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

  function resetDatabase() {
    localStorage.removeItem(DB_KEY);
    return ensureDatabase();
  }

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
