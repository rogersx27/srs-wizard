FROM node:22-alpine AS builder

RUN apk add --no-cache openssl ca-certificates python3 make g++
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22-alpine

RUN apk add --no-cache ca-certificates openssl
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /data && ./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/next start"]
