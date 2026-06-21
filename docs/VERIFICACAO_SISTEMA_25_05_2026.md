# MB Intelligence — Relatório de Verificação do Sistema
### Data: 25/05/2026 · Análise ao vivo com API em execução real e Supabase conectado

---

> Esta verificação foi feita **com o sistema rodando**, com login real nos 4 perfis de usuário
> (admin MB, cliente CFO, cliente Financeiro IA, cliente Contabilidade) e teste de cada
> endpoint da API com tokens JWT reais. Os resultados abaixo refletem o estado atual do produto.

---

## RESUMO EXECUTIVO

Desde a análise anterior, **foram implementadas melhorias substanciais**. Vários problemas
críticos que existiam foram resolvidos. O produto está mais robusto. Porém ainda existem
falhas importantes, dados inconsistentes produzidos pelos próprios testes, e funcionalidades
do roadmap que ainda não foram construídas.

| Categoria | Situação |
|---|---|
| Autenticação e segurança | ✅ Funciona corretamente |
| Múltiplos meses por cliente (histórico) | ✅ Implementado e funcional |
| Aprovação de análises | ✅ Implementado e funcional |
| CNPJ/CRC da MB no relatório | ⚠ Estrutura criada, campos vazios |
| Preços dos planos | ⚠ Alterados (divergem do seed original) |
| Dados inconsistentes no banco | ❌ Gerados durante testes, precisam limpeza |
| Score com dados incompletos | ❌ Comportamento problemático identificado |
| Notificações, histórico de score, paginação | ❌ Ainda não implementados |

---

## PARTE 1 — O QUE FOI IMPLEMENTADO E ESTÁ FUNCIONANDO

---

### ✅ 1. Histórico mensal — sistema agora cria múltiplos snapshots

**Verificado:** Ao salvar dados financeiros para junho/2026, o sistema criou um novo
snapshot no banco **sem apagar maio/2026**. O gráfico de evolução agora retorna 2 pontos
reais para o cliente Comércio Silva:

```
months: [["mai de 26", 182.5, 142.19], ["jun de 26", 195.0, 150.0]]
```

O campo `competences` está disponível na resposta da API com a lista de meses disponíveis:
```
competences: [{"value": "2026-06", "label": "jun de 26"}, {"value": "2026-05", "label": "mai de 26"}]
```

O formulário "Alimentar Portal" tem o campo de competência (mês/ano) funcionando.
O seletor de competência no portal do cliente foi implementado e integrado à API.
Filtrar por `?competence=2026-05` retorna corretamente os dados de maio.

**Impacto:** O problema mais grave do sistema foi resolvido. O produto agora tem memória temporal.

---

### ✅ 2. Aprovação de análises — PATCH /approvals/:id funcionando

**Verificado:** O endpoint que antes retornava 404 agora retorna 200 com os dados corretos.
O payload de revisão (status, texto editado, notas de revisão) é persistido no Supabase.

```
PATCH /approvals/ffffffff-2222... → HTTP 200
Resposta: {id, clientId, title, text, status: "Aprovado", reviewNotes, owner: "Revisado MB"}
```

O campo `owner` é gravado como "Revisado MB" (texto fixo — ver pendências).

---

### ✅ 3. Campo competência dinâmico nos uploads

**Verificado:** Os formulários de upload de documentos e importações agora usam a função
`currentMonthValue()` que calcula o mês atual dinamicamente. O valor "2026-06" hardcoded
foi removido.

---

### ✅ 4. DRE e Fluxo de Caixa para Plano Financeiro IA

**Verificado:** A Clínica Norte (R$ 1.000/mês) agora recebe DRE estruturada com **22 linhas**
e DFC com **16 linhas**, calculadas a partir dos dados financeiros disponíveis.
Antes ambas eram arrays vazios `[]`.

---

### ✅ 5. Insights financeiros reais

**Verificado:** Os insights entregues ao cliente agora são gerados pelo algoritmo com base
nos dados reais:

