# -- deps --
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# -- prod-deps: node_modules without devDependencies, for the runner --
FROM deps AS prod-deps
RUN npm prune --omit=dev

# -- builder --
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# -- runner --
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# Production dependencies only (prisma CLI for `migrate deploy` at container
# start, plus the app's runtime deps) — devDependencies stay out of the image.
COPY --from=prod-deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
