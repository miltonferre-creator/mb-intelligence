# PROMPT MASTER — MB Intelligence · Implementação Completa
## Envie este documento inteiro para a IA que fará as correções

---

## CONTEXTO DO PROJETO

Você está trabalhando no **MB Intelligence**, uma plataforma SaaS de inteligência financeira
para pequenas e médias empresas. A MB Empresas Assessoria vende o produto em 3 planos:
- **Contabilidade** — R$ 800/mês (documentos, DAS, guias fiscais)
- **Financeiro IA** — R$ 1.200/mês (dashboard gerencial, faturamento, gráficos, IA)
- **CFO as a Service** — R$ 2.000/mês (DRE completa, DFC 3 seções, score, análise executiva)

A plataforma está rodando em produção conectada ao Supabase. O código é real, funcional e
em uso. Você precisa corrigir bugs críticos e implementar funcionalidades essenciais que estão
faltando.

---

## STACK TECNOLÓGICA

```
Frontend : Vanilla JS (SPA com hash router, sem framework)
Backend  : Node.js HTTP nativo (sem Express), porta 3333
Banco    : Supabase (PostgreSQL + Auth JWT ES256 + Storage)
Auth     : Supabase Auth, tokens Bearer, 1h de expiração
Multi-tenant: MB vê todos os clientes; cliente vê apenas o próprio
```

---

## ESTRUTURA DE ARQUIVOS

```
apps/
  web/
    app.js                          ← Router SPA + handleSubmit + handleClick + printReport
    src/
      pages/
        client-pages.js             ← Todas as telas do portal do cliente
        admin-pages.js              ← Todas as telas administrativas da MB
        auth-pages.js               ← Login e registro
      core/
        sync.js                     ← Sincronização remoto → localStorage
      services/                     ← finance, clients, documents, imports, users, plans, audit
      data/
        seed.js                     ← Dados iniciais (3 clientes, 8 usuários, financeiros)
  api/
    src/
      server-supabase.js            ← Servidor HTTP + todos os endpoints REST
      lib/
        supabase-client.js          ← Wrapper do Supabase REST API
        env.js                      ← Carregamento de .env
        http.js                     ← Helpers ok/error/created/readBody
infra/
  supabase/
    migrations/
      0001_initial_schema.sql       ← Schema completo do banco (14 tabelas)
```

---

## BANCO DE DADOS — TABELAS PRINCIPAIS

```sql
-- Dados financeiros mensais de cada cliente
financial_snapshots (
  id uuid PK,
  client_id uuid FK clients,
  company_id uuid FK companies,
  competence date NOT NULL,           -- ← MÊS/ANO do fechamento
  revenue numeric(14,2),
  expenses numeric(14,2),
  result numeric GENERATED (revenue - expenses),
  cash numeric(14,2),
  margin numeric GENERATED,
  taxes numeric(14,2),
  payroll numeric(14,2),
  financial_score integer,
  operational_score integer,
  runway_days integer,
  investment_capacity numeric(14,2),
  confidence text,
  status text,
  UNIQUE(client_id, company_id, competence)   -- ← um registro por mês por cliente
)

-- DRE (cabeçalho + linhas separadas)
dre_reports (id, client_id, company_id, competence, status, approved_by, approved_at)
dre_report_lines (id, report_id, sort_order, account, amount, revenue_percent, line_type)

-- Fluxo de Caixa
cash_flow_reports (
  id, client_id, company_id, competence,
  opening_balance, receipts, payments, taxes, closing_balance, runway_days, status
)

-- Aprovações de IA/análises
ai_insights (
  id, client_id, competence, title, content, source_data jsonb,
  confidence, status, reviewed_by, reviewed_at, published_at
)
-- OBS: a tabela no banco é ai_insights, mas o produto usa /approvals como endpoint
-- e a tabela approvals no localStorage espelha ai_insights

-- Documentos publicados pela MB
documents (id, client_id, competence, category, document_type, file_name,
           storage_bucket, storage_path, status, visibility, uploaded_by)

-- Tarefas/pendências
tasks (id, client_id, title, priority, owner_id, due_date, status, origin)

-- Mensagens cliente ↔ MB
messages (id, client_id, sender_id, sender_label, content, created_at)

-- Auditoria
audit_logs (id, user_id, user_name, action, target, result, created_at)
```

