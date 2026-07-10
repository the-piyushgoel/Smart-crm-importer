# Stage 1: Build & Install Dependencies
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
# Install production dependencies only
RUN npm ci --omit=dev

# Stage 2: Production Release
FROM node:22-alpine

# Set node environment to production
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application source code
COPY src ./src
COPY package*.json ./

# Switch to non-root user (provided by node image)
USER node

# Expose backend port
EXPOSE 3000

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start the application
CMD ["node", "src/app.js"]
