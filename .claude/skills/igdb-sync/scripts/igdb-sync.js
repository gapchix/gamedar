#!/usr/bin/env node
"use strict";

/**
 * igdb-sync — keep gamedar's IGDB ID mappings aligned with IGDB's live taxonomy.
 *
 * gamedar maps its app enums (Platform, Genre) to IGDB numeric IDs in
 * src/types/igdb.ts (igdbGenreMap / igdbThemeMap / igdbPlatformMap). Those IDs are
 * hand-maintained against IGDB's live /genres, /themes, /platforms taxonomy and can
 * silently drift (an ID retired or renamed, a new app genre added without a mapping).
 *
 * This script is DETECT-ONLY. It NEVER edits src/types/igdb.ts.
 * It reports two independent signals and the agent applies any edit by hand:
 *
 *   1. Coverage  (no network) — every value in calendar.ts `genreValues` /
 *      `platformValues` resolves to a mapping. Catches "added a genre, forgot the ID"
 *      (an unmapped genre silently returns zero games).
 *   2. Taxonomy drift (IGDB API) — every mapped ID still exists in the live taxonomy,
 *      and the live IGDB name still relates to the app label (flags renames/retirements).
 *
 * Usage:
 *   node igdb-sync.js [--web <path>] [--json] [--verbose] [--offline]
 * Default web root: four levels up from this file (the repo root).
 * Creds: IGDB_CLIENT_ID / IGDB_CLIENT_SECRET from the environment, else parsed from
 *        <webRoot>/.env. Use --offline to run the coverage check only (no creds needed).
 * Exit: 0 = in sync, 2 = drift/coverage gap, 1 = error.
 */

const fs = require("fs");
const path = require("path");

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE = "https://api.igdb.com/v4";

// App label -> substrings expected to appear (lowercased) in the live IGDB name.
// A mapped ID whose live name matches none of these is flagged for human review.
const GENRE_ALIASES = {
  rpg: ["role-playing", "rpg"],
  adventure: ["adventure"],
  strategy: ["strategy", "tactic"],
  shooter: ["shooter"],
  sports: ["sport"],
  puzzle: ["puzzle"],
  simulation: ["simulator", "simulation"],
};
const THEME_ALIASES = {
  action: ["action"],
  horror: ["horror", "survival"],
};
const PLATFORM_ALIASES = {
  pc: ["pc", "windows", "linux", "mac"],
  playstation: ["playstation"],
  xbox: ["xbox"],
  "nintendo-switch": ["switch", "nintendo"],
};

function parseArgs(argv) {
  const args = { json: false, verbose: false, offline: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--verbose" || a === "-v") args.verbose = true;
    else if (a === "--offline") args.offline = true;
    else if (a === "--web") args.web = argv[++i];
    else if (a === "-h" || a === "--help") args.help = true;
  }
  return args;
}

function fail(msg) {
  console.error("igdb-sync: " + msg);
  process.exit(1);
}

// Minimal .env reader — only fills IGDB creds if not already in the environment.
function loadCreds(webRoot) {
  let id = process.env.IGDB_CLIENT_ID;
  let secret = process.env.IGDB_CLIENT_SECRET;
  if (id && secret) return { id, secret };
  const envPath = path.join(webRoot, ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const val = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "IGDB_CLIENT_ID" && !id) id = val;
      if (m[1] === "IGDB_CLIENT_SECRET" && !secret) secret = val;
    }
  }
  return { id, secret };
}

// Pull the `[...] as const` string list for an exported array (calendar.ts enums).
function extractStringArray(src, name) {
  const re = new RegExp(`${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`, "m");
  const m = src.match(re);
  if (!m) return null;
  return [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]);
}

// Isolate an object-literal map body by name, e.g. `igdbGenreMap ... = { ... }`.
function mapBody(src, name) {
  const re = new RegExp(`${name}[^=]*=\\s*\\{([\\s\\S]*?)\\}`, "m");
  const m = src.match(re);
  return m ? m[1] : null;
}

// Parse `key: 12` entries (numeric-valued map).
function parseNumMap(body) {
  const out = {};
  if (!body) return out;
  for (const m of body.matchAll(/["']?([\w-]+)["']?\s*:\s*(\d+)/g)) {
    out[m[1]] = Number(m[2]);
  }
  return out;
}

// Parse `key: [12, 34]` entries (numeric-array-valued map).
function parseNumArrayMap(body) {
  const out = {};
  if (!body) return out;
  for (const m of body.matchAll(/["']?([\w-]+)["']?\s*:\s*\[([\d,\s]+)\]/g)) {
    out[m[1]] = m[2]
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
  }
  return out;
}

async function getToken(id, secret) {
  // Credentials in the form body, not the URL, so they never hit access logs.
  const res = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: "client_credentials",
    }).toString(),
  });
  if (!res.ok) {
    fail(`Twitch OAuth failed (${res.status}). Check IGDB_CLIENT_ID/SECRET.`);
  }
  const data = await res.json();
  if (!data.access_token) fail("Twitch OAuth returned no access_token.");
  return data.access_token;
}

