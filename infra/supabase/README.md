# Supabase - MB Intelligence

Esta pasta prepara a MB Intelligence para usar Supabase como banco de dados e armazenamento de arquivos.

## Por que Supabase

Supabase entrega no mesmo ecossistema:

- PostgreSQL gerenciado
- autenticação
- APIs automáticas
- storage de arquivos
- políticas de segurança com RLS
- painel administrativo

Isso combina bem com a fase atual da MB Intelligence: sair do protótipo, validar produto real e ainda manter velocidade.

## Arquivos

- `migrations/0001_initial_schema.sql`: tabelas principais do produto.
- `migrations/0002_rls_and_storage.sql`: políticas RLS e bucket privado `mb-documents`.
- `STORAGE_STRATEGY.md`: estratégia de upload, metadados e download por URL assinada.
- `SETUP_STATUS.md`: status atual da configuração do projeto Supabase.

## Ordem de execução

1. Criar um projeto no Supabase.
2. Abrir o SQL Editor.
3. Executar `0001_initial_schema.sql`.
4. Executar `0002_rls_and_storage.sql`.
5. Copiar `Project URL`, `anon key` e `service_role key`.
6. Configurar a API local com as variáveis do `.env`.

## Bucket de arquivos

O bucket recomendado é:

```text
mb-documents
```

Ele deve ser privado.

Arquivos ficam no Storage. O banco guarda os metadados na tabela `documents`.

Exemplo de caminho:

```text
client/<client_id>/company/<company_id>/competence/2026-05/Fiscal/<document_id>/das-maio.pdf
```

## Segurança

As tabelas usam Row Level Security. A documentação oficial da Supabase recomenda RLS para tabelas expostas no schema `public`, e buckets privados dependem de políticas em `storage.objects` para controlar download/upload.

Referências oficiais:

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/guides/storage/security/access-control

## Próxima implementação

Depois de criar o projeto Supabase, a API deve ganhar um adaptador real:

- trocar `data/db.json` por queries no Supabase
- usar `service_role key` apenas no backend
- manter `anon key` apenas na web quando necessário
- enviar arquivos para Supabase Storage
- gravar metadados em `documents`
