---
name: igdb-sync
description: Keep gamedar's IGDB ID mappings (src/types/igdb.ts) aligned with IGDB's live taxonomy. Use after adding an app genre/platform, when game search returns empty for a category, or as a periodic check that no IGDB genre/theme/platform ID has drifted.
disable-model-invocation: false
argument-hint: [optional: the genre/platform that changed]
allowed-tools: Bash, Read, Edit, Grep
---

# IGDB Sync — IGDB taxonomy → gamedar mappings

IGDB is the source of truth for game taxonomy. gamedar maps its own app enums
(`Platform`, `Genre` in `src/types/calendar.ts`) to IGDB **numeric IDs** in
`src/types/igdb.ts` — `igdbGenreMap`, `igdbThemeMap`, `igdbPlatformMap`. Those IDs are
hand-maintained and drift silently: IGDB can retire or rename an ID, or a new app genre
can be added without a mapping (an unmapped genre returns **zero games** with no error).

This skill detects that drift and walks the fix through **without ever rewriting
`igdb.ts`** — same flag-don't-edit posture as `/schema-sync` on gapchix.web.

## Scope (v1)

- **In scope (detect + advise):** verify every `genreValues` / `platformValues` entry has
  a mapping (coverage), and that every mapped IGDB ID still exists and its live name still
  relates to the app label (taxonomy drift).
- **Out of scope (flagged, never auto-done):** editing the maps, and choosing _which_ IGDB
  ID a new app category should use — that's a product decision (e.g. is "action" an IGDB
  genre or a theme?). The script advises; you edit `igdb.ts` deliberately.
- **Care:** editing `igdb.ts` is routine (full-auto under the gate). A prod deploy /
  `make prod-migrate` is irreversible — handle it per CLAUDE.md → "Autonomy".

## Detector script

```bash
node ${CLAUDE_SKILL_DIR}/scripts/igdb-sync.js            # human report (exit 2 if drift)
node ${CLAUDE_SKILL_DIR}/scripts/igdb-sync.js --json     # machine-readable
node ${CLAUDE_SKILL_DIR}/scripts/igdb-sync.js --offline  # coverage only, no IGDB creds
npm run igdb-sync                                        # convenience alias (same script)
```

It reads `igdbGenreMap` / `igdbThemeMap` / `igdbPlatformMap` from `src/types/igdb.ts` and
the enums from `src/types/calendar.ts`, fetches IGDB's live `/genres`, `/themes`,
`/platforms` (Twitch OAuth via `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET`, read from the env
or `.env`), and reports two signals — **coverage** and **taxonomy drift**. It never writes.
Exit: `0` in sync, `2` drift, `1` error.

## Steps

### 1. Detect drift

```bash
npm run igdb-sync
```

If it prints "In sync" (exit 0) — stop, nothing to do. Otherwise read the two blocks:

- **Coverage** — a `✗ genre 'X' has NO IGDB mapping` means an app genre returns zero games;
  fix it. A `· stale?` line means a map key no longer exists in the app enums (probably
  removable).
- **Live taxonomy drift** — `✗` = a mapped ID no longer exists in IGDB (must repoint);
  `⚠` = the ID exists but its live name no longer matches the app label (a rename — verify
  it still means what you intend, e.g. a `playstation` ID that now resolves to a specific
  console generation).

### 2. Apply the fix by hand

Edit `src/types/igdb.ts`:

- **Unmapped genre** — decide whether it belongs in `igdbGenreMap` (IGDB _genre_) or
  `igdbThemeMap` (IGDB _theme_ — e.g. "action" and "horror" are themes, not genres). Use
  the live IDs from the report; when unsure, cross-check <https://api-docs.igdb.com/>.
- **Retired ID (`✗`)** — repoint to the current IGDB ID for that category.
- **Rename (`⚠`)** — confirm the ID still maps to the intended thing; adjust if IGDB split
  or merged the entry (e.g. a new console generation ID to add to a platform's array).

Keep the existing shape: numeric values for genre/theme maps, `number[]` for platforms.

### 3. Verify

Run the repo's verification gate (CLAUDE.md → "Verification gate"):

```bash
npm run lint && npm run build
```

Re-run `npm run igdb-sync` to confirm it now reports in sync. If the change affects game
search, do a QA smoke (`/qa`): generate a calendar for the touched genre/platform and
confirm real games come back (not an empty result).

## Important rules

- **Never silently rewrite `igdb.ts`** — apply ID edits you can explain from the report.
- **Genre vs theme is a product decision** — the script flags an unmapped genre but won't
  pick the bucket; you decide `igdbGenreMap` vs `igdbThemeMap`.
- **Coverage runs without creds** (`--offline`) — safe to wire into CI later; the taxonomy
  check needs `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET`.
- **Verification is `lint && build`** (+ a generation smoke if search changed) — no unit
  tests exist in this repo yet.