---

## DADOS DE SEED (3 CLIENTES DE TESTE)

```
Comércio Silva LTDA  → planId: "cfo"          → email: cfo@cliente.com      / senha: 123456
Clínica Norte PME    → planId: "financeiro"   → email: financeiro@cliente.com / senha: 123456
Serviços Prime ME    → planId: "contabilidade" → email: contabilidade@cliente.com / senha: 123456

MB Admin             → email: admin@mbempresas.com.br / senha: 123456
```

---

## ENDPOINTS API EXISTENTES

```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/register-client

GET    /plans
PATCH  /plans/:id

GET    /clients
POST   /clients
PATCH  /clients/:id

GET    /finance              ← batch: todos os clientes (MB)
GET    /finance/:clientId    ← dados financeiros de 1 cliente
PATCH  /finance/:clientId    ← atualizar snapshot financeiro ← PROBLEMA AQUI

GET    /documents
GET    /documents/:id/download
POST   /documents

GET    /imports
POST   /imports

GET    /tasks
POST   /tasks

GET    /approvals            ← lista ai_insights
POST   /approvals            ← cria ai_insight
PATCH  /approvals/:id        ← ⛔ NÃO IMPLEMENTADO → retorna 404

GET    /messages
POST   /messages

GET    /users
POST   /users

GET    /audit
```

---

## ⛔ BUG #1 — CRÍTICO: PATCH /approvals/:id não existe

**Arquivo:** `apps/api/src/server-supabase.js`

**Problema:** A rota `PATCH /approvals/:id` não foi implementada. O formulário de aprovação
no admin (`approval-review`) submete para essa rota e sempre recebe HTTP 404. Nenhuma
aprovação/rejeição de análise de IA pode ser salva via API.

**O que o frontend envia (app.js linha ~245):**
```javascript
await MBI.api.request(`/approvals/${data.approvalId}`, {
  method: "PATCH",
  body: {
    status: data.status,        // "Aprovado" | "Rejeitado" | "Editar antes de liberar"
    text: data.text,            // texto da análise editado
    reviewNotes: data.reviewNotes
  }
})
```

**O que precisa ser implementado no servidor:**
A função `handleApprovals` (ou onde os approvals são tratados) precisa de um branch
`PATCH` que:
1. Verifica autenticação MB (requireMb)
2. Busca o registro em `ai_insights` por ID
3. Atualiza: `content` (=text), `status`, `reviewed_by` (profile.id), `reviewed_at` (now())
4. Se status === "Aprovado", define `published_at = now()`
5. Retorna o registro atualizado

**Mapeamento de campos (approvals API → ai_insights tabela):**
```
approvalId   → id
clientId     → client_id
title        → title
text         → content
confidence   → confidence
status       → status  (valores: "Aguardando aprovacao", "Aprovado", "Rejeitado", "Editar antes de liberar")
owner        → reviewed_by (UUID do user_profile)
reviewNotes  → source_data.reviewNotes (jsonb) ou coluna separada
```

---

## ⛔ BUG #2 — BLOQUEANTE: Sem dimensão temporal — sistema não acumula histórico

**Este é o problema raiz do produto. Tudo mais depende da solução disso.**

### 2A. Campo `competence` ausente no formulário "Alimentar Portal"

**Arquivo:** `apps/web/src/pages/admin-pages.js` — função `publicationCenter()`

**Problema:** O formulário `data-form="update-finance"` tem 11 campos mas **não tem campo
de competência**. A MB preenche dados de Junho/2026 mas o sistema não sabe que são de Junho.

