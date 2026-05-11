FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

FROM base AS builder
RUN apk add --no-cache libc6-compat openssl ca-certificates
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# @taxiciti/database postinstall runs prisma generate, so make schema/config available.
COPY --from=pruner /app/out/full/packages/database/prisma ./packages/database/prisma
COPY --from=pruner /app/out/full/packages/database/prisma.config.ts ./packages/database/prisma.config.ts

# Dummy value to allow Prisma client generation during image build.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxiciti"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=pruner /app/out/full/ ./

# Ensure Prisma client is generated for runtime.
RUN pnpm --filter @taxiciti/database generate

# Build API and workspace deps.
RUN pnpm turbo build --filter=api

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache openssl ca-certificates
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Keep workspace deps because pnpm links workspace packages from node_modules.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 3006
ENV PORT=3006

WORKDIR /app/apps/api
CMD ["node", "dist/main"]
