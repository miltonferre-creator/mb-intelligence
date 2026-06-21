# MB Intelligence — Documento de Requisitos para Desenvolvimento
### Versão 2.0 · Maio/2026 · Uso interno MB Empresas

---

> **Para quem é este documento**
> Para o desenvolvedor ou time que vai trabalhar no MB Intelligence.
> Aqui você encontra uma descrição clara de tudo que precisa ser feito, por que cada coisa
> importa, e como o produto deve se comportar depois. Não é um manual de código — é a
> explicação do problema e do que se espera como resultado.

---

## CONTEXTO GERAL DO PRODUTO

O MB Intelligence é a plataforma digital da MB Empresas Assessoria. Por ela, a equipe MB
entrega análises financeiras para pequenas e médias empresas que contratam um dos três planos:

- **Contabilidade** (R$ 800/mês): foco em documentos fiscais, guias e obrigações.
- **Financeiro IA** (R$ 1.200/mês): dashboard gerencial com faturamento, impostos, folha e gráficos.
- **CFO as a Service** (R$ 2.000/mês): análise executiva completa com DRE, Fluxo de Caixa e Score Financeiro.

O produto tem dois lados:

- **Portal do cliente** — o empresário entra e vê os dados da sua empresa.
- **Painel administrativo** — a equipe MB entra para alimentar, aprovar e publicar as análises.

Hoje o produto está funcional no que diz respeito à estrutura: os dados chegam, as telas
aparecem, o login funciona. O problema é que faltam funcionalidades fundamentais que impedem
o produto de entregar o valor que promete. Este documento descreve essas lacunas.

---

## PARTE 1 — OS PROBLEMAS CRÍTICOS

Estes são os itens que estão **quebrando o produto hoje**. Nada novo deve ser desenvolvido
antes que esses problemas sejam corrigidos.

---

### PROBLEMA 1 — O SISTEMA NÃO TEM MEMÓRIA DO TEMPO

**Este é o problema mais grave e mais importante de todos.**

Hoje, quando a equipe MB abre o painel, alimenta os dados de um cliente (faturamento,
despesas, caixa, etc.) e salva, o sistema simplesmente sobrescreve o que estava antes.
Não existe nenhuma noção de "mês de referência" nesse processo.

Isso significa que:

- Se a MB alimentou os dados de Maio, o cliente vê Maio.
- Quando a MB alimentar os dados de Junho, Maio desaparece para sempre.
- O gráfico que aparece no portal do cliente é chamado de "Evolução mensal" mas
  sempre mostra um único ponto — porque nunca há mais de um mês salvo.
- O cliente CFO, que paga R$ 2.000 por mês, não consegue comparar faturamento de
  meses diferentes, não vê tendência, não acompanha evolução.

**O banco de dados já foi projetado corretamente para isso** — existe uma tabela chamada
`financial_snapshots` que tem um campo `competence` (data do mês de referência) e uma
regra de unicidade por cliente + mês. Ou seja, a estrutura suporta múltiplos meses.
**O problema está na interface e na lógica de salvamento**, que nunca usam esse campo.

**O que precisa mudar:**

1. O formulário de alimentação de dados precisa ter um campo onde a MB informa
   **de qual mês são aqueles dados**. Algo como um seletor de mês e ano.
   Hoje esse campo simplesmente não existe no formulário.

2. Quando a MB salvar os dados de um mês, o sistema precisa verificar se já existe
   um registro para aquele cliente naquele mês específico. Se existir, atualiza.
   Se não existir, cria um registro novo — sem apagar o mês anterior.

3. Quando o cliente abre o portal e vê as análises, ele precisa poder navegar entre
   as competências disponíveis. Algo como um seletor "Competência: Maio/2026" que
   permita escolher outros meses que foram alimentados.

4. Os gráficos de evolução só devem aparecer com o título "Evolução mensal" quando
   houver de fato mais de um mês de dados. Com apenas um mês, o gráfico deve ser
   apresentado de forma honesta, sem a promessa de uma evolução que não existe.

