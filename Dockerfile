# Etapa 1: Build de la PWA Local-First
FROM node:20-alpine AS builder

# Habilitar corepack para usar pnpm
RUN corepack enable

WORKDIR /app

# Copiar configuración del monorepo
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY packages/washy-ui/package.json ./packages/washy-ui/
COPY packages/washy-core/package.json ./packages/washy-core/

# Instalar dependencias respetando el workspace
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar la aplicación React/Vite (PWA Estática)
RUN pnpm --filter "washy-ui" build

# Etapa 2: Servidor Web Ligero (Nginx) para Railway
FROM nginx:alpine

# Copiar la app compilada al servidor Nginx
COPY --from=builder /app/packages/washy-ui/dist /usr/share/nginx/html

# Inyectar configuración para PWA (Enrutamiento SPA y Headers OPFS/WASM)
RUN echo 'server { \
    listen ${PORT:-80}; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Requisito para SQLite WASM OPFS (Cross-Origin Isolation) \
    add_header Cross-Origin-Opener-Policy "same-origin"; \
    add_header Cross-Origin-Embedder-Policy "require-corp"; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Iniciar Nginx
CMD ["/bin/sh", "-c", "envsubst '\\$PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
