# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src

# Non-root user pour limiter la surface d'attaque.
RUN addgroup -S bac && adduser -S bac -G bac
USER bac

EXPOSE 4000
CMD ["node", "src/index.js"]