```
"A empresa apresentou resultado gerencial de 22% sobre o faturamento informado."
"O caixa informado esta abaixo da reserva de seguranca de 45 dias recomendada pela MB."
"O MB Financial Score calculado pela metodologia atual ficou em 76/100 (Saudavel)."
```

Não há mais a mensagem técnica "Dados carregados do Supabase" sendo exibida como insight.

---

### ✅ 6. Validação de CNPJ no cadastro de cliente

**Verificado:** O frontend valida o dígito verificador do CNPJ e bloqueia cadastros com
CNPJ inválido. Também verifica duplicidade de CNPJ entre clientes existentes antes de
salvar.

---

### ✅ 7. Filas operacionais calculadas de dados reais

**Verificado:** O Cockpit de Operação MB agora calcula as filas dinamicamente:

- Fila Fiscal: conta documentos com categoria Fiscal/DAS/XML que não têm status Aprovado/Disponível/Validado
- Fila Financeiro: conta importações que não estão com status Validado
- Fila DRE/IA: conta aprovações sem status "Aprovado"
- Fila Onboarding: conta clientes com status "Onboarding"

Os responsáveis por cada fila são buscados dinamicamente por função (`roleOwner()`).
O texto "11 guias/XML" hardcoded foi removido.

---

### ✅ 8. Busca e filtros na lista de clientes

**Verificado:** A tela de Gestão de Clientes possui campo de busca por nome, CNPJ e
segmento, além de filtros por plano, status e confiança. A filtragem é client-side
sobre os dados já carregados.

---

### ✅ 9. Filtros de competência e categoria em documentos

**Verificado:** A tela de Documentos (cliente e admin) tem filtro por categoria e por
competência (mês/ano). A ordenação é do mais recente para o mais antigo.

---

### ✅ 10. Score com metodologia de 6 dimensões

**Verificado:** O score financeiro é calculado pelo servidor com 6 dimensões ponderadas:

| Dimensão | Peso | Score (Silva Jun) | Status |
|---|---|---|---|
| Liquidez | 25% | 10/100 | Risco |
| Rentabilidade | 25% | 100/100 | Saudável |
| Eficiência | 20% | 0/100 | Risco |
| Folha | 15% | 100/100 | Saudável |
| Impostos | 10% | 100/100 | Saudável |
| Capital de giro | 5% | 75/100 | Saudável |

---

### ✅ 11. Segurança e isolamento multi-tenant

**Verificado com tokens reais:**

| Teste | Resultado |
|---|---|
| Sem token → endpoints protegidos | HTTP 401 ✅ |
| Token inválido → endpoints protegidos | HTTP 401 ✅ |
| Rate limit após 5 tentativas de login | HTTP 429 ✅ |
| CFO token acessando dados da Clínica | HTTP 403 ✅ |
| CFO token acessando próprios dados | HTTP 200 ✅ |
| Cliente Financeiro criando tarefa para outro cliente | HTTP 403 ✅ |
| Cliente CFO acessando /users | HTTP 403 ✅ |

---

### ✅ 12. Download de documentos com URL assinada

**Verificado:** O endpoint `GET /documents/:id/download` gera URL assinada do Supabase
Storage com expiração de 5 minutos. A URL é real e funcional.

---

### ✅ 13. Estrutura do relatório impresso melhorada

**Verificado:** O relatório impresso tem `MB_REPORT_CONFIG` com fallback de logo
(`onerror` substitui por texto), e a competência real do período é exibida no documento.

---

## PARTE 2 — O QUE ESTÁ IMPLEMENTADO MAS COM PROBLEMAS

---

### ⚠ 1. CNPJ e CRC da MB — estrutura existe, mas campos estão vazios

**O que foi feito:** Foi criado o objeto `MB_REPORT_CONFIG` no `app.js` com os campos
`companyName`, `cnpj` e `crc`. O relatório impresso usa esses campos corretamente.

**O problema:** Os campos `cnpj` e `crc` estão com string vazia (`""`). O relatório
é emitido sem identificação formal da MB.

```javascript
const MB_REPORT_CONFIG = {
  companyName: "MB Empresas Assessoria Empresarial",
  cnpj: "",   // ← VAZIO
  crc: ""     // ← VAZIO
};
```

