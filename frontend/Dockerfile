# ── Stage: Development ────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm install

# Copy source (overridden by volume mount in dev)
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Vite dev server — host flag needed for Docker networking
CMD ["npm", "run", "dev"]
