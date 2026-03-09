# ============================================================
# Stage 1 — Build
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build -- --configuration=production

# ============================================================
# Stage 2 — Serve
# ============================================================
FROM nginx:alpine AS runner

# Copia o nginx.conf completo
COPY nginx.conf /etc/nginx/nginx.conf

# Entrypoint: substitui BACKEND_URL via sed e inicia o nginx
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copia os arquivos estáticos do build Angular
COPY --from=builder /app/dist/pix-qrcode-generator-front/browser /usr/share/nginx/html

ENV NODE_ENV=production
# Defina no Coolify: URL do serviço Spring Boot (ex: http://pix-backend:8080)
ENV BACKEND_URL=http://localhost:8080

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