**Solução:** Adicionar campo de competência antes dos campos financeiros:
```html
<label>
  <span>Competência (mês de referência)</span>
  <input
    type="month"
    name="competence"
    value="${new Date().toISOString().slice(0, 7)}"
    required
  >
</label>
```
O valor deve ser o mês atual dinâmico (`new Date().toISOString().slice(0, 7)`), não hardcoded.

### 2B. PATCH /finance sobrescreve sempre — nunca cria novo mês

**Arquivo:** `apps/api/src/server-supabase.js` — função `handleFinance()`, bloco PATCH

**Código atual (problema):**
```javascript
// Linha ~874 — sempre busca o snapshot mais recente e SOBRESCREVE
const existing = await rest(
  `/financial_snapshots?client_id=eq.${clientId}&select=id&order=competence.desc&limit=1`
);
rows = existing[0]
  ? await rest(`/financial_snapshots?id=eq.${existing[0].id}`, { method: "PATCH", body: payload })
  : await rest("/financial_snapshots", { method: "POST", body: [{ client_id: clientId, competence: new Date().toISOString().slice(0, 10), ...payload }] });
```

**Código corrigido (lógica que precisa ser implementada):**
```javascript
// Receber competência do body (ex: "2026-06" → converter para "2026-06-01")
const competenceRaw = body.competence; // "2026-06" vindo do input[type=month]
const competence = competenceRaw
  ? `${competenceRaw}-01`
  : new Date().toISOString().slice(0, 10);

// Verificar se já existe snapshot para ESTA competência específica
const existing = await rest(
  `/financial_snapshots?client_id=eq.${clientId}&competence=eq.${competence}&select=id&limit=1`
);

// Obter company_id do cliente
const companyRow = await rest(`/companies?client_id=eq.${clientId}&select=id&limit=1`);
const companyId = companyRow[0]?.id || null;

rows = existing[0]
  ? await rest(`/financial_snapshots?id=eq.${existing[0].id}`, { method: "PATCH", body: payload })
  : await rest("/financial_snapshots", {
      method: "POST",
      body: [{ client_id: clientId, company_id: companyId, competence, ...payload }]
    });
```

**Resultado esperado:** cada mês fica como um registro separado no banco.
A tabela `financial_snapshots` tem `UNIQUE(client_id, company_id, competence)` — o banco
garante integridade.

### 2C. Campo competência também no `handleFinance` GET — retornar mês selecionado

**Problema adicional:** o GET de /finance/:clientId busca sempre o snapshot mais recente
(`order=competence.desc&limit=1`). Quando o produto tiver múltiplos meses, o cliente
precisa poder ver um mês específico.

**Solução:** aceitar query param `?competence=2026-05`:
```javascript
// No handleFinance GET
const { url } = parseUrl(req);
const requestedCompetence = url.searchParams.get("competence"); // "2026-05"

const competenceFilter = requestedCompetence
  ? `&competence=eq.${requestedCompetence}-01`
  : `&order=competence.desc&limit=1`;

const rows = await rest(
  `/financial_snapshots?client_id=eq.${clientId}&select=*${competenceFilter}`
);
```

---

## ⛔ BUG #3 — GRAVE: Competência hardcoded nos uploads

**Arquivos:** `apps/web/src/pages/admin-pages.js` — funções `documents()` e `imports()`

**Problema:** Campos de competência nos formulários de upload usam valor fixo `"2026-06"`:
```html
<!-- admin-pages.js — documentos e importações -->
<input type="month" name="competence" value="2026-06">
```

**Solução:** Substituir pelo mês atual dinâmico:
```javascript
// Calcular no início da função
const currentMonth = new Date().toISOString().slice(0, 7); // "2026-05"

// Nos inputs:
`<input type="month" name="competence" value="${currentMonth}">`
```

Aplicar em AMBAS as funções: `documents()` e `imports()` em admin-pages.js,
e também em `documents()` em client-pages.js.

---

## ⚠ BUG #4 — GRAVE: Filas operacionais hardcoded no Cockpit MB

**Arquivo:** `apps/web/src/pages/admin-pages.js` — função `operationV2()`

