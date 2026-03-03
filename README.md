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

### Docker (full stack)

```bash
docker compose up --build
```

This starts both the app and PostgreSQL.

## Scripts

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start dev server               |
| `npm run build`        | Production build               |
| `npm run lint`         | Run ESLint                     |
| `npm run format`       | Format all files with Prettier |
| `npm run format:check` | Check formatting               |

## Project Structure

```
src/
├── app/              # Routes and layouts
│   ├── page.tsx      # Homepage
│   └── calendars/    # /calendars, /calendars/add, /calendars/:id
├── components/       # Shared UI components (header, footer, calendar-form, sections)
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
