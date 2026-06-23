"use strict";
// "Lint" sem dependencias: roda `node --check` em todos os .js do projeto
// (exceto node_modules e libs minificadas). Pega erro de sintaxe em qualquer
// um dos ~17 scripts do front e no backend antes de ir para producao.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = new Set(["node_modules", ".git", ".vercel"]);
const IGNORE_FILES = [/\.min\.js$/i, /lucide/i, /app\.prototype\.js$/i];

function collect(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) collect(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const full = path.join(dir, entry.name);
      if (!IGNORE_FILES.some((re) => re.test(full))) out.push(full);
    }
  }
  return out;
}

const files = collect(ROOT);
let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (err) {
    failed++;
    console.error(`✗ ${path.relative(ROOT, file)}`);
    console.error(String(err.stderr || err.message).trim());
  }
}

console.log(`\nSintaxe: ${files.length - failed}/${files.length} arquivos OK.`);
if (failed) process.exit(1);
