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
RUN turbo prune --scope=websocket-server --docker

# 2. Install dependencies & Build
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's from pruner
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install deps (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code from pruner
COPY --from=pruner /app/out/full/ .

# Build the project
RUN pnpm turbo build --filter=websocket-server...

# 3. Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy the entire workspace from builder (simplest for non-bundled Node apps)
# This ensures all node_modules and structure are present
COPY --from=builder --chown=expressjs:nodejs /app .

# Switch to the websocket app directory
WORKDIR /app/apps/websocket

USER expressjs

EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3006/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
