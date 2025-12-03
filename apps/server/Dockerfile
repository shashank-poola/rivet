FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application (skip TypeScript build for now)
# RUN npm run build

# Expose port
EXPOSE 3000

# Start the application directly with tsx
CMD ["npx", "tsx", "index.ts"]