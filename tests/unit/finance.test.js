"use strict";
// Regressao das derivacoes financeiras corrigidas na Parte A (BUG 1, 3, 5),
// no ponto onde os dados saem para o front: financeToApi().
const test = require("node:test");
const assert = require("node:assert/strict");

const { financeToApi } = require("../../apps/api/src/server-supabase.js").__test;

const baseRow = (over = {}) => ({
  competence: "2026-05-01",
  revenue: 100000,
  expenses: 80000,
  result: 20000,
  cash: 100000,
  taxes: 8000,
  payroll: 20000,
  margin: 20,
  ...over
});

test("BUG1: runway deriva do caixa quando runway_days vem ausente (0/null)", () => {
  const api = financeToApi(baseRow({ runway_days: null }), [], null, [baseRow({ runway_days: null })]);
  // cash / (expenses/30) = 100000 / (80000/30) = 37.5 -> arredonda 38
  assert.equal(api.runway, 38);
});

test("BUG1: runway respeita runway_days quando presente", () => {
  const row = baseRow({ runway_days: 45 });
  const api = financeToApi(row, [], null, [row]);
  assert.equal(api.runway, 45);
});

test("BUG1: runway = 0 quando nao ha despesas (evita divisao por zero)", () => {
  const row = baseRow({ runway_days: null, expenses: 0 });
  const api = financeToApi(row, [], null, [row]);
  assert.equal(api.runway, 0);
});

test("BUG3: cada periodo inclui taxes e score (para o delta dos KPIs)", () => {
  const row = baseRow();
  const api = financeToApi(row, [], null, [row]);
  const period = api.periods[0];
  assert.equal(period.taxes, 8000);
  assert.equal(typeof period.score, "number");
  assert.ok(period.score >= 0 && period.score <= 100);
});

test("BUG5: margem do periodo deriva de result/revenue, ignorando coluna placeholder", () => {
  // margin gravado como 20 (placeholder), mas result/revenue real = 30%
  const row = baseRow({ result: 30000, margin: 20 });
  const api = financeToApi(row, [], null, [row]);
  assert.equal(api.periods[0].margin, 30);
});

test("BUG5: margem = 0 quando revenue = 0 (sem divisao por zero)", () => {
  const row = baseRow({ revenue: 0, result: 0, margin: 20 });
  const api = financeToApi(row, [], null, [row]);
  assert.equal(api.periods[0].margin, 0);
});
