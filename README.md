# MB Intelligence - Produto Final

Esta pasta separa o produto final da pasta de prototipo. A ideia e usar o prototipo atual como referencia visual e funcional, mas iniciar aqui uma base organizada para evoluir a MB Intelligence como produto real.

## Posicionamento

A MB Intelligence e uma plataforma de inteligencia financeira e gestao operacional para PMEs.

Ela nao deve ser tratada como ERP, sistema bancario, sistema fiscal ou sistema financeiro transacional completo.

Ela deve funcionar como:

- portal do cliente
- central de documentos e guias
- cockpit financeiro empresarial
- camada de consolidacao de dados
- motor de analise gerencial
- ambiente de governanca operacional da MB
- apoio tecnologico ao CFO as a Service

## Estrutura desta pasta

- `reference/prototipo-atual`: copia congelada do prototipo atual para consulta.
- `apps/web`: futura aplicacao web do produto.
- `apps/api`: backend local com API HTTP, login, sessão e persistência em JSON.
- `product`: definicoes de produto, MVP, regras comerciais e decisoes pendentes.
- `architecture`: visao tecnica inicial e principios de arquitetura.
- `backlog`: backlog inicial do MVP.
- `docs`: documentos executivos, funcionais e materiais de apoio.

## Estado atual

Esta pasta ainda nao possui banco de dados definitivo ou infraestrutura de producao.

O objetivo agora e transformar o prototipo validado em uma base executavel de produto, com escopo controlado e arquitetura preparada para crescer.

Atualização: a pasta `apps/api` agora possui a primeira API local do produto. Ela usa arquivo JSON como persistência temporária, até a entrada do banco de dados definitivo.

## O que consigo fazer sozinho agora

- organizar a especificacao funcional do produto
- quebrar o MVP em etapas reais de desenvolvimento
- criar a primeira versao da aplicacao web com dados simulados
- estruturar telas de cliente e administracao MB
- implementar regras visuais de planos e permissoes
- criar dashboards, DRE, fluxo de caixa e relatorios simulados
- criar telas de upload, documentos, pendencias, timeline e copiloto
- montar modelos iniciais de dados
- preparar backlog tecnico e roadmap
- documentar fluxos de operacao da equipe MB

## O que precisa de decisao da MB

- confirmacao final dos nomes e valores dos planos
- politica comercial de pagamento, recorrencia, contrato e cancelamento
- escolha futura do provedor de pagamento para Pix e cartao
- prioridade das integracoes reais
- dominio oficial do produto
- textos juridicos, LGPD, termos de uso e politica de privacidade
- quais clientes entram no piloto
- quais relatorios padronizados a MB quer entregar primeiro
- SLAs comerciais por plano
- stack tecnica final, caso a MB ja tenha preferencia

## Proximo passo recomendado

Validar o escopo em `product/MVP.md`, fechar as decisoes principais em `product/DECISOES_PENDENTES.md` e iniciar a aplicacao real dentro de `apps/web`.
