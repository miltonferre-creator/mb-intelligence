"use strict";
// PROVA DE ISOLAMENTO ENTRE CLIENTES (P0) contra uma API real.
// Loga como o cliente A e tenta ACESSAR dado do cliente B em cada endpoint
// sensivel; o esperado e 403 (ou lista vazia/escopada), nunca o dado de B.
//
// Requer um ambiente de STAGING (NUNCA producao). Defina:
//   MBI_TEST_API_URL        ex.: https://staging-mb-intelligence.vercel.app
//   MBI_TEST_TOKEN_CLIENT_A  access_token (Supabase) de um usuario do cliente A
//   MBI_TEST_CLIENT_ID_B     id do cliente B (que A NAO pode acessar)
// Sem essas variaveis, a suite e PULADA (nao falha) com mensagem clara.
const test = require("node:test");
const assert = require("node:assert/strict");

const API = process.env.MBI_TEST_API_URL;
const TOKEN_A = process.env.MBI_TEST_TOKEN_CLIENT_A;
const CLIENT_B = process.env.MBI_TEST_CLIENT_ID_B;

const ready = Boolean(API && TOKEN_A && CLIENT_B);
const skip = ready ? false : "defina MBI_TEST_API_URL, MBI_TEST_TOKEN_CLIENT_A e MBI_TEST_CLIENT_ID_B (staging) para rodar";

async function asClientA(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${TOKEN_A}`, "Content-Type": "application/json", ...(options.headers || {}) }
  });
  let body = null;
  try { body = await res.json(); } catch (_) { /* corpo vazio */ }
  return { status: res.status, body };
}

test("GET /finance/{B} com token de A retorna 403", { skip }, async () => {
  const { status } = await asClientA(`/finance/${CLIENT_B}`);
  assert.equal(status, 403);
});

test("GET /documents?clientId=B com token de A nao vaza documentos de B", { skip }, async () => {
  const { status, body } = await asClientA(`/documents?clientId=${CLIENT_B}`);
  // Aceitavel: 403, OU 200 com lista vazia/escopada ao proprio cliente.
  if (status === 200) {
    const docs = Array.isArray(body?.data) ? body.data : [];
    assert.equal(docs.filter((d) => d.clientId === CLIENT_B).length, 0, "vazou documento do cliente B");
  } else {
    assert.equal(status, 403);
  }
});

test("GET /clients/{B} com token de A retorna 403", { skip }, async () => {
  const { status } = await asClientA(`/clients/${CLIENT_B}`);
  assert.equal(status, 403);
});

test("PATCH /finance/{B} com token de A e bloqueado (403)", { skip }, async () => {
  const { status } = await asClientA(`/finance/${CLIENT_B}`, { method: "PATCH", body: JSON.stringify({ revenue: 1 }) });
  assert.ok([401, 403, 404].includes(status), `esperado bloqueio, veio ${status}`);
});
