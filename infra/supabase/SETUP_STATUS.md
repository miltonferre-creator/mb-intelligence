# Status da Configuracao Supabase

## Concluido

- Projeto Supabase configurado no backend local.
- Variaveis sensiveis guardadas em `apps/api/.env`.
- `.env` protegido pelo `.gitignore`.
- Bucket privado `mb-documents` criado.
- Migrations SQL aplicadas no PostgreSQL.
- Dados iniciais carregados no Supabase.
- API validada em modo `supabase`.

## Validado

- REST do Supabase respondendo.
- Tabela `plans` disponivel.
- Bucket `mb-documents` disponivel.
- Login via Supabase Auth funcionando.
- API local lendo planos, clientes, documentos, DRE e fluxo de caixa do Supabase.

## Driver Atual

O backend esta configurado com:

```text
MBI_STORAGE_DRIVER=supabase
```

Para iniciar a API:

```powershell
cd "C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\api"
.\start-api.ps1
```

## Proximos Cuidados Antes de Producao

- Trocar senhas temporarias de usuarios seed.
- Revisar politicas finais de RLS por perfil.
- Implementar upload real de arquivos pelo navegador.
- Implementar URLs assinadas para download seguro de documentos.
- Criar rotina de backup e retencao de arquivos.
