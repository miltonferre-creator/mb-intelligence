"use strict";
// Isolamento de tenant (P0): canAccessClient e a unica barreira no codigo,
// porque o backend usa service_role (ignora RLS). Estes testes provam a regra.
const test = require("node:test");
const assert = require("node:assert/strict");

const handler = require("../../apps/api/src/server-supabase.js");
const { canAccessClient } = handler.__test;

test("MB (equipe) acessa qualquer cliente", () => {
  assert.equal(canAccessClient({ type: "mb", client_id: null }, "silva"), true);
  assert.equal(canAccessClient({ type: "mb", client_id: "x" }, "clinica"), true);
});

test("cliente acessa apenas o proprio client_id", () => {
  assert.equal(canAccessClient({ type: "client", client_id: "silva" }, "silva"), true);
});

test("cliente NAO acessa dado de outro cliente (vazamento de tenant)", () => {
  assert.equal(canAccessClient({ type: "client", client_id: "silva" }, "clinica"), false);
  assert.equal(canAccessClient({ type: "client", client_id: "clinica" }, "silva"), false);
});

test("cliente sem client_id nao acessa nenhum cliente", () => {
  assert.equal(canAccessClient({ type: "client", client_id: null }, "silva"), false);
  assert.equal(canAccessClient({ type: "client", client_id: undefined }, "silva"), false);
});
