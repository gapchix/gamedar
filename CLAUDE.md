# Gamedar — Project Guidelines

## What is this?

AI-powered game calendar generator. Users select preferences (platform, genre, hours per week, period) and the app generates a personalized game calendar using Claude API for scheduling logic and IGDB API for game data.

## Tech Stack

- **Framework:** Next.js 15+ with App Router, TypeScript (strict mode)
- **UI:** Chakra UI v3 (no Tailwind, no other UI libs), react-hook-form + Zod for forms
- **ORM:** Prisma v7 with PostgreSQL via `@prisma/adapter-pg`
- **AI:** Claude API (`@anthropic-ai/sdk`) — for calendar generation, model configurable via `ANTHROPIC_MODEL` env var
- **Game Data:** IGDB API (Twitch OAuth, axios client) — game search by platform/genre/theme + time-to-beat
- **HTTP:** axios for external API clients
- **Infra:** Docker + Docker Compose

## Project Structure

```
src/
├── app/                # Next.js App Router — routes and layouts only
│   ├── layout.tsx      # Root layout (HTML, Providers, Header, Footer)
│   ├── providers.tsx   # Client-side ChakraProvider wrapper
│   ├── page.tsx        # Homepage (/)
│   ├── calendars/      # Calendar routes
│   │   ├── page.tsx    # Calendar list (/calendars)
│   │   ├── add/        # Generate calendar (/calendars/add)
│   │   └── [id]/       # View calendar (/calendars/:id)
│   └── api/calendars/  # API routes
│       ├── route.ts    # POST (create + generate) + GET (list)
│       └── [id]/route.ts # GET (single calendar with games)
├── components/         # Shared UI components
│   ├── header/         # Site header/navigation
│   ├── footer/         # Site footer
│   ├── calendar-form/  # Calendar generation form (react-hook-form + Zod + Chakra UI)
│   ├── toaster/        # Toast notification setup (createToaster + Toaster component)
│   └── sections/       # Homepage sections (hero, features, how-it-works, faq, cta-bottom)
├── lib/                # Shared libraries
│   ├── prisma.ts       # Prisma client singleton
│   ├── igdb.ts         # IGDB API client (axios instance, Twitch OAuth, game search)
│   └── anthropic.ts    # Anthropic client singleton + schedule generation
├── types/              # Shared TypeScript types and interfaces
│   ├── calendar.ts     # Form schema (Zod), platform/genre/period/playStyle enums
│   ├── igdb.ts         # IGDB genre/theme/platform ID mappings, game types
│   └── generation.ts   # Claude generation input/output types (Zod schemas)
└── utils/              # Shared utility functions
prisma/
├── schema.prisma       # Database schema (Calendar, CalendarGame models)
├── migrations/         # Prisma migrations (single init migration)
prisma.config.ts        # Prisma v7 config (datasource URL lives here, not in schema)
generated/              # Prisma generated client (gitignored)
```

## File & Component Conventions

- **All file names are lowercase** — use kebab-case for multi-word names (e.g., `how-it-works.tsx`)
- **Components use folder structure:** `component-name/index.ts` (re-export) + `component-name/component-name.tsx` (implementation)
- **Top-level src dirs** (`components/`, `utils/`, `types/`, `lib/`) each have an `index.ts` barrel export
- Example:
  ```
  src/components/
    index.ts                  # export * from "./header"
    header/
      index.ts                # export { Header } from "./header"
      header.tsx              # component implementation
  ```

## Rules

- **Always use latest versions** of all packages. Never pin to older versions.
- **Chakra UI v3 only** — no Tailwind, no additional UI libraries. ChakraProvider requires `"use client"` wrapper and `value={defaultSystem}` prop. Global `colorPalette` is set to `"purple"` in theme — don't add `colorPalette="purple"` on individual components.
- **Form validation:** Use Zod schemas (in `src/types/`) with `@hookform/resolvers/zod`. Define schema first, infer TypeScript types from it.
- **`src/app/` is for routing only** — shared code goes in `components/`, `lib/`, `types/`, `utils/`.
- **Don't install packages the user didn't request.** Transitive dependencies are fine, but don't add extra explicit dependencies without asking.
- **Prisma v7:** DB URL is configured in `prisma.config.ts`, not in `schema.prisma`. Client is generated to `./generated/prisma/`. Use `@prisma/adapter-pg` for the PrismaClient constructor. DB column names use snake_case via `@map()`, Prisma fields stay camelCase.
- **Database:** PostgreSQL 17 via Docker Compose, exposed on host port 5532. `DATABASE_URL` uses `localhost:5532`.
- **IGDB API:** Uses a dedicated axios instance with request/response interceptors for auth. "Action" and "Horror" are IGDB **themes** (not genres) — mapped via `igdbThemeMap`. Time-to-beat is a separate endpoint (`/game_time_to_beats`), not a nested field. Token is cached with 5-min buffer before expiry.
- **Claude API:** Singleton client pattern (same as Prisma). Model set via `ANTHROPIC_MODEL` env var (required). `generateSchedule()` returns Zod-validated `GenerationResult`.
- **Rate limiting:** Global daily generation limit via `DAILY_GENERATION_LIMIT` env var (defaults to `5`). Counted from `Calendar.createdAt` rows today. API returns 429 when exceeded.
- **No client-side data fetching.** Never use `fetch`, `axios`, or any HTTP calls from client components. Always fetch data server-side in page/layout components (Server Components) and pass it as props to client components.
- **Prettier config** uses `.prettierrc` (not `.prettierrc.json`).
- **Keep docs updated** — when making significant changes, update README.md and CLAUDE.md accordingly.
- **Open-source repo** — no secrets, credentials, or API keys in code. Use environment variables. Keep code, comments, and commit messages clean and professional.

## Code Quality

- **ESLint:** Flat config (`eslint.config.mjs`) with `eslint-config-next`, Prettier integration
- **Prettier:** Configured in `.prettierrc`
- **Husky:** Pre-commit hook runs `lint-staged`
- **lint-staged:** ESLint --fix + Prettier on `*.{ts,tsx}`, Prettier on `*.{json,md,yml,yaml}`
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — runs ESLint + Prettier check on push to `main` and PRs

## Commands

```bash
docker compose up db -d   # Start PostgreSQL (exposed on port 5532)
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Regenerate Prisma client after schema changes
npm run dev               # Start dev server
npm run build             # Production build
npm run lint              # Run ESLint
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without writing
```

## Path Alias

`@/*` maps to `./src/*` — use it for all imports from src.

## TODO

- [x] Project init (Next.js, Chakra UI, ESLint, Prettier, Husky)
- [x] Homepage with sections (hero, features, how-it-works, faq, cta-bottom)
- [x] Calendar form page (`/calendars/add`) with Zod validation
- [x] Prisma schema (Calendar, CalendarGame models) + init migration
- [x] Docker Compose with PostgreSQL 17
- [x] IGDB API client (`src/lib/igdb.ts`)
- [x] Claude API integration (`src/lib/anthropic.ts`) — AI calendar generation
- [x] API routes: POST/GET `/api/calendars`, GET `/api/calendars/[id]`
- [x] Global daily generation limit (`DAILY_GENERATION_LIMIT` env var, default 5)
- [x] Wire up CalendarForm to submit to API (server action + toast notifications)
- [ ] Calendar view page (`/calendars/[id]`) — display generated calendar with games
- [x] Calendar list page (`/calendars`) — browse all calendars