**Problema:** A tabela de filas operacionais usa valores fixos no código:
```javascript
// Linha ~118 — valores NUNCA mudam independente dos dados reais
MBI.ui.table(["Fila", "Volume", "Prioridade", "Responsavel", "Status"], [
  ["Fiscal", "11 guias/XML", "Alta", "Paula", MBI.ui.pill("Atencao")],
  ["Financeiro", `${db.imports.length} importacoes`, "Alta", "Ana", MBI.ui.pill("Em revisao")],
  ["DRE", `${openApprovals.length} aprovacoes`, "Media", "Bruno", MBI.ui.pill("Aguardando")],
  ["Onboarding", `${clients.filter((c) => c.status === "Onboarding").length} clientes`, "Alta", "Carla", MBI.ui.pill("Pendente")]
])
```

**Problema específico:** "11 guias/XML" é texto fixo. "Paula", "Ana", "Bruno", "Carla"
são nomes hardcoded (devem vir de `db.users`).

**Solução:** Calcular volumes reais:
```javascript
const mbUsers = db.users.filter(u => u.type === "mb");
const getUser = (role) => mbUsers.find(u => u.role?.toLowerCase().includes(role))?.name || "MB";

const fiscalDocs = db.documents.filter(d =>
  /fiscal|das|xml/i.test(`${d.category} ${d.name}`) && d.status !== "Disponivel"
).length;

const fiscalUser  = getUser("fiscal");
const finUser     = getUser("financ") || getUser("analist");
const cfoUser     = getUser("cfo") || getUser("consultor");
const opsUser     = getUser("operac") || getUser("gestora");

// Substituir na tabela:
[
  ["Fiscal", `${fiscalDocs} documento(s)`, "Alta", fiscalUser,
    MBI.ui.pill(fiscalDocs > 0 ? "Atenção" : "Em dia")],
  ["Financeiro", `${db.imports.filter(i => i.status?.includes("Aguard")).length} importação(ões)`,
    "Alta", finUser, MBI.ui.pill("Em revisão")],
  ["DRE/Aprovações", `${openApprovals.length} pendente(s)`, "Média", cfoUser,
    MBI.ui.pill(openApprovals.length > 0 ? "Aguardando" : "Em dia")],
  ["Onboarding", `${clients.filter(c => c.status === "Onboarding").length} cliente(s)`,
    "Alta", opsUser, MBI.ui.pill(clients.filter(c=>c.status==="Onboarding").length > 0 ? "Pendente" : "Em dia")]
]
```

---

## ⚠ BUG #5 — FUNCIONAL: CNPJ/CRC da MB nunca preenchido no relatório impresso

**Arquivo:** `apps/web/app.js` — função `printReport()`

**Problema:** O relatório impresso (DRE e Fluxo de Caixa) exibe literalmente:
`"CNPJ/CRC: informar nos parâmetros oficiais da MB"`

**Solução:** Criar constantes de configuração da MB no início do `app.js` ou em
`src/data/seed.js`:
```javascript
// Em seed.js ou no topo de app.js
MBI.config = {
  companyName: "MB Empresas Assessoria Ltda",
  cnpj: "XX.XXX.XXX/0001-XX",   // preencher com o CNPJ real da MB
  crc: "CRC/CE XXXXXX/O-X",      // preencher com o CRC real
  address: "Fortaleza/CE"
};

// Em printReport():
`<p>MB Empresas Assessoria · CNPJ: ${MBI.config.cnpj} · ${MBI.config.crc}</p>`
```

---

## ⚠ BUG #6 — FUNCIONAL: Insight técnico exibido ao cliente

**Arquivo:** `apps/api/src/server-supabase.js` — função `financialInsights()`

**Problema:** Quando dados insuficientes, o produto retorna:
`["Dados financeiros insuficientes para uma analise gerencial completa."]`
Esta mensagem técnica aparece no painel do cliente pagante como "IA MB".

