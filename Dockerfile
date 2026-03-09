# ============================================================
# Stage 1 — Build
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências primeiro (cache layer separada do código)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copia o restante e faz o build de produção
COPY . .
RUN npm run build -- --configuration=production

# ============================================================
# Stage 2 — Serve
# ============================================================
FROM nginx:1.27-alpine

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o template de config (envsubst aplicado automaticamente
# pelo entrypoint do nginx:alpine em /etc/nginx/templates/)
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copia os arquivos estáticos do build Angular
COPY --from=builder /app/dist/pix-qrcode-generator-front/browser /usr/share/nginx/html

EXPOSE 80

# BACKEND_URL deve ser definida no Coolify apontando para o
# serviço Spring Boot (ex: http://pix-backend:8080)
ENV BACKEND_URL=http://localhost:8080
