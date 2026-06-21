# Matriz de Planos e Permissoes

Esta matriz define a regra comercial central da MB Intelligence: o cliente visualiza apenas o que o plano contratado, o perfil do usuario e a qualidade dos dados permitem.

## Regra principal

Permissao final = plano contratado + perfil do usuario + maturidade dos dados + aprovacao MB quando necessaria.

O plano nunca deve ser ultrapassado pelo perfil do usuario. Um gestor financeiro do cliente, por exemplo, nao pode acessar CFO as a Service se a empresa estiver no Plano Financeiro IA.

## Planos

### Plano Contabilidade

Valor inicial: R$ 800

Entrega principal:

- documentos
- DAS
- guias
- avisos
- pendencias simples
- historico de documentos

Bloqueios:

- dashboard financeiro avancado
- DRE gerencial
- fluxo de caixa
- IA financeira executiva
- score financeiro
- capacidade de investimento
- CFO consultivo

### Plano Financeiro IA

Valor inicial: R$ 1.200

Entrega principal:

- tudo do Plano Contabilidade
- dashboard de faturamento
- fiscal completo
- folha e encargos
- alertas simples
- observacoes de IA
- importacao basica de arquivos
- relatorios gerenciais simples

Bloqueios:

- parecer financeiro executivo
- reunioes CFO
- capacidade de investimento validada
- DRE completa validada
- fluxo de caixa completo validado
- apoio consultivo de diretor financeiro

### Plano CFO as a Service

Valor inicial: R$ 2.000

Entrega principal:

- tudo do Plano Financeiro IA
- DRE gerencial completa
- fluxo de caixa completo
- MB Financial Score
- analise de margem
- capacidade de investimento
- analise de risco financeiro
- parecer MB
- historico consultivo
- reunioes CFO
- plano de acao financeiro

## Matriz resumida

| Modulo | Contabilidade | Financeiro IA | CFO as a Service |
|---|---|---|---|
| Documentos e guias | Sim | Sim | Sim |
| DAS | Sim | Sim | Sim |
| Fiscal | Basico | Completo | Completo |
| Trabalhista | Documentos | Folha e encargos | Folha e encargos |
| Faturamento | Nao | Sim | Sim |
| Dashboard financeiro | Nao | Sim | Sim |
| Observacoes IA | Nao | Basicas | Avancadas |
| DRE | Nao | Basica se houver dados | Completa e validada |
| Fluxo de caixa | Nao | Basico se houver dados | Completo e validado |
| Score financeiro | Nao | Limitado ou futuro | Sim |
| Capacidade de investimento | Nao | Nao | Sim |
| CFO consultivo | Nao | Nao | Sim |
| Parecer MB | Nao | Nao | Sim |

## Bloqueios por dados insuficientes

Mesmo no plano correto, o sistema deve bloquear analises sem base confiavel.

Exemplos:

- sem despesas: nao calcular margem com seguranca
- sem extrato ou banco: nao calcular caixa com seguranca
- sem DRE validada: nao liberar parecer CFO
- sem XML/faturamento: nao afirmar acumulado fiscal completo

## Upgrade

O sistema deve sugerir upgrade quando identificar:

- alto uso do portal
- boa qualidade dos dados
- crescimento de faturamento
- duvidas recorrentes de gestao
- cliente com dados suficientes para analise mais avancada
- cliente com necessidade clara de decisao financeira
