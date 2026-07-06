# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies using cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application files
COPY . .

# Build the production assets
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Server
# ==========================================
FROM nginx:1.25-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy production build files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
