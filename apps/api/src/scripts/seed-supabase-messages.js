const path = require("node:path");
const { loadEnv } = require("../lib/env");
const { supabaseRequest } = require("../lib/supabase-client");

loadEnv(path.resolve(__dirname, "../../.env"));

const messages = [
  {
    id: "77777777-1111-4111-8111-111111111111",
    client_id: "11111111-1111-4111-8111-111111111111",
    sender_id: null,
    sender_label: "MB",
    content: "Seu relatorio financeiro de maio foi atualizado e ja esta disponivel no portal."
  },
  {
    id: "77777777-2222-4222-8222-222222222222",
    client_id: "11111111-1111-4111-8111-111111111111",
    sender_id: null,
    sender_label: "Cliente",
    content: "Vamos enviar o extrato complementar ainda hoje."
  },
  {
    id: "77777777-3333-4333-8333-333333333333",
    client_id: "22222222-2222-4222-8222-222222222222",
    sender_id: null,
    sender_label: "MB",
    content: "Identificamos erro de colunas no CSV de despesas. Reenvie com data, descricao, valor e categoria."
  },
  {
    id: "77777777-4444-4444-8444-444444444444",
    client_id: "33333333-3333-4333-8333-333333333333",
    sender_id: null,
    sender_label: "MB",
    content: "Para concluir o onboarding, envie o contrato social e os XMLs da ultima competencia."
  }
];

async function main() {
  const result = await supabaseRequest("/rest/v1/messages?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: messages
  });
  console.log(JSON.stringify({ seededMessages: result.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