**O que precisa:** Preencher com o CNPJ real e o CRC real da MB. Isso é uma linha de
mudança — os dados só precisam ser inseridos.

---

### ⚠ 2. Campo nextReview — existe no formulário mas não persiste no banco

**O que foi feito:** O formulário "Alimentar Portal" tem um campo de data para
"Próxima revisão MB". O servidor tenta salvar o valor com `try/catch` silencioso.

**O problema:** A coluna `next_review_date` não existe na tabela `clients` no banco
de dados Supabase. O campo é ignorado silenciosamente. Todos os clientes retornam
`nextReview: null`. O campo no formulário funciona visualmente, mas não salva nada.

**O que precisa:** Executar uma migration no Supabase adicionando a coluna:
```sql
ALTER TABLE public.clients ADD COLUMN next_review_date date;
```

---

### ⚠ 3. Preços dos planos foram alterados e divergem do contrato comercial

**Verificado:** Os preços atuais no banco são:

| Plano | Preço original | Preço atual no banco |
|---|---|---|
| Contabilidade | R$ 800/mês | R$ 600/mês |
| Financeiro IA | R$ 1.200/mês | R$ 1.000/mês |
| CFO as a Service | R$ 2.000/mês | R$ 2.000/mês |

Contabilidade e Financeiro IA foram alterados — possivelmente durante um teste da
funcionalidade de atualização de preços. Os preços precisam ser verificados com a
área comercial e corrigidos se necessário.

---

### ⚠ 4. Score do snapshot de junho está inconsistente (56, era 82 em maio)

**O que aconteceu:** Ao criar o snapshot de junho com dados parciais (faturamento,
despesas, impostos, folha, caixa), os campos `runway_days` e `investment_capacity`
foram gravados como 0. Isso derruba o score:

- Liquidez: 10/100 (fôlego de caixa calculado como 18 dias porque expenses/cash foram
  informados mas runway_days foi 0, e o algoritmo recalcula: 90.000 / (150.000/30) = 18 dias)
- Eficiência: 0/100 (operatingExpenses = expenses - payroll - taxes = 102.500, que é
  52,6% da receita — muito acima do limite de 30%)

O score caiu de 82 (maio) para 56 (junho). Isso não é necessariamente um bug —
pode refletir os dados reais. Mas o campo `runway` aparece como 0 no retorno da API,
o que sugere que o campo `runway_days` não foi enviado no PATCH de teste.

**O que precisa:** A equipe MB deve sempre informar fôlego de caixa, capacidade de
investimento e NCG ao alimentar os dados mensais, ou o score ficará sub-avaliado.
Idealmente, o formulário deve avisar quando esses campos estão zerados.

---

### ⚠ 5. Score da Serviços Prime artificialmente alto (74 com despesas = 0)

**Verificado:** A Serviços Prime tem `revenue: 42.800` e `expenses: 0`. Com despesas
zeradas, a margem calculada é 100%, o que maximiza o score de rentabilidade e eficiência.
O score resultante é 74/100, o que é uma leitura falsa — a empresa simplesmente não
informou as despesas.

**O problema real:** O algoritmo de score não distingue entre "empresa saudável" e
"dados incompletos". Uma empresa com expenses=0 não deveria ter score alto — deveria
ter uma penalidade por dados insuficientes.

**O que precisa:** Adicionar uma dimensão ou penalidade para dados incompletos no
cálculo de score. Se expenses=0 com revenue>0, o score deveria ser marcado como
"Dados insuficientes" em vez de Saudável.

---

### ⚠ 6. Owner da aprovação gravado como texto fixo "Revisado MB"

**Verificado:** Quando uma aprovação é revista, o campo `owner` retorna "Revisado MB"
— texto fixo — em vez do nome real do operador que fez a revisão. O campo `reviewed_by`
deveria receber o ID do perfil do usuário logado.

---

### ⚠ 7. Último acesso dos clientes sempre "Ainda não acessou"

