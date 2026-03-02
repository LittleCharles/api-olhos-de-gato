# ---- Build Stage ----
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copiar apenas package files primeiro (cache de deps)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar prisma schema e gerar client
COPY prisma ./prisma
RUN npx prisma generate

# Copiar resto do código e buildar
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Copiar apenas o necessário para produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Criar diretório de uploads
RUN mkdir -p /app/uploads

EXPOSE 3333

# Rodar migrations e iniciar servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
