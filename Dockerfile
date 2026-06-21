# ── MB Intelligence — Dockerfile de produção ────────────────────────────────
# Imagem base Node.js 20 (Alpine = leve, ~180MB)
FROM node:20-alpine

# Informações da imagem
LABEL org.opencontainers.image.title="MB Intelligence"
LABEL org.opencontainers.image.description="Plataforma de inteligência financeira MB Empresas"

# Diretório de trabalho dentro do container
WORKDIR /app

# Instala dependências primeiro (cache do Docker)
COPY apps/api/package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copia o código da API
COPY apps/api/ ./

# Copia o frontend estático
COPY apps/web/ ./web/

# Porta exposta (Railway/Render usam a variável PORT automaticamente)
EXPOSE 3333

# Variável para o servidor encontrar o frontend
ENV MBI_WEB_DIR=/app/web

# Healthcheck — Railway verifica se o serviço está saudável
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3333}/health || exit 1

# Inicia o servidor
CMD ["node", "src/server.js"]
