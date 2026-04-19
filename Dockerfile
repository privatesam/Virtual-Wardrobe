FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the frontend assets
RUN npm run build

# Expose the correct port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the unified server using native TypeScript stripping
# (Supported natively in Node.js 22.6.0+)
CMD ["node", "server.ts"]
