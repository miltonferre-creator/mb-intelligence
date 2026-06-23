"use strict";
// Regressao do bug de download "requested path is invalid": o Supabase devolve
// o signedURL relativo SEM /storage/v1, e a montagem precisa adiciona-lo.
const test = require("node:test");
const assert = require("node:assert/strict");

const { buildStorageUrl } = require("../../apps/api/src/server-supabase.js").__test;

// Sem URL configurada nos testes, getConfig().url e "" -> validamos o sufixo.
test("adiciona /storage/v1 quando o signedURL relativo nao tem o prefixo", () => {
  const out = buildStorageUrl("/object/sign/documentos/cli/arq.pdf?token=abc");
  assert.ok(out.includes("/storage/v1/object/sign/documentos/cli/arq.pdf?token=abc"), out);
  assert.ok(!out.includes("/storage/v1/storage/v1"), "nao duplica o prefixo");
});

test("nao duplica /storage/v1 quando ja vem com o prefixo", () => {
  const out = buildStorageUrl("/storage/v1/object/sign/documentos/x?token=t");
  const count = (out.match(/\/storage\/v1/g) || []).length;
  assert.equal(count, 1);
});

test("mantem URL absoluta intacta", () => {
  const abs = "https://proj.supabase.co/storage/v1/object/sign/x?token=t";
  assert.equal(buildStorageUrl(abs), abs);
});

test("retorna null para entrada vazia", () => {
  assert.equal(buildStorageUrl(""), null);
  assert.equal(buildStorageUrl(null), null);
  assert.equal(buildStorageUrl(undefined), null);
});