**Por que isso é urgente:**
Sem isso, a equipe MB trabalha em loop — alimenta dados todo mês e apaga o histórico
do mês anterior sem perceber. O cliente nunca vê progresso. O produto não cumpre a
promessa de inteligência financeira ao longo do tempo.

---

### PROBLEMA 2 — A APROVAÇÃO DE ANÁLISES ESTÁ QUEBRADA

A MB Intelligence tem um processo de governança bem pensado: a equipe MB gera uma análise
ou insight para um cliente, esse conteúdo entra em uma fila de aprovação, um responsável
da MB revisa, aprova (ou rejeita), e só então o cliente vê no portal.

**O problema:** a parte de salvar a decisão de aprovação não funciona. A tela de
Aprovações existe, o formulário aparece, a pessoa clica em "Salvar revisão" — mas a
ação falha silenciosamente ou salva apenas localmente sem chegar ao banco de dados.
Isso acontece porque o trecho do servidor responsável por receber e processar essa
ação simplesmente não foi implementado.

**O que precisa mudar:**

- O servidor precisa ser capaz de receber a decisão de revisão de uma aprovação
  (aprovado / rejeitado / editar antes de liberar) e salvá-la no banco.
- Quando uma análise for aprovada, o sistema deve registrar quem aprovou e quando,
  e marcar o conteúdo como publicado para o cliente.
- Quando rejeitada, o conteúdo não deve aparecer para o cliente.
- A tela de Aprovações deve refletir o estado real após cada ação.

**Por que isso é urgente:**
O processo de governança é um dos diferenciais do produto — "o cliente só recebe
análises validadas por um humano da MB". Hoje esse processo não existe na prática
porque a aprovação não funciona. Todo conteúdo gerado fica em estado de limbo.

---

### PROBLEMA 3 — DADOS DE MESES INCORRETOS EM UPLOAD DE ARQUIVOS

Quando a equipe MB sobe um documento (uma guia DAS, um relatório, um extrato) ou
registra uma importação de arquivo, o sistema precisa saber de qual mês/competência
é aquele arquivo.

**O problema:** o campo de competência nos formulários de upload está fixado no
código com o valor "2026-06". Isso significa que todos os documentos e importações
são cadastrados como se fossem de Junho/2026, independentemente do mês real.

**O que precisa mudar:**

- O campo de competência nos formulários de upload deve sempre mostrar o mês
  atual como valor padrão, calculado dinamicamente pelo sistema.
- O profissional da MB ainda pode alterar o mês manualmente se precisar cadastrar
  um documento de uma competência diferente.

---

## PARTE 2 — PROBLEMAS DE QUALIDADE E COERÊNCIA

Estes itens não quebram o produto, mas comprometem a qualidade da entrega e a
credibilidade com o cliente.

---

### PROBLEMA 4 — MENSAGENS TÉCNICAS VISÍVEIS AO CLIENTE

Em alguns cenários, o cliente abre o portal e vê no painel de "IA MB" uma mensagem
como: *"Dados carregados do Supabase."* ou *"Análises executivas dependem de validação MB."*

Essas são mensagens internas do sistema, destinadas à equipe de desenvolvimento ou à
equipe MB. Elas nunca deveriam aparecer para o empresário que está pagando pelo serviço.

**O que precisa mudar:**

- O sistema precisa de uma camada de filtragem que garanta que apenas análises
  genuínas, escritas ou aprovadas pela equipe MB, cheguem ao portal do cliente.
- Mensagens de estado técnico do sistema jamais devem aparecer como insights
  financeiros para o cliente.
- Quando não há análise disponível para exibir, o sistema deve mostrar uma
  mensagem neutra e orientada ao cliente, como: *"Aguardando análise da equipe MB
  para esta competência."*

---

### PROBLEMA 5 — INFORMAÇÕES DA MB FALTANDO NO RELATÓRIO IMPRESSO

O produto permite que o cliente (plano CFO) imprima a DRE e o Fluxo de Caixa com
layout da MB. O relatório abre em uma janela separada, com cabeçalho, tabela de dados
e campos de assinatura — é um documento bem estruturado.

**O problema:** no campo de CNPJ e CRC da MB, o relatório impresso mostra literalmente
o texto *"informar nos parâmetros oficiais da MB"*. Ou seja, o dado nunca foi preenchido
e o relatório vai para o cliente sem identificação formal da empresa.

