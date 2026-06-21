# Estratégia de Arquivos - Supabase Storage

## Princípio

Arquivos não devem ser gravados dentro do banco.

O arquivo físico fica no Supabase Storage, dentro de um bucket privado.

O banco guarda apenas os metadados na tabela `documents`.

## Bucket

Nome recomendado:

```text
mb-documents
```

Tipo:

```text
Privado
```

Motivo: documentos fiscais, contábeis, trabalhistas e financeiros são sensíveis.

## Metadados no banco

Tabela:

```text
public.documents
```

Campos principais:

- `client_id`
- `company_id`
- `competence`
- `category`
- `document_type`
- `file_name`
- `file_extension`
- `mime_type`
- `file_size`
- `storage_bucket`
- `storage_path`
- `status`
- `visibility`
- `version`
- `uploaded_by`
- `created_at`

## Convenção de caminho

```text
client/<client_id>/documents/<yyyy-mm>/<category>/<uuid>-<filename>
client/<client_id>/imports/<yyyy-mm>/<source_type>/<uuid>-<filename>
```

Exemplo:

```text
client/8f.../documents/2026-05/Fiscal/1b...-das-maio-2026.pdf
client/8f.../imports/2026-05/OFX/7c...-extrato-maio.ofx
```

## Fluxo recomendado de upload

### Upload pela equipe MB

1. Operador MB envia arquivo pela plataforma.
2. API valida usuário e permissões.
3. API envia o arquivo para Supabase Storage usando `service_role key`.
4. API grava metadados em `documents`.
5. Cliente visualiza o documento no portal se `visibility = Cliente`.

### Upload pelo cliente

1. Cliente envia arquivo solicitado.
2. API valida se o cliente pertence ao `client_id`.
3. API salva arquivo em pasta de entrada.
4. Documento fica com status `Aguardando validação MB`.
5. Equipe MB revisa e publica, rejeita ou reclassifica.

## Download

1. Cliente clica em abrir/baixar.
2. API valida permissão.
3. API gera URL assinada temporária no Supabase Storage.
4. Cliente baixa sem expor o bucket publicamente.

## Por que URL assinada

Como o bucket é privado, o cliente não deve acessar arquivos por URL pública permanente.

URLs assinadas reduzem risco porque expiram em poucos minutos.

## Status implementado

- Publicação de documentos pela equipe MB já envia arquivo ao Storage.
- Importações da equipe MB e do cliente já podem anexar arquivo.
- Download já usa URL assinada temporária de 5 minutos.
- Bucket permanece privado.

## Observação LGPD

Antes de produção, definir:

- tempo de retenção
- política de exclusão
- logs de download
- controle de versões
- criptografia em repouso e trânsito
- termos de uso e política de privacidade
