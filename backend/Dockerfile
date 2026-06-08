# ── Stage: Development ────────────────────────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source (overridden by volume mount in dev)
COPY . .

# Expose API port
EXPOSE 4000

# Start server (overridden by docker-compose for dev)
CMD ["npm", "start"]
