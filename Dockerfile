# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built assets
COPY --from=build /app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/server.js"]
