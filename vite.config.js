import { defineConfig } from "vite";

// Build do front (vanilla JS). root = apps/web; publicDir = apps/web/public
// (mantem /assets/* no mesmo caminho usado em runtime nas strings de innerHTML).
export default defineConfig({
  root: "apps/web",
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