**Verificado:** Todos os 4 clientes retornam `lastAccess: "Ainda não acessou"`.
O campo `last_access_at` na tabela `clients` não está sendo atualizado quando o
cliente faz login. O audit_log registra o login (73 logs presentes), mas o campo
direto no cliente não é atualizado.

---

## PARTE 3 — DADOS INCONSISTENTES GERADOS DURANTE TESTES

Estes problemas foram criados pelo uso do sistema e precisam de limpeza no banco.

---

### ❌ 1. Cliente "Nova Empresa LTDA" criado acidentalmente

**Encontrado:** Existe um 4º cliente no banco: "Nova Empresa LTDA" (plano Contabilidade,
status Onboarding). Foi criado durante teste da funcionalidade de cadastro e tem:

- `revenue: 0`, `expenses: 0`, `score: 4`
- Nenhum documento, nenhuma tarefa, nenhuma mensagem
- Afeta as métricas do Cockpit MB (clientes em risco, onboarding, etc.)

**O que precisa:** Excluir este cliente do banco se for apenas um teste.

---

### ❌ 2. OFX duplicado na fila de importações

**Encontrado:** O arquivo "extrato_maio.ofx" aparece **3 vezes** na lista de importações
— 1 com status "Validado" (correto) e 2 com status "Aguardando validação MB" (duplicatas
de testes). As duplicatas poluem a fila de trabalho da MB e os KPIs do cockpit.

---

### ❌ 3. Documento "DRE_Comercio_Silva_LTDA.csv" com competência julho/2026

**Encontrado:** Um documento do tipo "Exportação" foi criado automaticamente quando o
botão "Excel" do relatório de DRE foi clicado. A competência ficou registrada como
`2026-07-01` (julho) sendo que o sistema estava em maio/junho. Este documento está
classificado como "Aguardando revisão" no portal.

**Causa:** O export de CSV gera um arquivo local, mas também criou um registro no banco
com data incorreta. A lógica de export precisa ser revisada.

---

### ❌ 4. Snapshot de junho com campos financeiros zerados

**Encontrado:** O snapshot de junho/2026 do Comércio Silva foi criado com:
- `runway: 0` (fôlego de caixa)
- `investmentCapacity: 0` (capacidade de investimento)
- `workingCapitalDays: 0` (NCG)
- `operationalScore: 0`

Esses campos não foram enviados no PATCH de criação. A MB precisa alimentar esses
campos no Alimentar Portal ao fechar o mês de junho.

---

## PARTE 4 — O QUE AINDA NÃO FOI IMPLEMENTADO

Do roadmap definido no documento de requisitos, os seguintes itens ainda não existem:

| Item | Prioridade | Situação |
|---|---|---|
| Notificação visual (badge) de nova análise/documento | Alta | Não iniciado |
| Histórico de score por mês (gráfico de linha) | Alta | Não iniciado |
| Interface para criar linhas de DRE manualmente | Alta | Não iniciado |
| Interface para criar linhas de DFC manualmente | Alta | Não iniciado |
| Paginação em documentos, importações e auditoria | Média | Não iniciado |
| Calendário de vencimentos fiscais (plano Contabilidade) | Média | Não iniciado |
| Troca de senha pelo cliente | Média | Não iniciado |
| Exportação dos relatórios operacionais em CSV/Excel | Média | Não iniciado |
| Desativação de usuário | Média | Parcial (PATCH /users retorna 200, sem verificar) |
| Coluna next_review_date no banco (migration) | Alta | Não iniciado |
| Aviso ao MB quando nextReview não pode ser salvo | Baixa | Não iniciado |
| Penalidade de score por dados incompletos | Média | Não iniciado |

---

## PARTE 5 — TESTES REALIZADOS E RESULTADOS

### Autenticação (4 perfis testados)

| Usuário | E-mail | Login | Tipo | Acesso correto |
|---|---|---|---|---|
| Marcos Lima | admin@mbempresas.com.br | ✅ | MB | Admin completo |
| Marcos Silva | cfo@cliente.com | ✅ | Cliente | Apenas próprios dados |
| Camila Norte | financeiro@cliente.com | ✅ | Cliente | Apenas próprios dados |
| Juliana Prime | contabilidade@cliente.com | ✅ | Cliente | Apenas próprios dados |

