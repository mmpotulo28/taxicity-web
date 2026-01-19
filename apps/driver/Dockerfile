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
RUN turbo prune --scope=driver-app --docker

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
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy schema and config so postinstall can run during install
COPY --from=pruner /app/out/full/packages/database/prisma ./packages/database/prisma
COPY --from=pruner /app/out/full/packages/database/prisma.config.ts ./packages/database/prisma.config.ts

# Set dummy DATABASE_URL to allow prisma generate to run during install
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxicity"

RUN pnpm install --frozen-lockfile

# Copy source code from pruner (only what's needed for this app)
COPY --from=pruner /app/out/full/ .

# Explicitly generate Prisma Client
# We ensure openssl and ca-certificates are installed for Prisma
RUN apk add --no-cache openssl ca-certificates
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN pnpm db:generate

# Build the project
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=driver-app...

# 3. Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# COPY --from=builder /app/apps/driver/public ./apps/driver/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/driver/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/driver/.next/static ./apps/driver/.next/static

# Fix for "type": "module" in package.json causing server.js to run as ESM
# We rename to .cjs to force Node to treat it as CommonJS
RUN mv apps/driver/server.js apps/driver/server.cjs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/driver/server.cjs"]
