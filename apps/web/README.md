# Aplicacao Web

Esta pasta recebera a primeira versao real da aplicacao MB Intelligence.

Antes de iniciar o codigo definitivo, usar como referencia:

- `../../reference/prototipo-atual`
- `../../product/MVP.md`
- `../../backlog/BACKLOG_MVP.md`
- `../../architecture/VISAO_TECNICA_INICIAL.md`

## Direcao inicial

A primeira versao da aplicacao deve usar dados simulados bem estruturados, para validar navegacao, telas, regras de plano, dashboards, relatorios e operacao MB antes da implementacao de banco de dados e backend real.

## Objetivo da primeira entrega

Criar um produto navegavel, mais proximo de um SaaS real, com:

- login unico visual
- portal do cliente
- administracao MB
- gestao de clientes e planos
- documentos
- inteligencia financeira
- Copiloto MB
- DRE e fluxo de caixa
- relatorios para impressao/exportacao
- dashboard operacional MB

## Persistencia simulada

A aplicacao agora tenta usar primeiro a API local em `http://localhost:3333`.

Quando a API esta ligada, a web usa o backend para:

- login
- sessao por token
- cadastro de clientes
- cadastro de usuarios
- alteracao de planos e precos
- publicacao de documentos
- registro de importacoes
- atualizacao de indicadores financeiros
- mensagens
- sincronizacao de auditoria

Quando a API esta desligada, a aplicacao continua funcionando com `localStorage` como fallback temporario para:

- valores dos planos
- plano contratado de cada cliente
- clientes cadastrados
- usuarios criados
- documentos publicados
- importacoes registradas
- indicadores financeiros alimentados pela MB
- mensagens e auditoria operacional

Isso permite testar a experiencia de administracao sem banco de dados. Na etapa tecnica, essa camada sera substituida por API, banco de dados, auditoria e controle real de permissoes.

## Como usar com backend

1. Iniciar a API:

```powershell
cd "C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\api"
.\start-api.ps1
```

2. Abrir a web:

```text
C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\web\index.html
```

Com a API ligada, os dados passam pelo backend. Com a API desligada, a web entra em modo local.

## Estrutura real da aplicacao

- `app.js`: inicializacao, rotas, eventos e acoes globais.
- `src/data`: base inicial local.
- `src/core`: armazenamento local e autenticacao de sessao.
- `src/services`: regras de cadastro, planos, documentos, importacoes, usuarios, financeiro e auditoria.
- `src/components`: componentes visuais reutilizaveis.
- `src/pages`: paginas do login, portal do cliente e administracao MB.
- `app.prototype.js`: versao antiga preservada como referencia.

## Acessos locais

- `admin@mbempresas.com.br` / `123456`
- `financeiro@mbempresas.com.br` / `123456`
- `cfo@cliente.com` / `123456`
- `financeiro@cliente.com` / `123456`
- `contabilidade@cliente.com` / `123456`

## Arquivo de entrada

Abrir:

`C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\web\index.html`
