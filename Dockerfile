# =========================================================================
# AMIX — Sovereign AI Architecture & 12-Agent Fleet Gateway Dockerfile
# Multi-stage production container for Node.js engine & MCP server
# =========================================================================

FROM node:20-alpine AS base
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --ignore-scripts --omit=dev

# Copy source trees
COPY cli ./cli
COPY core ./core
COPY test ./test
COPY ui ./ui
COPY index.html ./

# Healthcheck
EXPOSE 8080 8081

ENV NODE_ENV=production
ENV PORT=8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "core/src/mcp/server.js"]
