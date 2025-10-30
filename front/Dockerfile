# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV CI=true
COPY package*.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install only production dependencies for runtime
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "run", "start"]