**Solução:** Filtrar mensagens técnicas antes de expor ao cliente:
```javascript
// Em financialInsights() — alterar a primeira linha do return quando sem dados:
if (!revenue) return ["Aguardando envio de dados financeiros para liberar análise gerencial."];
```

E no sync/frontend, filtrar qualquer insight que contenha termos técnicos:
```javascript
// Em client-pages.js — onde insights são exibidos:
const safeInsights = (data.insights || []).filter(text =>
  !/carregados do supabase|base local|insuficientes para/i.test(text)
);
```

---

## ⚠ BUG #7 — FUNCIONAL: nextReview hardcoded no Onboarding

**Arquivo:** `apps/web/src/pages/client-pages.js` — função `onboarding()`

**Problema:**
```javascript
const nextReview = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
```
Sempre calcula como "hoje + 7 dias" sem referência ao banco.

**Solução no banco:** Adicionar coluna `next_review_at date` na tabela `clients`.
**Solução temporária (sem migração):** Usar `client.nextReview` se existir, senão calcular:
```javascript
const nextReview = client.nextReview
  ? new Date(client.nextReview).toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit"})
  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("pt-BR", {day:"2-digit", month:"2-digit"});
```

---

## 🆕 FUNCIONALIDADE NOVA #1 — Seletor de Competência nas telas de Inteligência

### O que precisa ser implementado:

Nas telas de Inteligência Financeira (client-pages.js e admin-pages.js), adicionar um
seletor de mês/ano que permita navegar entre competências disponíveis.

**No frontend (client-pages.js — função `intelligence()`):**
```javascript
function intelligence(client) {
  const data = MBI.services.finance.get(client.id);
  // Adicionar seletor no topo do cockpit:
  const availableMonths = data.allMonths || []; // lista de competências disponíveis
  const selectedMonth = data.selectedCompetence || (data.months?.at(-1)?.[0]) || "Atual";

  const periodSelector = availableMonths.length > 1 ? `
    <div class="period-selector">
      <label>
        <span>Competência</span>
        <select data-action="select-competence">
          ${availableMonths.map(m =>
            `<option value="${m.competence}" ${m.label === selectedMonth ? "selected" : ""}>
              ${m.label}
            </option>`
          ).join("")}
        </select>
      </label>
    </div>
  ` : `<div class="period-badge">Competência: <strong>${selectedMonth}</strong></div>`;

  // Adicionar periodSelector no início do return
}
```

**No servidor (server-supabase.js — financeToApi()):**
```javascript
// Adicionar ao objeto de retorno:
allMonths: (historyRows || [])
  .filter(r => Number(r.revenue || 0) || Number(r.expenses || 0))
  .sort((a, b) => String(b.competence).localeCompare(String(a.competence)))
  .map(r => ({
    competence: String(r.competence).slice(0, 7), // "2026-05"
    label: formatCompetenceMonth(r.competence)     // "mai/26"
  })),
selectedCompetence: historyRows?.[0]
  ? formatCompetenceMonth(historyRows[0].competence)
  : "Atual"
```

**No app.js — handleClick:**
```javascript
if (action.dataset.action === "select-competence") {
  const competence = action.value;
  // Recarregar dados do cliente para a competência selecionada
  MBI.services.finance.loadForCompetence(client.id, competence);
  render();
}
```

---

## 🆕 FUNCIONALIDADE NOVA #2 — DRE e DFC para Plano Financeiro IA

**Problema:** Clínica Norte (Financeiro IA, R$1.200/mês) tem `dre: []` e `cashBridge: []`.
O produto não exibe DRE nem DFC para este plano mesmo que os dados existam.

**Onde corrigir:** `apps/api/src/server-supabase.js` — função `financeToApi()`

**Lógica atual:**
```javascript
dre: buildProfessionalDre(row, dreLines),         // dreLines vem de dre_report_lines
cashBridge: buildCashFlowReport(row, cashRow),     // cashRow vem de cash_flow_reports
```

**Problema:** Se não há `dre_report_lines` e não há `cash_flow_reports` no banco
para o cliente Financeiro IA, essas funções retornam arrays vazios ou `[]`.

