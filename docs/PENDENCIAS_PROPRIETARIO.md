# Pendências que exigem ação do proprietário (recurso/decisão externa)

O código e a configuração possíveis já foram implementados. Os itens abaixo
dependem de credenciais, contratação ou ajustes em painéis externos — não há
como concluí-los só por código.

## 1. Proibir push direto na `master` (PR obrigatório) — fecha P1-CI
- **Onde:** GitHub → Settings → Branches → Branch protection rules → `master`.
- **Marcar:** "Require a pull request before merging" e "Require status checks
  to pass" selecionando o check **CI / Lint + Testes** (workflow já criado em
  `.github/workflows/ci.yml`).
- **Status:** ⛔ requer ação do proprietário (config de repositório).

## 2. Staging com banco próprio (P0) — staging hoje compartilha produção
- Criar um **segundo projeto Supabase** (staging) e rodar as migrações
  `infra/supabase/migrations/*` nele.
- Na Vercel, em **Settings → Environment Variables**, definir `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` **por ambiente** (Production
  = projeto de produção; Preview/branch `staging` = projeto de staging).
- **Status:** ⛔ requer ação do proprietário (criar projeto + variáveis).

## 3. Rodar a prova de isolamento de tenant contra staging
- Na Vercel/Supabase de staging, gerar dois usuários (cliente A e cliente B).
- No GitHub → Settings → Secrets and variables → Actions, criar:
  `MBI_TEST_API_URL`, `MBI_TEST_TOKEN_CLIENT_A`, `MBI_TEST_CLIENT_ID_B`.
- O CI passa a rodar `tests/integration/tenant-isolation.test.js` de verdade.
- **Status:** ⛔ requer staging (item 2) + segredos.

## 4. Travar o CORS no domínio
- Definir `MBI_CORS_ORIGIN=https://<dominio-do-app>` nas variáveis da Vercel.
  (O código já lê essa variável; o default inseguro `*` deixa de valer.)
- **Status:** ⛔ requer ação do proprietário (definir o valor).

## 5. Observabilidade (Sentry) — scaffolding pronto
- **Backend:** instalar `@sentry/node`, inicializar e expor em
  `global.__mbiSentry`; o `logError()` já encaminha as falhas 500.
- **Front:** carregar o SDK do Sentry antes de `app.js`; `MBI.observability`
  já chama `window.Sentry.captureException`.
- Definir `SENTRY_DSN`.
- **Status:** ⛔ requer conta/SDK (código de integração já preparado).

## 6. Rotacionar segredos
- PAT do GitHub, `service_role` do Supabase e tokens que trafegaram em chat
  devem ser **revogados e regerados**.
- **Status:** ⛔ requer ação do proprietário.

## 7. Médio/longo prazo (planejado, fora do escopo desta rodada)
- **Defesa em profundidade no banco:** manter `service_role`, mas mover rotas
  críticas para o token do usuário e validar as policies RLS por teste.
- **Unificar modelo de dados:** Supabase como fonte única; localStorage só como
  cache de leitura (remove a maior fonte de bugs).
- **Build leve (Vite) + TypeScript incremental:** módulos ESM, minificação e
  *hashing* de assets — acaba o problema de cache velho/tela antiga.
- **Design tokens + quebrar `styles.css`;** teste visual (Playwright).
- **Validação de entrada com `zod`** no backend; **LGPD** completa
  (exclusão/portabilidade/consentimento/retenção).
