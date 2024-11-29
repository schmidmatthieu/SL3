# Base stage for both development and production
FROM node:18-alpine AS base

# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc musl-dev

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Development stage
FROM base AS development
COPY package*.json ./

# Install dependencies
RUN npm install -g @nestjs/cli \
    && npm install \
    && npm install @nestjs/swagger @nestjs/mapped-types \
    && npm install --save-dev @types/multer @types/express

COPY . .
ENV NODE_ENV=development
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production
COPY package*.json ./

# Install dependencies
RUN npm install -g @nestjs/cli \
    && npm install \
    && npm install @nestjs/swagger @nestjs/mapped-types \
    && npm install --save-dev @types/multer @types/express

COPY . .
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