Adicionalmente, o relatório usa o texto *"Competência atual validada pela MB"* no lugar
da data real do fechamento. Um documento entregue a um empresário precisa ter a data
de referência claramente indicada.

**O que precisa mudar:**

- O CNPJ real da MB Empresas Assessoria e o número do CRC precisam estar configurados
  no sistema e aparecer automaticamente no relatório impresso.
- A competência do relatório precisa exibir o mês e ano reais do fechamento,
  não uma frase genérica.
- Idealmente, o logo da MB deve sempre carregar corretamente. Se o arquivo de logo
  não estiver disponível, o relatório deve ter um fallback com o nome da empresa
  por extenso para não gerar um relatório sem identidade visual.

---

### PROBLEMA 6 — COCKPIT DA MB COM DADOS INVENTADOS

Na tela principal do painel administrativo (o "Cockpit de Operação"), existe uma
tabela chamada "Filas operacionais" que mostra o volume de trabalho por área da MB:
Fiscal, Financeiro, DRE, Onboarding.

**O problema:** parte desses dados está escrita diretamente no código com valores
fixos que nunca mudam. Por exemplo, a fila de Fiscal sempre aparece como
"11 guias/XML" — independentemente de quantos documentos realmente existam.
Os nomes dos responsáveis por cada fila também estão fixos no código.

**O que precisa mudar:**

- Os volumes de cada fila devem ser calculados a partir dos dados reais do banco
  (quantidade de documentos pendentes, importações aguardando validação, aprovações
  em aberto, clientes em onboarding).
- Os responsáveis de cada área devem vir do cadastro de usuários da MB, não estar
  escritos no código.

---

### PROBLEMA 7 — DATA DE PRÓXIMA REVISÃO SEM ORIGEM NO BANCO

Na tela de Onboarding do cliente, aparece a informação "Próxima revisão: DD/MM".
Essa data é calculada no momento de carregar a tela como "hoje mais 7 dias" —
ela não tem nenhuma relação com o que a MB agendou.

**O que precisa mudar:**

- A data de próxima revisão deve ser um campo gerenciado pela equipe MB e salvo
  no banco de dados.
- A MB precisa poder definir e atualizar essa data pelo painel administrativo.
- O cliente deve ver a data real que a MB agendou, não um valor aleatório.

---

### PROBLEMA 8 — DADOS AUSENTES NO PLANO FINANCEIRO IA

A Clínica Norte PME é cliente do plano Financeiro IA (R$ 1.200/mês). Esse plano
promete "dashboards, faturamento, folha, fiscal e análises automáticas".

**O problema:** quando o cliente desse plano abre o portal, os campos de DRE e
Fluxo de Caixa estão vazios. As análises que deveriam aparecer com base nos dados
disponíveis simplesmente não são geradas para este plano.

**O que precisa mudar:**

- O sistema deve gerar uma DRE e uma visão de Fluxo de Caixa gerencial para
  qualquer cliente que tenha dados financeiros minimamente suficientes (faturamento
  e despesas informados), independentemente do plano.
- O nível de detalhe pode variar por plano, mas um cliente pagando R$ 1.200/mês
  não pode ver telas em branco onde deveriam estar suas análises.

---

## PARTE 3 — FUNCIONALIDADES NOVAS A DESENVOLVER

Estes itens não existem hoje e precisam ser construídos do zero. Estão ordenados
por impacto no cliente.

---

### FUNCIONALIDADE 1 — NAVEGAÇÃO ENTRE COMPETÊNCIAS (MESES)

**Contexto:** Esta funcionalidade depende diretamente do Problema 1 ser resolvido.
Só faz sentido navegar entre meses se o sistema começar a salvar múltiplos meses.

**O que precisa existir:**

No portal do cliente (especialmente no plano CFO e Financeiro IA), deve haver uma
forma clara de selecionar de qual mês/ano o cliente quer ver as informações. Pode ser
um seletor no topo da tela de Inteligência Financeira, com os meses que já foram
alimentados pela MB disponíveis para escolha.

