# Migração para Vite + TypeScript (executar em branch, com teste local)

> **Por que não foi aplicado direto:** o deploy atual (sem build) está funcionando
> e o produto está em pré-venda. A migração muda o pipeline de build e tem 3
> armadilhas que **só um `npm run build` local revela**. O problema de cache que o
> Vite resolveria **já está mitigado** (headers `no-cache` + `?v=` no `vercel.json`),
> então não há urgência — dá para fazer com calma e teste.

## Benefícios
- **Hashing automático de assets** (acaba o `?v=` manual de vez).
- **Módulos ESM + tree-shaking + minificação** (bundle menor, 1 request).
- **TypeScript incremental** (pega erros de _shape_ em build, não em produção —
  exatamente a classe de bug que causou as telas brancas).

## Armadilhas (resolver durante o teste)
1. **Caminhos de asset em runtime.** O app injeta `<img src="assets/...">` dentro de
   strings de `innerHTML` (ex.: logo no login). O Vite NÃO reescreve esses caminhos.
   → Solução: manter `assets/` servido no mesmo caminho via `publicDir` (config abaixo).
2. **Strict mode.** Módulos ESM são sempre `"use strict"`. Os 17 IIFEs precisam estar
   livres de violações (variável global implícita, octal, `with`). `npm run build`
   acusa qualquer caso.
3. **`lucide.min.js`** é UMD/global — importar por efeito colateral (define `window.lucide`).

## Passo a passo

### 1. Dependências e scripts (`package.json` raiz)
```jsonc
"devDependencies": { "vite": "^5", "typescript": "^5" },
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "node --test tests/",
  "lint": "node scripts/check-syntax.js"
}
```

### 2. `apps/web/vite.config.js`
```js
import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  root: "apps/web",
  // Mantem assets/ no MESMO caminho do output (resolve a armadilha #1):
  publicDir: resolve(__dirname, "apps/web/assets"),
  build: { outDir: resolve(__dirname, "dist"), emptyOutDir: true },
});
```
> `publicDir` aponta para `assets/`; o conteúdo é copiado para `dist/` na raiz.
> Ajuste os `src="assets/x"` para `src="x"` OU coloque os arquivos em
> `apps/web/assets/assets/` — **valide no preview qual caminho casa.**

### 3. `apps/web/main.js` (entry — importa os IIFEs na ORDEM atual)
```js
import "./styles.css";
import "./assets/lucide.min.js";
import "./src/core/observability.js";
import "./src/data/seed.js";
import "./src/core/storage.js";
import "./src/core/api-client.js";
import "./src/core/sync.js";
import "./src/core/auth.js";
import "./src/services/audit-service.js";
import "./src/services/plan-service.js";
import "./src/services/client-service.js";
import "./src/services/document-service.js";
import "./src/services/import-service.js";
import "./src/services/user-service.js";
import "./src/services/finance-service.js";
import "./src/components/ui.js";
import "./src/pages/auth-pages.js";
import "./src/pages/client-pages.js";
import "./src/pages/admin-pages.js";
import "./app.js";
```

### 4. `index.html` (vira entry de módulo)
Faça **backup** do atual (`index.nobuild.html`) e troque os 19 `<script>` por:
```html
<script type="module" src="/main.js"></script>
```

### 5. Testar ANTES de virar o deploy
```bash
npm install
npm run build      # acusa strict-mode e erros de bundle
npm run preview    # abra e clique TUDO: login, dashboard, logo, ícones, modais
```
Só prossiga se o preview estiver idêntico ao site atual.

### 6. Virar o deploy (`vercel.json`)
```jsonc
"buildCommand": "npm install && npm run build",
"outputDirectory": "dist"
```
(Se o build falhar na Vercel, o deploy anterior continua no ar — não derruba o site.)

### 7. TypeScript incremental (depois do Vite estável)
`tsconfig.json` com `"allowJs": true, "checkJs": false`. Renomeie **um** service para
`.ts` por vez, adicione tipos, suba `checkJs` quando confortável. Comece pelos
`src/services/*` e por `server-supabase.js` (onde os bugs de _shape_ doem mais).

## Rollback
Reverter o `vercel.json` (buildCommand null, outputDirectory `apps/web`) e restaurar
`index.html` volta instantaneamente ao modo sem build.
