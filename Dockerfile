# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- deps: install once, reused by both the build and the migrate/seed stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js production build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The build never touches the database (every DB-backed route is force-dynamic),
# so no DATABASE_URL is needed here.
RUN npm run build

# ---- migrator: small image with dev deps (tsx) for running db:migrate / db:seed
# as one-off `docker compose run` commands — not part of the running app.
FROM deps AS migrator
WORKDIR /app
COPY src/db ./src/db
COPY tsconfig.json ./
CMD ["npm", "run", "db:migrate"]

# ---- runner: minimal production image, only the standalone server output
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