Quando o cliente selecionar um mês, todas as informações da tela (DRE, Fluxo de Caixa,
Score, gráficos) devem se referir àquela competência específica.

O gráfico de evolução deve automaticamente mostrar os pontos de todos os meses
disponíveis, permitindo que o cliente veja a tendência do negócio ao longo do tempo.

No painel da MB, a equipe também precisa poder selecionar a competência ao alimentar
dados, consultar fechamentos anteriores e comparar períodos de um cliente.

---

### FUNCIONALIDADE 2 — FILTROS NAS LISTAS DE DOCUMENTOS

**Contexto:** Um cliente ativo acumula muitos documentos ao longo dos meses — guias,
relatórios, certidões, extratos. Hoje todos aparecem em uma lista sem ordem e sem filtro.

**O que precisa existir:**

- Na tela de Documentos do cliente, deve haver filtros por categoria (Fiscal,
  Trabalhista, Contábil, Financeiro) e por período (mês/ano de competência).
- Na tela de Documentos do painel da MB, os mesmos filtros devem existir, com
  a adição de filtro por status (Disponível, Pendente, Aguardando revisão).
- A lista deve ter alguma forma de ordenação — por padrão, do mais recente para
  o mais antigo.

---

### FUNCIONALIDADE 3 — BUSCA NA LISTA DE CLIENTES

**Contexto:** Hoje a MB tem 3 clientes de teste. Na operação real, haverá dezenas
ou centenas de clientes. A tela de Gestão de Clientes lista todos sem nenhuma forma
de busca ou filtro.

**O que precisa existir:**

- Um campo de busca na tela de Gestão de Clientes que permita filtrar por nome
  da empresa, CNPJ ou segmento de atuação.
- Filtros opcionais por plano contratado, status (Ativo, Onboarding, Pausado) e
  nível de confiança dos dados.
- A lista deve ser ordenável por nome ou por data de último acesso.

---

### FUNCIONALIDADE 4 — ALERTA PROATIVO DE VENCIMENTOS (PLANO CONTABILIDADE)

**Contexto:** O cliente do plano Contabilidade paga R$ 800/mês principalmente para
não perder prazos fiscais — DAS, FGTS, folha, declarações. Hoje o produto não tem
nenhuma visualização de vencimentos futuros.

**O que precisa existir:**

- Uma seção no portal do cliente Contabilidade mostrando os próximos vencimentos
  em ordem cronológica, com destaque visual para os que vencem em menos de 5 dias.
- A MB deve poder cadastrar esses vencimentos pelo painel administrativo, associados
  ao cliente e ao mês de competência.
- Vencimentos já pagos ou publicados como documentos devem aparecer como concluídos.

---

### FUNCIONALIDADE 5 — HISTÓRICO DE SCORE FINANCEIRO

**Contexto:** O MB Financial Score é um dos diferenciais do plano CFO. Hoje o cliente
vê o score do mês atual com o detalhamento por dimensão. Mas não vê como o score
evoluiu — se melhorou, piorou, qual dimensão puxou para baixo.

**O que precisa existir:**

- Uma visualização do score ao longo dos meses (gráfico de linha simples).
- Indicação de quais dimensões melhoraram ou pioraram em relação ao mês anterior.
- Texto explicativo da MB sobre o que influenciou a variação do score.

Esta funcionalidade depende do Problema 1 e da Funcionalidade 1 estarem resolvidos.

---

### FUNCIONALIDADE 6 — INTERFACE PARA CONSTRUIR DRE E FLUXO DE CAIXA

**Contexto:** Hoje, para um cliente ter uma DRE completa no portal, os dados precisam
ser inseridos diretamente no banco de dados (via seed ou acesso direto ao Supabase).
A equipe MB não tem como construir a DRE de um cliente pela interface do produto.

**O que precisa existir:**

- No painel "Alimentar Portal", além dos campos financeiros gerais (faturamento, despesas,
  caixa), deve haver uma seção dedicada para a MB informar as linhas da DRE manualmente:
  custos diretos (CMV), despesas administrativas, despesas de pessoal, despesas financeiras,
  e outras contas relevantes.
