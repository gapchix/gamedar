import axios, { type AxiosInstance } from "axios";
import type { Genre, Platform, IgdbGame, IgdbGameRaw } from "@/types";
import { igdbGenreMap, igdbThemeMap, igdbPlatformMap } from "@/types";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set");
  }

  const { data } = await axios.post<{
    access_token: string;
    expires_in: number;
  }>(TWITCH_TOKEN_URL, null, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    },
  });

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

function createIgdbClient(): AxiosInstance {
  const client = axios.create({
    baseURL: "https://api.igdb.com/v4",
    headers: { "Content-Type": "text/plain" },
  });

  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    config.headers["Client-ID"] = process.env.IGDB_CLIENT_ID!;
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(undefined, async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenCache = null;
      const token = await getAccessToken();
      const config = error.config!;
      config.headers["Authorization"] = `Bearer ${token}`;
      return client.request(config);
    }
    throw error;
  });

  return client;
}

const igdbClient = createIgdbClient();

function buildCoverUrl(imageId: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

interface TimeToBeatEntry {
  game_id: number;
  normally: number;
  hastily: number;
  completely: number;
}

async function fetchTimeToBeat(
  gameIds: number[],
): Promise<Map<number, number>> {
  if (gameIds.length === 0) return new Map();

  const { data: entries } = await igdbClient.post<TimeToBeatEntry[]>(
    "/game_time_to_beats",
    `fields game_id,normally,hastily,completely; where game_id = (${gameIds.join(",")}); limit ${gameIds.length};`,
  );

  const map = new Map<number, number>();
  for (const entry of entries) {
    const seconds = entry.normally ?? entry.hastily ?? entry.completely ?? 0;
    if (seconds > 0) {
      map.set(entry.game_id, Math.round(seconds / 3600));
    }
  }
  return map;
}

function normalizeGame(
  raw: IgdbGameRaw,
  timeToBeatMap: Map<number, number>,
): IgdbGame {
  return {
    igdbId: raw.id,
    title: raw.name,
    coverUrl: raw.cover ? buildCoverUrl(raw.cover.image_id) : null,
    estimatedHours: timeToBeatMap.get(raw.id) ?? 10,
    genres: raw.genres?.map((g) => g.name) ?? [],
    rating: raw.total_rating ? Math.round(raw.total_rating) : null,
    releaseDate: raw.first_release_date
      ? new Date(raw.first_release_date * 1000)
      : null,
  };
}

const IGDB_FIELDS = [
  "name",
  "cover.image_id",
  "genres.id",
  "genres.name",
  "platforms.id",
  "total_rating",
  "first_release_date",
].join(",");

export async function fetchGamesByPreferences(
  platform: Platform,
  genres: Genre[],
  limit: number = 20,
): Promise<IgdbGame[]> {
  const platformIds = igdbPlatformMap[platform];

  // Split genres into IGDB genres vs IGDB themes
  const genreIds = genres
    .map((g) => igdbGenreMap[g])
    .filter((id): id is number => id !== undefined);
  const themeIds = genres
    .map((g) => igdbThemeMap[g])
    .filter((id): id is number => id !== undefined);

  const whereClauses: string[] = [
    `platforms = (${platformIds.join(",")})`,
    "total_rating > 60",
  ];

  if (genreIds.length > 0) {
    whereClauses.push(`genres = (${genreIds.join(",")})`);
  }

  if (themeIds.length > 0) {
    whereClauses.push(`themes = (${themeIds.join(",")})`);
  }

  const query = `
    fields ${IGDB_FIELDS};
    where ${whereClauses.join(" & ")};
    sort total_rating desc;
    limit ${limit};
  `.trim();

  const { data: raw } = await igdbClient.post<IgdbGameRaw[]>("/games", query);

  // Fetch time-to-beat data in a separate request
  const gameIds = raw.map((g) => g.id);
  const timeToBeatMap = await fetchTimeToBeat(gameIds);

  return raw.map((g) => normalizeGame(g, timeToBeatMap));
}