// Fetch an IGDB endpoint's full id->name taxonomy as a Map<number,string>.
async function fetchTaxonomy(token, clientId, endpoint) {
  const res = await fetch(`${IGDB_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
      Accept: "application/json",
    },
    body: "fields id,name; limit 500;",
  });
  if (!res.ok) fail(`IGDB /${endpoint} failed (${res.status}).`);
  const rows = await res.json();
  const map = new Map();
  for (const r of rows) map.set(r.id, r.name);
  return map;
}

function nameMatches(aliases, key, liveName) {
  const subs = aliases[key];
  if (!subs) return true; // no alias registered -> don't flag on name
  const lc = String(liveName || "").toLowerCase();
  return subs.some((s) => lc.includes(s));
}

// Classify one mapped ID against the live taxonomy.
//   ok = exists + name relates | rename = exists but name unrelated | missing = gone
function classifyId(taxonomy, aliases, key, id) {
  if (!taxonomy.has(id)) return { status: "missing", id, name: null };
  const name = taxonomy.get(id);
  return {
    status: nameMatches(aliases, key, name) ? "ok" : "rename",
    id,
    name,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(
      "Usage: node igdb-sync.js [--web <path>] [--json] [--verbose] [--offline]",
    );
    process.exit(0);
  }
  if (typeof fetch !== "function") {
    fail("global fetch unavailable — run with Node 18+.");
  }

  const webRoot = path.resolve(
    args.web || path.resolve(__dirname, "../../../.."),
  );
  const igdbTsPath = path.join(webRoot, "src", "types", "igdb.ts");
  const calendarTsPath = path.join(webRoot, "src", "types", "calendar.ts");
  if (!fs.existsSync(igdbTsPath)) fail(`not found: ${igdbTsPath} (pass --web)`);
  if (!fs.existsSync(calendarTsPath)) fail(`not found: ${calendarTsPath}`);

  const igdbSrc = fs.readFileSync(igdbTsPath, "utf8");
  const calSrc = fs.readFileSync(calendarTsPath, "utf8");

  const genreMap = parseNumMap(mapBody(igdbSrc, "igdbGenreMap"));
  const themeMap = parseNumMap(mapBody(igdbSrc, "igdbThemeMap"));
  const platformMap = parseNumArrayMap(mapBody(igdbSrc, "igdbPlatformMap"));
  const appGenres = extractStringArray(calSrc, "genreValues") || [];
  const appPlatforms = extractStringArray(calSrc, "platformValues") || [];

  // --- 1. Coverage (no network) --------------------------------------------
  const coverage = { genres: [], platforms: [], stale: [], ok: true };
  for (const g of appGenres) {
    const inGenre = g in genreMap;
    const inTheme = g in themeMap;
    if (!inGenre && !inTheme) {
      coverage.ok = false;
      coverage.genres.push({ key: g, status: "unmapped" });
    } else {
      coverage.genres.push({
        key: g,
        status: "ok",
        via: inGenre ? "genre" : "theme",
      });
    }
  }
  for (const p of appPlatforms) {
    if (!(p in platformMap)) {
      coverage.ok = false;
      coverage.platforms.push({ key: p, status: "unmapped" });
    } else {
      coverage.platforms.push({ key: p, status: "ok" });
    }
  }
  // Reverse: mapped keys that are no longer app enum values (stale mappings).
  const appGenreSet = new Set(appGenres);
  const appPlatformSet = new Set(appPlatforms);
  for (const k of [...Object.keys(genreMap), ...Object.keys(themeMap)]) {
    if (!appGenreSet.has(k)) coverage.stale.push(`genre/theme mapping '${k}'`);
  }
  for (const k of Object.keys(platformMap)) {
    if (!appPlatformSet.has(k)) coverage.stale.push(`platform mapping '${k}'`);
  }

  const report = {
    inSync: coverage.ok,
    coverage,
    taxonomy: null,
    offline: !!args.offline,
  };

  // --- 2. Taxonomy drift (IGDB API) ----------------------------------------
  if (!args.offline) {
    const { id, secret } = loadCreds(webRoot);
    if (!id || !secret) {
      fail(
        "IGDB_CLIENT_ID / IGDB_CLIENT_SECRET not set (env or .env). Use --offline for coverage-only.",
      );
    }
    const token = await getToken(id, secret);
    const [genres, themes, platforms] = await Promise.all([
      fetchTaxonomy(token, id, "genres"),
      fetchTaxonomy(token, id, "themes"),
      fetchTaxonomy(token, id, "platforms"),
    ]);

    const tax = {
      counts: {
        genres: genres.size,
        themes: themes.size,
        platforms: platforms.size,
      },
      genres: [],
      themes: [],
      platforms: [],
      issues: 0,
    };
    for (const [key, gid] of Object.entries(genreMap)) {
      const c = classifyId(genres, GENRE_ALIASES, key, gid);
      if (c.status !== "ok") tax.issues++;
      tax.genres.push({ key, ...c });
    }
    for (const [key, tid] of Object.entries(themeMap)) {
      const c = classifyId(themes, THEME_ALIASES, key, tid);
      if (c.status !== "ok") tax.issues++;
      tax.themes.push({ key, ...c });
    }
    for (const [key, ids] of Object.entries(platformMap)) {
      for (const pid of ids) {
        const c = classifyId(platforms, PLATFORM_ALIASES, key, pid);
        if (c.status !== "ok") tax.issues++;
        tax.platforms.push({ key, ...c });
      }
    }
    report.taxonomy = tax;
    if (tax.issues > 0) report.inSync = false;
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.inSync ? 0 : 2);
  }

  // --- Human report ---------------------------------------------------------
  const mark = { ok: "✓", rename: "⚠", missing: "✗" };
  console.log(`\nigdb-sync: IGDB taxonomy ↔ gamedar mappings`);
  console.log(`  maps:  src/types/igdb.ts`);
  console.log(`  enums: src/types/calendar.ts\n`);

  const gCov = coverage.genres.filter((x) => x.status === "ok").length;
  const pCov = coverage.platforms.filter((x) => x.status === "ok").length;
  console.log(`Coverage (no network) — every app enum value has a mapping`);
  console.log(
    `  genres:    ${gCov}/${appGenres.length} covered ${gCov === appGenres.length ? "✓" : "✗"}` +
      `   (${Object.keys(genreMap).length} → genres, ${Object.keys(themeMap).length} → themes)`,
  );
  coverage.genres
    .filter((x) => x.status === "unmapped")
    .forEach((x) =>
      console.log(
        `    ✗ genre '${x.key}' has NO IGDB mapping — returns zero games`,
      ),
    );
  console.log(
    `  platforms: ${pCov}/${appPlatforms.length} covered ${pCov === appPlatforms.length ? "✓" : "✗"}`,
  );
  coverage.platforms
    .filter((x) => x.status === "unmapped")
    .forEach((x) =>
      console.log(`    ✗ platform '${x.key}' has NO IGDB mapping`),
    );
  coverage.stale.forEach((s) =>
    console.log(`    · stale? ${s} — not in calendar.ts enums (review)`),
  );
  console.log("");

  if (report.offline) {
    console.log("Live taxonomy drift: SKIPPED (--offline)\n");
  } else {
    const t = report.taxonomy;
    console.log(
      `Live taxonomy drift (IGDB API — ${t.counts.genres} genres, ${t.counts.themes} themes, ${t.counts.platforms} platforms)`,
    );
    const line = (row) =>
      `    ${mark[row.status]} ${row.key.padEnd(15)} → ${String(row.id).padEnd(4)} ${
        row.name || "(ID not found in live taxonomy)"
      }${row.status === "rename" ? "   ← name doesn't match app label, review" : ""}`;
    console.log("  genres:");
    t.genres.forEach((r) => console.log(line(r)));
    console.log("  themes:");
    t.themes.forEach((r) => console.log(line(r)));
    console.log("  platforms:");
    t.platforms.forEach((r) => console.log(line(r)));
    console.log("");
  }

  if (report.inSync) {
    console.log(
      "✓ In sync — mappings cover every enum and match the live IGDB taxonomy.\n",
    );
    process.exit(0);
  }
  console.log(
    "⚠ Drift detected. Review the flagged items and edit src/types/igdb.ts by",
  );
  console.log(
    "  hand (this script never writes). Then: npm run lint && npm run build.\n",
  );
  process.exit(2);
}

main().catch((e) => fail(e && e.message ? e.message : String(e)));