- Da mesma forma, para o Fluxo de Caixa, a MB deve poder informar: recebimentos de clientes,
  pagamentos a fornecedores, pagamentos de impostos, saldo inicial e saldo final.
- Com essas informações, o sistema gera automaticamente a DRE estruturada e o DFC
  em 3 seções que o cliente vê no portal.

---

### FUNCIONALIDADE 7 — NOTIFICAÇÃO DE NOVA ANÁLISE DISPONÍVEL

**Contexto:** Quando a MB aprova um insight ou publica um novo documento, o cliente
só fica sabendo se acessar o portal e verificar manualmente. Não há nenhum aviso.

**O que precisa existir:**

- Quando um documento novo for publicado para um cliente, ele deve receber algum
  tipo de notificação (ao menos um badge ou contador no menu do portal).
- Quando uma análise da MB for aprovada e publicada, o cliente deve ser informado
  de alguma forma — seja por e-mail, seja por uma notificação dentro do produto.
- A definição de qual canal usar (e-mail, WhatsApp, push) pode ser uma decisão
  posterior, mas o produto precisa ter pelo menos a notificação visual interna.

---

### FUNCIONALIDADE 8 — EXPORTAÇÃO DE RELATÓRIOS OPERACIONAIS

**Contexto:** A tela de Relatórios Operacionais do painel MB mostra dados valiosos:
carteira por plano, receita recorrente estimada, risco de cancelamento, produtividade
da equipe. Mas esses dados não podem ser exportados.

**O que precisa existir:**

- Botão de exportação em CSV ou Excel em cada tabela da tela de Relatórios.
- Idealmente, geração de um relatório consolidado em PDF com todos os dados da
  carteira para uso em reuniões internas da MB.

---

### FUNCIONALIDADE 9 — EDIÇÃO E DESATIVAÇÃO DE USUÁRIOS

**Contexto:** Hoje é possível criar usuários pelo painel, mas não é possível editar
ou desativar um usuário existente. Se um colaborador da MB sair da empresa ou um
cliente mudar seu responsável de acesso, não há como gerenciar isso pela interface.

**O que precisa existir:**

- Na tela de Usuários, cada registro deve ter opções para editar os dados (nome,
  perfil, e-mail) e para desativar o acesso (sem excluir o histórico).
- Um usuário desativado não deve conseguir fazer login.
- O histórico de ações do usuário na auditoria deve ser preservado mesmo após
  a desativação.

---

### FUNCIONALIDADE 10 — VALIDAÇÃO DE CNPJ NO CADASTRO DE CLIENTE

**Contexto:** Ao cadastrar um novo cliente, o sistema aceita qualquer texto no campo
de CNPJ, incluindo o CNPJ de exemplo "00.000.000/0001-00" do formulário. Isso gera
registros inválidos no banco e pode causar problemas na geração de documentos e
no cálculo de impostos.

**O que precisa existir:**

- Validação do dígito verificador do CNPJ antes de aceitar o cadastro.
- Verificação de CNPJ duplicado — não permitir cadastrar dois clientes com o
  mesmo CNPJ.
- Mensagem clara ao operador informando o problema se o CNPJ for inválido.

---

## PARTE 4 — MELHORIAS DE EXPERIÊNCIA

Itens que não são bugs e não são funcionalidades novas, mas que melhoram
significativamente a qualidade do produto.

---

### MELHORIA 1 — PAGINAÇÃO NAS LISTAS LONGAS

As telas de Documentos, Importações e Auditoria carregam todos os registros de uma
vez. Com poucos dados de teste isso não é um problema, mas em produção com um cliente
ativo por 12 meses haverá centenas de documentos. O sistema precisa de paginação ou
carregamento progressivo nessas listas.

---

### MELHORIA 2 — FEEDBACK CLARO NA APROVAÇÃO DE ANÁLISES

Quando a MB aprova ou rejeita uma análise, o sistema deve mostrar claramente o que
aconteceu. Hoje não há nenhuma mensagem de confirmação visual adequada. O operador
clica em salvar e não sabe se funcionou.

---

### MELHORIA 3 — TROCA DE SENHA PELO CLIENTE

