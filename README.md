# Gamedar

AI-powered game calendar generator. Select your platform, favorite genres, and available hours — get a personalized gaming schedule.

## Tech Stack

- Next.js 15+ (App Router, TypeScript)
- Chakra UI v3 + react-hook-form + Zod
- Prisma v7 + PostgreSQL
- Claude API via `@anthropic-ai/sdk` (AI scheduling)
- IGDB API via axios (game data)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys:
#   DATABASE_URL          - PostgreSQL connection string
#   IGDB_CLIENT_ID        - From Twitch Developer Console
#   IGDB_CLIENT_SECRET    - From Twitch Developer Console
#   ANTHROPIC_API_KEY     - From Anthropic Console
#   ANTHROPIC_MODEL       - Claude model ID (default: claude-sonnet-4-20250514)
#   DAILY_GENERATION_LIMIT - Max calendars per day, global (default: 5)
cp .env.example .env

# Start PostgreSQL via Docker (exposed on port 5532)
docker compose up db -d

# Run migrations (also generates Prisma client)
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Deployment

```bash
# Configure production environment
cp .env.example .env
# Edit .env: set DATABASE_URL=postgresql://user:pass@db:5432/gamedar
# and fill in API keys, set NEXT_PUBLIC_APP_URL to your domain

# Build and start
make prod-build
make prod-up
```

The app runs on `localhost:3001` (bind to localhost only). Use Nginx to reverse-proxy to it.

PostgreSQL is internal to the Docker network (no port exposed to host).

```bash
make prod-logs            # View logs
make prod-down            # Stop everything
make prod-migrate         # Run migrations
```

## Scripts

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `make dev-db`          | Start dev database (port 5532) |
| `make dev`             | Start dev server               |
| `make migrate`         | Run Prisma migrations (dev)    |
| `make generate`        | Regenerate Prisma client       |
| `make prod-build`      | Build production Docker image  |
| `make prod-up`         | Start production containers    |
| `make prod-down`       | Stop production containers     |
| `make prod-logs`       | Tail production logs           |
| `npm run lint`         | Run ESLint                     |
| `npm run format`       | Format all files with Prettier |
| `npm run format:check` | Check formatting               |

## Project Structure

```
src/
├── app/              # Routes and layouts
│   ├── page.tsx      # Homepage
│   └── calendars/    # /calendars, /calendars/add, /calendars/:id
├── components/       # Shared UI (header, footer, calendar-form, calendar-list, calendar-view, share-button, sections)
├── lib/              # Libraries (Prisma, IGDB client, Anthropic client)
├── types/            # Shared TypeScript types (Zod schemas, IGDB mappings)
└── utils/            # Utility functions
prisma/
└── schema.prisma     # Database schema
```

## CI

GitHub Actions runs ESLint and Prettier checks on every push to `main` and on pull requests.

## License

MIT
