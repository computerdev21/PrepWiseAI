# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm ci && \
    npm install -g typescript@5.3.2 && \
    npm list typescript || true

# Copy source code and config files
COPY tsconfig.json ./
COPY src/ ./src/
COPY .env.local .env

# Show debug info
RUN echo "TypeScript version:" && tsc --version && \
    echo "Contents of /app:" && ls -la && \
    echo "Contents of /app/src:" && ls -la src/

# Create dist directory and build
RUN mkdir -p dist && \
    tsc --project ./tsconfig.json --outDir ./dist

# Production stage
FROM node:20-slim

WORKDIR /app

# Create directory for service account credentials
RUN mkdir -p /secrets

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# Start the service
CMD [ "npm", "start" ] 