O cliente não consegue trocar sua própria senha pelo portal. Precisa pedir para a MB.
Isso é um ponto de atrito desnecessário. O portal deve ter um campo de troca de
senha na tela de Perfil, com confirmação da senha atual e validação da nova.

---

### MELHORIA 4 — ORDENAÇÃO E STATUS CLARO NOS DOCUMENTOS

Na tela de Documentos do cliente, a coluna chamada "Competência" exibe a data de
vencimento do documento, não a competência. Esses são conceitos diferentes:
um DAS tem uma data de vencimento (quando deve ser pago) e uma competência
(a qual mês de apuração ele se refere). Ambas as informações são importantes
e devem ser exibidas corretamente e com os rótulos certos.

---

### MELHORIA 5 — INPUT DE MENSAGEM PRÉ-PREENCHIDO

Na tela de Comunicação, o campo de texto para enviar mensagem para a MB já vem
preenchido com o texto "Escrever mensagem para a MB". Isso é um valor padrão
que aparece como se fosse o texto real da mensagem. Deveria ser um placeholder
(texto de orientação que desaparece ao clicar), não um valor preenchido.
Como está hoje, o cliente precisa apagar esse texto antes de digitar a mensagem,
o que é um ponto de confusão desnecessário.

---

## RESUMO EXECUTIVO — POR ONDE COMEÇAR

### Fase 1 — Corrigir o que está quebrado (sem isso o produto não funciona)

1. **Campo de competência no Alimentar Portal** — a equipe MB precisa informar de qual
   mês são os dados que está salvando.

2. **Lógica de salvamento por mês** — o sistema deve criar um novo registro mensal
   em vez de sobrescrever o anterior.

3. **Aprovação de análises funcionando** — salvar a decisão de aprovação/rejeição
   no banco de dados.

4. **Mês atual dinâmico nos uploads** — substituir o "2026-06" fixo pelo mês
   corrente calculado automaticamente.

### Fase 2 — Corrigir coerência e qualidade

5. Filtrar mensagens técnicas do portal do cliente.
6. Preencher CNPJ/CRC da MB no relatório impresso.
7. Corrigir filas operacionais com dados reais.
8. Data de próxima revisão salva no banco.
9. DRE e DFC disponíveis para plano Financeiro IA.

### Fase 3 — Construir o que falta

10. Seletor de competência no portal do cliente e no painel MB.
11. Filtros de período na tela de Documentos.
12. Busca e filtros na lista de clientes.
13. Interface para construir DRE e DFC linha a linha.
14. Histórico de score financeiro por mês.
15. Notificação de nova análise disponível.

### Fase 4 — Evoluir o produto

16. Alertas de vencimentos fiscais (plano Contabilidade).
17. Exportação de relatórios operacionais.
18. Gerenciamento completo de usuários (edição e desativação).
19. Validação de CNPJ no cadastro.
20. Paginação nas listas longas.

---

## TABELA DE IMPACTO

| Item | Quem é impactado | Impacto se não feito |
|---|---|---|
| Campo competência + lógica mensal | Equipe MB + todos os clientes | O produto não tem histórico. Nunca. |
| Aprovação funcionando | Equipe MB + clientes CFO | Governança de análises é teatro |
| Upload com mês correto | Equipe MB | Todos os documentos com mês errado |
| Mensagens técnicas | Todos os clientes | Credibilidade do produto comprometida |
| CNPJ/CRC no relatório | Clientes CFO | Documento oficial incompleto |
| DRE para Financeiro IA | Clínica Norte e similares | Plano de R$1.200 sem diferencial visível |
| Seletor de competência | Clientes CFO + Financeiro IA | Histórico existe no banco mas é invisível |
| Filas reais no cockpit | Equipe MB | Gestão operacional baseada em dados falsos |
| Busca de clientes | Equipe MB | Inviável com carteira grande |
| Filtros em documentos | Todos os clientes | Impossível localizar documentos |

---

*MB Intelligence · Documento de Requisitos v2.0 · Maio/2026*
*Elaborado com base em análise completa do código-fonte, banco de dados e telas do produto.*
*Uso interno MB Empresas Assessoria · Confidencial*
