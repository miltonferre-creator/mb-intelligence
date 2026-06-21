# Integracao Web + API

Esta etapa conecta a interface web da MB Intelligence ao backend local.

## O que ja esta integrado

- login via `POST /auth/login`
- sessao por token Bearer
- cadastro comercial via `POST /auth/register-client`
- sincronizacao de planos via `GET /plans`
- sincronizacao de clientes via `GET /clients`
- sincronizacao de documentos via `GET /documents`
- sincronizacao de importacoes via `GET /imports`
- sincronizacao de tarefas via `GET /tasks`
- sincronizacao de mensagens via `GET /messages`
- sincronizacao de financeiro via `GET /finance/:clientId`
- sincronizacao de auditoria via `GET /audit`
- cadastro de cliente via `POST /clients`
- atualizacao de plano via `PATCH /plans/:id`
- atualizacao financeira via `PATCH /finance/:clientId`
- publicacao de documento via `POST /documents`
- registro de importacao via `POST /imports`
- criacao de usuario via `POST /users`
- envio de mensagem via `POST /messages`

## Estrategia atual

A web usa a API quando ela esta disponivel.

Se a API estiver desligada, a web continua operando em modo local usando `localStorage`.

Essa abordagem permite continuar desenvolvendo telas e experiencia sem travar por infraestrutura, mas ja prepara a aplicacao para operar com backend real.

## Backend

Pasta:

`C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\api`

Iniciar:

```powershell
.\start-api.ps1
```

URL:

```text
http://localhost:3333
```

## Frontend

Pasta:

`C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\web`

Abrir:

```text
C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\web\index.html
```

## Proxima etapa tecnica

Substituir a persistencia em arquivo JSON da API por banco de dados real, mantendo as mesmas rotas principais.
