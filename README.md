# Gamedar

AI-powered game calendar generator. Select your platform, favorite genres, and available hours — get a personalized gaming schedule.

## Tech Stack

- Next.js 15+ (App Router, TypeScript)
- Chakra UI v3
- Prisma v7 + PostgreSQL
- Claude API (AI scheduling)
- IGDB API (game data)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.example .env

# Start PostgreSQL via Docker
docker compose up db -d

# Generate Prisma client
npx prisma generate

# Run migrations
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
├── components/       # Shared UI components (header, footer, sections)
├── lib/              # Libraries (Prisma client, API clients)
├── types/            # Shared TypeScript types
└── utils/            # Utility functions
prisma/
└── schema.prisma     # Database schema
```

## License

MIT
