# ==============================================================================
# CareNest API - Multi-Stage Production Dockerfile
# Optimized for minimal image size, non-root security, and high reliability.
# ==============================================================================

# STAGE 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client & compile TypeScript
COPY tsconfig.json ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# STAGE 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for Prisma engine
RUN apk add --no-cache openssl libc6-compat dumb-init

# Create non-root user for security compliance
USER node

# Copy built artifacts and runtime dependencies
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 5000

# Use dumb-init to properly handle UNIX signals and avoid zombie processes
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]