**Solução:** `buildProfessionalDre(row, dreLines)` já funciona **mesmo sem dreLines** —
ela calcula tudo a partir de `row` (revenue, expenses, taxes, payroll). O problema é
que o servidor só chama essa função para o plano CFO? Verificar e garantir que **todos
os planos** que têm dados financeiros recebam DRE calculada.

Verificar em `financeToApi()` se há alguma condição por planId. Se não houver, o
problema está nos dados: Clínica Norte provavelmente tem `revenue=0` ou `expenses=0`
no banco, então a DRE calcula zerada.

**Ação:** Garantir que `Clínica Norte` tenha revenue=96500, expenses=70300, taxes=7640,
payroll=22600 no snapshot do Supabase (não apenas no seed.js local).

---

## 🆕 FUNCIONALIDADE NOVA #3 — Filtros de período na tela de Documentos

**Arquivo:** `apps/web/src/pages/client-pages.js` — função `documents()`
**Arquivo:** `apps/web/src/pages/admin-pages.js` — função `documents()`

Adicionar filtro por categoria e mês nos documentos:
```javascript
// No topo da função documents():
const allDocs = MBI.services.documents.listByClient(client.id);
const categories = [...new Set(allDocs.map(d => d.category))];
const months = [...new Set(allDocs.map(d => d.due?.slice(0,7)).filter(Boolean))];

// Selector HTML:
`<div class="filter-bar">
  <label>
    <span>Categoria</span>
    <select data-action="filter-docs-category">
      <option value="">Todas</option>
      ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
  </label>
  <label>
    <span>Competência</span>
    <select data-action="filter-docs-month">
      <option value="">Todas</option>
      ${months.map(m => `<option value="${m}">${m}</option>`).join("")}
    </select>
  </label>
</div>`
```

---

## 🆕 FUNCIONALIDADE NOVA #4 — Campo de busca em Gestão de Clientes

**Arquivo:** `apps/web/src/pages/admin-pages.js` — função `clients()`

Adicionar input de busca sobre a lista:
```javascript
// No topo da tabela de clientes, adicionar:
`<div class="search-bar">
  <input
    type="search"
    placeholder="Buscar por nome, CNPJ ou segmento..."
    data-action="search-clients"
    id="client-search"
  >
</div>`

// A filtragem pode ser client-side com data attributes:
// Adicionar data-search="${client.name} ${client.cnpj} ${client.segment}"
// em cada <tr>, e filtrar por textContent no handleChange
```

---

## RESUMO DAS PRIORIDADES

### 🔴 FAZER AGORA (bloqueia entrega de valor):

| # | O que | Arquivo | Tempo estimado |
|---|-------|---------|----------------|
| 1 | Implementar PATCH /approvals/:id | server-supabase.js | 2–3h |
| 2 | Adicionar campo `competence` no form Alimentar Portal | admin-pages.js publicationCenter() | 30min |
| 3 | PATCH /finance criar novo snapshot por mês (não sobrescrever) | server-supabase.js handleFinance() | 3–4h |
| 4 | Dinamizar default de competência nos uploads | admin-pages.js + client-pages.js | 30min |

### 🟠 FAZER NA PRÓXIMA SPRINT (qualidade e coerência):

| # | O que | Arquivo |
|---|-------|---------|
| 5 | Seletor de competência nas telas de Inteligência | client-pages.js + server-supabase.js |
| 6 | Corrigir filas operacionais hardcoded | admin-pages.js operationV2() |
| 7 | Filtrar insights técnicos visíveis ao cliente | server-supabase.js + client-pages.js |
| 8 | CNPJ/CRC da MB no relatório impresso | app.js printReport() |
| 9 | Filtros de período em Documentos | client-pages.js + admin-pages.js |
| 10 | Campo de busca em Gestão de Clientes | admin-pages.js clients() |

### 🟡 BACKLOG (evolução do produto):

