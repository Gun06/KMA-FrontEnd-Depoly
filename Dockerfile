# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    else npm ci; fi

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ 빌드타임 인자 → Next 빌드에서 읽히도록 환경변수로 승격
ARG NEXT_PUBLIC_API_BASE_URL_USER
ARG NEXT_PUBLIC_API_BASE_URL_ADMIN
ENV NEXT_PUBLIC_API_BASE_URL_USER=$NEXT_PUBLIC_API_BASE_URL_USER
ENV NEXT_PUBLIC_API_BASE_URL_ADMIN=$NEXT_PUBLIC_API_BASE_URL_ADMIN
ENV NEXT_TELEMETRY_DISABLED=1

# next.config.mjs: export default { output: 'standalone' }
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# healthcheck용 도구
RUN apk add --no-cache curl

# standalone 산출물만 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node","server.js"]
