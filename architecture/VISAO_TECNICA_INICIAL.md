# Visao Tecnica Inicial

Esta visao ainda nao define stack definitiva. O objetivo e orientar a transformacao do prototipo em produto real sem perder o controle do MVP.

## Principios

- a plataforma nao substitui ERP, banco ou sistema fiscal
- a plataforma consolida, organiza, interpreta e apresenta informacoes
- calculos objetivos devem ficar em regras do sistema
- interpretacoes, resumos e recomendacoes devem ficar na camada de IA
- insights estrategicos devem passar por revisao MB antes de liberacao ao cliente
- toda informacao relevante deve ter origem, status e nivel de confianca
- o produto deve nascer simples, mas preparado para auditoria, permissoes e escala

## Componentes sugeridos

### Aplicacao web

Interface do cliente e da equipe MB. Deve concentrar login, portal do cliente, area administrativa, dashboards, documentos, Copiloto, relatorios e operacao interna.

### API backend

Camada futura para regras de negocio, permissoes, planos, clientes, documentos, relatorios, importacoes e aprovacoes.

Primeira implementação local criada em `apps/api`, usando HTTP nativo do Node.js e persistência temporária em `data/db.json`.

### Banco de dados

Armazena clientes, empresas, usuarios, planos, permissoes, tarefas, documentos, indicadores, historico e trilhas de auditoria.

### Armazenamento de arquivos

Guarda documentos, guias, XML, OFX, planilhas, relatorios e anexos.

### Motor de importacao

Processa Excel, CSV, OFX e XML no MVP. No futuro, recebe dados de ERPs, Open Finance e outras integracoes.

### Motor de regras financeiras

Calcula faturamento, variacoes, margem, caixa, DRE, impostos, alertas objetivos e indicadores.

### Camada de IA

Gera resumo executivo, interpretacoes, explicacoes, recomendacoes, perguntas ao cliente e sugestoes de proximas acoes.

### Governanca MB

Fluxo de revisao e aprovacao de DRE, fluxo de caixa, categorias, insights, relatorios e pareceres antes da liberacao ao cliente.

## Entidades principais futuras

- cliente
- grupo economico
- empresa
- usuario
- perfil de acesso
- plano
- modulo
- permissao
- documento
- competencia
- pendencia
- tarefa
- integracao
- importacao
- lancamento financeiro
- categoria
- DRE
- fluxo de caixa
- insight IA
- aprovacao MB
- relatorio
- timeline
- notificacao
- SLA
- auditoria

## Fluxo macro

1. Cliente ou equipe MB acessa a plataforma.
2. Sistema identifica perfil, plano, empresa e permissoes.
3. Cliente visualiza apenas os modulos liberados.
4. Equipe MB cadastra, alimenta, revisa e aprova informacoes.
5. Dados importados ou cadastrados passam por regras e validacoes.
6. IA gera observacoes e recomendacoes.
7. MB aprova o que deve ser liberado ao cliente.
8. Cliente acompanha dashboard, documentos, relatorios e proximas acoes.

## Evolucao recomendada

1. Aplicacao web com dados simulados estruturados.
2. Persistencia local ou backend simples.
3. Banco de dados real.
4. Autenticacao real.
5. Upload real de documentos.
6. Importacao real de planilhas e OFX.
7. Relatorios profissionais.
8. IA assistida com aprovacao MB.
9. Integracoes externas.
