const fs = require("node:fs");
const path = require("node:path");
const { createSeed } = require("../seed");

const dataFile = path.resolve(process.cwd(), process.env.MBI_DATA_FILE || "data/db.json");

function ensureDataFile() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    writeDatabase(createSeed());
  }
}

function readDatabase() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeDatabase(db) {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

function updateDatabase(mutator) {
  const db = readDatabase();
  const result = mutator(db);
  writeDatabase(db);
  return result;
}

function resetDatabase() {
  const db = createSeed();
  writeDatabase(db);
  return db;
}

module.exports = {
  dataFile,
  readDatabase,
  writeDatabase,
  updateDatabase,
  resetDatabase
};