### Endpoints testados

| Endpoint | Método | Status | Observação |
|---|---|---|---|
| /auth/login | POST | ✅ 200 | Funciona para todos os perfis |
| /auth/me | GET | ✅ 200 | Retorna perfil correto |
| /auth/login (senha errada x6) | POST | ✅ 429 | Rate limit funcionando |
| /plans | GET | ✅ 200 | Preços divergem do original |
| /plans/:id | PATCH | ✅ 200 | Atualiza preço no banco |
| /clients | GET | ✅ 200 | 4 clientes (incluindo Nova Empresa) |
| /clients | POST | ✅ 201 | Cria com validação CNPJ |
| /clients/:id | PATCH | ✅ 200 | Atualiza ficha do cliente |
| /finance/:id | GET | ✅ 200 | Retorna dados + competences |
| /finance/:id?competence= | GET | ✅ 200 | Filtra por mês corretamente |
| /finance | GET (batch) | ✅ 200 | Retorna todos os clientes |
| /finance/:id | PATCH | ✅ 200 | Cria novo mês sem sobrescrever |
| /documents | GET | ✅ 200 | 6 documentos (inclui duplicata CSV) |
| /documents | POST | ✅ 201 | Upload funcional |
| /documents/:id/download | GET | ✅ 200 | URL assinada Supabase Storage |
| /imports | GET | ✅ 200 | 6 importações (inclui duplicatas) |
| /imports | POST | ✅ 201 | Registro funcional |
| /tasks | GET | ✅ 200 | 3 tarefas ativas |
| /tasks | POST | ✅ 201 | Cria tarefa corretamente |
| /approvals | GET | ✅ 200 | 2 aprovações |
| /approvals | POST | ✅ 201 | Cria nova aprovação |
| /approvals/:id | PATCH | ✅ 200 | **CORRIGIDO** — era 404 antes |
| /messages | GET | ✅ 200 | 5 mensagens |
| /messages | POST | ✅ 201 | Envia mensagem |
| /users | GET | ✅ 200 | 8 usuários |
| /users | POST | ✅ 201 | Cria usuário |
| /users/:id | PATCH | ✅ 200 | Edição funcional |
| /audit | GET | ✅ 200 | 73 logs registrados |
| /finance (sem token) | GET | ✅ 401 | Protegido corretamente |
| /finance (token errado) | GET | ✅ 401 | Protegido corretamente |
| Acesso cruzado entre clientes | GET | ✅ 403 | Isolamento correto |

---

## AÇÕES RECOMENDADAS IMEDIATAS

### Urgente (antes do próximo cliente real acessar)

1. **Preencher CNPJ e CRC da MB** em `apps/web/app.js` no objeto `MB_REPORT_CONFIG`.
   É uma alteração de 2 linhas com os dados reais da empresa.

2. **Executar migration** para adicionar `next_review_date` na tabela `clients` do Supabase.

3. **Limpar banco de dados de teste:**
   - Excluir cliente "Nova Empresa LTDA"
   - Excluir importações duplicadas de extrato_maio.ofx
   - Corrigir competência do documento DRE_Comercio_Silva_LTDA.csv (ou excluí-lo)

4. **Verificar preços** dos planos com a área comercial e corrigir se necessário.

5. **Completar dados de junho** da Silva: fôlego de caixa, capacidade de investimento
   e NCG precisam ser alimentados para o score refletir a realidade.

### Curto prazo (próximas 2 semanas)

6. Gravar `reviewed_by` com o ID real do usuário logado nas aprovações.
7. Atualizar `last_access_at` no cliente quando login é realizado.
8. Adicionar aviso no formulário quando campos críticos (runway, investmentCapacity)
   estão zerados mas o faturamento foi informado.
9. Revisar lógica de score para penalizar dados claramente incompletos (expenses=0 com revenue>0).

---

*Verificação realizada em 25/05/2026 · Sistema em execução na porta 3333 · Supabase conectado*
*73 audit logs no banco · 4 clientes · 8 usuários · 2 meses de histórico (Silva)*
