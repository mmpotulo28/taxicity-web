FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune the workspace
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=user-app --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's from pruner
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install deps (frozen lockfile for reproducibility)
# Skip prisma generation during install, we'll do it explicitly
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN pnpm install --frozen-lockfile

# Copy source code from pruner (only what's needed for this app)
COPY --from=pruner /app/out/full/ .

# Explicitly generate Prisma Client
# We ensure openssl and ca-certificates are installed for Prisma
RUN apk add --no-cache openssl ca-certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN pnpm db:generate

# Build the project
# Note: We filter to only build the user app and its dependencies
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=user-app...

# 3. Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# We need to copy public folder and the standalone build
COPY --from=builder /app/apps/user/public ./apps/user/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/user/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/user/.next/static ./apps/user/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/user/server.js"]
