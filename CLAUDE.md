# Gamedar — Project Guidelines

## What is this?

AI-powered game calendar generator. Users select preferences (platform, genre, hours per week, period) and the app generates a personalized game calendar using Claude API for scheduling logic and IGDB API for game data.

## Tech Stack

- **Framework:** Next.js 15+ with App Router, TypeScript (strict mode)
- **UI:** Chakra UI v3 (no Tailwind, no other UI libs)
- **ORM:** Prisma v7 with PostgreSQL via `@prisma/adapter-pg`
- **AI:** Claude API (Anthropic SDK) — for calendar generation
- **Game Data:** IGDB API
- **Infra:** Docker + Docker Compose

## Project Structure

```
src/
├── app/                # Next.js App Router — routes and layouts only
│   ├── layout.tsx      # Root layout (HTML, Providers, Header, Footer)
│   ├── providers.tsx   # Client-side ChakraProvider wrapper
│   ├── page.tsx        # Homepage (/)
│   └── calendars/      # Calendar routes
│       ├── page.tsx    # Calendar list (/calendars)
│       ├── add/        # Generate calendar (/calendars/add)
│       └── [id]/       # View calendar (/calendars/:id)
├── components/         # Shared UI components
│   ├── header/         # Site header/navigation
│   ├── footer/         # Site footer
│   └── sections/       # Homepage sections (hero, features, how-it-works, faq, cta-bottom)
├── lib/                # Shared libraries (prisma client, API clients, etc.)
├── types/              # Shared TypeScript types and interfaces
└── utils/              # Shared utility functions
prisma/
├── schema.prisma       # Database schema
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
- **Chakra UI v3 only** — no Tailwind, no additional UI libraries. ChakraProvider requires `"use client"` wrapper and `value={defaultSystem}` prop.
- **`src/app/` is for routing only** — shared code goes in `components/`, `lib/`, `types/`, `utils/`.
- **Don't install packages the user didn't request.** Transitive dependencies are fine, but don't add extra explicit dependencies without asking.
- **Prisma v7:** DB URL is configured in `prisma.config.ts`, not in `schema.prisma`. Client is generated to `./generated/prisma/`. Use `@prisma/adapter-pg` for the PrismaClient constructor.
- **Prettier config** uses `.prettierrc` (not `.prettierrc.json`).
- **Keep docs updated** — when making significant changes, update README.md and CLAUDE.md accordingly.
- **Open-source repo** — no secrets, credentials, or API keys in code. Use environment variables. Keep code, comments, and commit messages clean and professional.

## Code Quality

- **ESLint:** Flat config (`eslint.config.mjs`) with `eslint-config-next`, Prettier integration
- **Prettier:** Configured in `.prettierrc`
- **Husky:** Pre-commit hook runs `lint-staged`
- **lint-staged:** ESLint --fix + Prettier on `*.{ts,tsx}`, Prettier on `*.{json,md,yml,yaml}`

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without writing
npx prisma generate   # Regenerate Prisma client after schema changes
```

## Path Alias

`@/*` maps to `./src/*` — use it for all imports from src.
