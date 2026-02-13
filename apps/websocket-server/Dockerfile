# Use Node.js 20 Alpine for smaller image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.23.0 --activate

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy package files and install production dependencies
COPY package.json ./
RUN pnpm install --prod

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

# Start the server
CMD ["pnpm", "start"]