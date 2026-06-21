# MB Intelligence — Guia de Deploy em Produção

## Pré-requisitos
- Conta no [GitHub](https://github.com) (gratuito)
- Conta no [Railway](https://railway.app) (gratuito para começar)
- Conta no [Supabase](https://supabase.com) — projeto de produção separado
- Domínio (opcional para fase 1)

---

## Passo 1 — Subir o código no GitHub

No seu computador, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "versão inicial MB Intelligence"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/mb-intelligence.git
git push -u origin main
```

> O arquivo .env NÃO vai para o GitHub (está no .gitignore). As credenciais
> ficam apenas no Railway.

---

## Passo 2 — Criar projeto de produção no Supabase

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Dê o nome "mb-intelligence-producao"
4. Guarde a senha do banco
5. Aguarde criar (~2 min)
6. Vá em Settings → API e copie:
   - Project URL
   - anon key (pública)
   - service_role key (secreta — nunca expor)

---

## Passo 3 — Deploy no Railway

1. Acesse https://railway.app e faça login com GitHub
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione o repositório mb-intelligence
5. Railway detecta o Dockerfile automaticamente

### Configurar variáveis de ambiente no Railway:

No painel do projeto → "Variables" → adicione cada linha do .env.example
com os valores reais do Supabase de produção:

```
PORT                    = (deixe em branco — Railway define automaticamente)
SUPABASE_URL            = https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY       = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
SUPABASE_DB_HOST        = db.SEU-PROJETO.supabase.co
SUPABASE_DB_PORT        = 5432
SUPABASE_DB_NAME        = postgres
SUPABASE_DB_USER        = postgres
SUPABASE_DB_PASSWORD    = sua-senha
SUPABASE_DOCUMENTS_BUCKET = mb-documents
MBI_STORAGE_DRIVER      = supabase
MBI_CORS_ORIGIN         = https://SEU-DOMINIO.com.br
MBI_WEB_DIR             = /app/web
```

6. Clique em "Deploy" — o sistema fica no ar em ~3 minutos

---

## Passo 4 — Domínio personalizado (opcional)

No Railway → Settings → Domains:
- Railway dá um domínio gratuito: algo.railway.app
- Para domínio próprio: adicione o domínio e aponte o DNS

---

## Passo 5 — Verificar se está funcionando

Acesse: https://seu-app.railway.app/health

Deve retornar:
```json
{"status":"ok","name":"MB Intelligence API","version":"0.1.0"}
```

Acesse: https://seu-app.railway.app
Deve abrir o sistema MB Intelligence.

---

## Deploy automático (após configuração inicial)

A partir daí, sempre que fizer alteração no código:

```bash
git add .
git commit -m "descrição da alteração"
git push
```

Railway detecta o push e refaz o deploy automaticamente em ~2 minutos.

---

## Custos estimados

| Serviço   | Plano         | Custo/mês |
|-----------|---------------|-----------|
| GitHub    | Free          | R$ 0      |
| Railway   | Hobby         | ~R$ 25    |
| Supabase  | Free tier     | R$ 0      |
| Domínio   | .com.br/ano   | ~R$ 3,30  |
| **Total** |               | **~R$ 28**|

---

## Antes de colocar o primeiro cliente real

Resolva os 7 bloqueadores críticos identificados na auditoria:
1. Remover textos de desenvolvimento em auth-pages.js (linha 14)
2. Corrigir plano do cliente Silva no Supabase (contabilidade → cfo)
3. Deletar "Nova Empresa LTDA" do banco
4. Corrigir nome admin "Teste Editado" → "Marcos Lima"
5. Preencher CNPJ e CRC em app.js (MB_REPORT_CONFIG)
6. Executar migration: ALTER TABLE clients ADD COLUMN next_review_date date
7. Remover valores default do formulário #/contratar (senha "123456")
