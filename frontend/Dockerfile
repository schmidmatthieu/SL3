FROM node:20.11.1-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Development stage
FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["pnpm", "dev"]

# Production stage
FROM base AS production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm install
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]