| # | O que |
|---|-------|
| 11 | Gráficos com múltiplos pontos (após ter histórico real) |
| 12 | Score histórico por mês |
| 13 | Interface para criar/editar linhas de DRE e DFC manualmente |
| 14 | Calendário de vencimentos fiscais para plano Contabilidade |
| 15 | Paginação em documentos, importações e auditoria |
| 16 | Validação de CNPJ no cadastro de cliente |
| 17 | Edição e desativação de usuários (PATCH /users/:id) |
| 18 | Exportação de relatórios operacionais em CSV |

---

## COMPORTAMENTO ESPERADO APÓS AS CORREÇÕES PRIORITÁRIAS

### Fluxo da MB para fechar o mês:
1. Acessa **Alimentar Portal**
2. Seleciona cliente (ex: Comércio Silva)
3. Seleciona **competência "2026-06"** no campo novo
4. Preenche: faturamento 195.000, despesas 148.000, etc.
5. Clica "Salvar indicadores"
6. **API cria novo snapshot** para 2026-06-01 (não sobrescreve maio)
7. O gráfico de evolução passa a mostrar **2 pontos**: mai/26 e jun/26
8. O cliente pode navegar entre competências no dashboard

### Fluxo de aprovação de análise de IA:
1. MB cria análise em Alimentar Portal (POST /approvals funciona)
2. Vai para **Aprovações**, edita o texto
3. Seleciona "Aprovado" e clica "Salvar revisão"
4. **API executa PATCH /approvals/:id** (que agora existe)
5. `reviewed_by`, `reviewed_at` e `published_at` são gravados no banco
6. Cliente vê o insight na tela de Inteligência

---

## NOTAS DE ARQUITETURA IMPORTANTES

1. **Multi-tenant**: Use sempre `canAccessClient(profile, clientId)` antes de qualquer
   acesso a dados. Nunca expor dados de cliente A para cliente B.

2. **Supabase REST**: O servidor usa REST direto do Supabase (não SDK).
   Padrão: `await rest("/table?filter=value&select=*")`
   Para PATCH: `await rest("/table?id=eq.${id}", { method: "PATCH", body: {...} })`

3. **GENERATED columns**: `result` e `margin` em `financial_snapshots` são colunas
   GENERATED. **Não incluir no INSERT/UPDATE** — o banco calcula automaticamente.

4. **Fallback local**: O padrão `remoteOrLocal()` em app.js tenta a API primeiro.
   Se falhar com `error.apiUnavailable`, cai para localStorage. Mantenha esse padrão.

5. **Score**: O score financeiro agora é calculado pelo servidor (`calculateFinancialScore()`).
   Não é mais número manual. Não sobrescrever com valor do campo `score` do form —
   o servidor recalcula na hora.

6. **Supabase constraint**: `UNIQUE(client_id, company_id, competence)` na tabela
   `financial_snapshots`. Ao criar novo snapshot, se já existir para aquela competência,
   a API do Supabase retornará erro de conflito (409). Tratar com upsert ou verificar
   antes de criar.

7. **Formato de competência**: O banco armazena como `date` (ex: `2026-06-01`).
   O input HTML `type="month"` retorna `"2026-06"`. A conversão é: `competence + "-01"`.
   A exibição usa `formatCompetenceMonth()` que retorna ex: `"jun/26"`.

---

## PERGUNTAS PARA COMEÇAR

Antes de iniciar, responda:

1. Qual é o arquivo que você quer corrigir primeiro?
   - `server-supabase.js` (BUG #1 PATCH /approvals + BUG #2B PATCH /finance)
   - `admin-pages.js` (BUG #2A campo competência + BUG #3 upload + BUG #4 filas)
   - Todos de uma vez

2. Após as correções, quer que eu adicione o seletor de competência nas telas de
   Inteligência (FUNCIONALIDADE NOVA #1)?

3. Posso fazer as correções diretamente nos arquivos ou prefere que eu mostre
   o diff/patch para revisão antes?

---

*Gerado automaticamente a partir da análise crítica completa do código-fonte.*
*MB Intelligence · Análise v2.0 · Maio/2026*
