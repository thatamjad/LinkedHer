# Multi-stage build for production optimization

# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY backend/ ./

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy backend
COPY --from=backend-build --chown=nextjs:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/build ./frontend/build

# Create uploads directory
RUN mkdir -p ./backend/uploads && chown nextjs:nodejs ./backend/uploads

USER nextjs

EXPOSE 5000

WORKDIR /app/backend

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
