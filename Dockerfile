# Stage 1: Build
FROM node:24-bullseye-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:24-bullseye-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Create upload directories
RUN mkdir -p uploads/avatars uploads/it-asset uploads/knowledge-books

# Set production environment
ENV NODE_ENV=production

# Expose the API port
EXPOSE 2530

# Start the application
CMD ["node", "dist/main"]
