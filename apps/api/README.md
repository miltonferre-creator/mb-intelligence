# MB Intelligence API

Backend local da MB Intelligence.

Nesta fase, a API ja possui rotas reais, login, sessoes, cadastros, planos, documentos, clientes, dados financeiros e leitura persistente no Supabase. O arquivo JSON continua existindo como fallback local, mas o driver ativo do produto esta configurado para Supabase.

## Como iniciar

Na pasta `apps/api`:

```powershell
.\start-api.ps1
```

URL local:

```text
http://localhost:3333
```

O script escolhe automaticamente o servidor correto conforme `MBI_STORAGE_DRIVER`.

## Driver ativo

```text
MBI_STORAGE_DRIVER=supabase
```

## Principais rotas

- `GET /health`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/register-client`
- `GET /plans`
- `PATCH /plans/:id`
- `GET /clients`
- `POST /clients`
- `PATCH /clients/:id`
- `GET /documents?clientId=...`
- `POST /documents`
- `GET /imports?clientId=...`
- `POST /imports`
- `GET /finance/:clientId`
- `PATCH /finance/:clientId`
- `GET /users`
- `POST /users`
- `GET /messages`
- `POST /messages`
- `GET /tasks`
- `POST /tasks`
- `GET /approvals`
- `PATCH /approvals/:id`
- `GET /audit`

## Supabase

Arquivos principais:

- `src/server-supabase.js`
- `src/lib/supabase-client.js`
- `src/scripts/check-supabase.js`
- `src/scripts/setup-supabase-storage.js`
- `src/scripts/apply-supabase-migrations.py`
- `src/scripts/seed-supabase.js`
- `..\..\infra\supabase\migrations`

Recursos configurados:

- PostgreSQL para dados estruturados.
- Supabase Auth para login.
- Supabase Storage privado para arquivos.
- Bucket `mb-documents`.
- Migrations aplicadas.
- Dados iniciais carregados.

## Armazenamento de Arquivos

Os metadados dos documentos ficam no PostgreSQL, na tabela `documents`.

Os arquivos em si devem ficar no Supabase Storage, no bucket privado `mb-documents`, usando caminhos por cliente, competencia e categoria. Exemplo:

```text
client/{clientId}/2026-05/fiscal/das-2026-05.pdf
```

Downloads seguros devem usar URLs assinadas com expiracao curta.

Status atual:

- Publicacao de documentos pela equipe MB envia arquivo real para o Storage.
- Importacoes da equipe MB e do cliente podem anexar arquivo real.
- O banco registra nome, categoria, tipo, competencia, tamanho, MIME type e caminho do Storage.
- Download pelo portal usa URL assinada temporaria de 5 minutos.

## Observacao de Seguranca

Este backend ja esta conectado ao Supabase, mas ainda nao deve ser considerado producao final. Antes de producao, entram revisao completa de RLS, politicas de acesso por perfil, troca de senhas temporarias, refresh token, rate limit, logs profissionais, HTTPS definitivo, backup e revisao LGPD.
