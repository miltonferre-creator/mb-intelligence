# Modelo de Dados Inicial

Este modelo ainda nao e banco de dados. Ele define as entidades que o produto precisa representar quando sair dos dados simulados para persistencia real.

## Cliente

Representa o contratante principal ou grupo economico.

Campos iniciais:

- id
- nome
- tipo
- status
- plano contratado
- data de inicio
- responsavel legal
- contatos principais
- observacoes internas
- oportunidade de upgrade

## Empresa

Uma empresa vinculada ao cliente.

Campos iniciais:

- id
- cliente id
- razao social
- nome fantasia
- CNPJ
- regime tributario
- CNAE principal
- CNAEs secundarios
- cidade/UF
- segmento
- status

## Usuario

Pode ser usuario do cliente ou operador MB.

Campos iniciais:

- id
- nome
- e-mail
- tipo: cliente ou MB
- perfil
- empresa vinculada
- status
- ultimo acesso

## Plano

Controla preco, modulos e regras comerciais.

Campos iniciais:

- id
- nome
- preco mensal
- descricao comercial
- modulos liberados
- status
- data da ultima alteracao

## Documento

Arquivo publicado ou solicitado.

Campos iniciais:

- id
- cliente id
- empresa id
- competencia
- categoria
- tipo
- nome do arquivo
- status
- visibilidade
- enviado por
- data de upload
- versao

## Indicador Financeiro

Dados consolidados para dashboard, DRE e caixa.

Campos iniciais:

- id
- cliente id
- empresa id
- competencia
- faturamento
- despesas
- impostos
- folha
- resultado estimado
- saldo de caixa
- margem
- score financeiro
- nivel de confianca
- status de validacao

## DRE Gerencial

Relatorio financeiro gerencial.

Campos iniciais:

- id
- cliente id
- empresa id
- competencia
- linhas da DRE
- resultado
- margem
- status: rascunho, aguardando revisao, aprovado, publicado
- responsavel MB
- data de aprovacao

## Fluxo de Caixa

Leitura de caixa historica ou projetada.

Campos iniciais:

- id
- cliente id
- empresa id
- competencia
- saldo inicial
- recebimentos
- pagamentos
- impostos
- saldo final
- dias de folego
- status de validacao

## Insight IA

Analise sugerida pela IA e revisada pela MB.

Campos iniciais:

- id
- cliente id
- competencia
- origem dos dados
- texto gerado
- nivel de confianca
- status: gerado, editado, rejeitado, aprovado, publicado
- responsavel pela revisao
- data da revisao

## Tarefa / Pendencia

Acao operacional para cliente ou equipe MB.

Campos iniciais:

- id
- cliente id
- empresa id
- titulo
- descricao
- origem: IA, MB, sistema, cliente
- responsavel
- prioridade
- prazo
- status
- historico

## Auditoria

Registro de acoes relevantes.

Campos iniciais:

- id
- usuario id
- acao
- entidade
- entidade id
- valor anterior
- valor novo
- data e hora
- origem
