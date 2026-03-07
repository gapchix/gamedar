import axios, { type AxiosInstance } from "axios";
import type { Genre, Platform, IgdbGame, IgdbGameRaw } from "@/types";
import { igdbGenreMap, igdbThemeMap, igdbPlatformMap } from "@/types";
import { logger } from "./logger";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

const GAME_FIELDS = [
  "name",
  "cover.image_id",
  "genres.id",
  "genres.name",
  "platforms.id",
  "total_rating",
  "first_release_date",
].join(",");

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface TimeToBeatEntry {
  game_id: number;
  normally: number;
  hastily: number;
  completely: number;
}

class IgdbService {
  private client: AxiosInstance;
  private tokenCache: TokenCache | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.igdb.com/v4",
      headers: { "Content-Type": "text/plain" },
      timeout: 15_000,
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers["Client-ID"] = process.env.IGDB_CLIENT_ID!;
      config.headers["Authorization"] = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(undefined, async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.tokenCache = null;
        const token = await this.getAccessToken();
        const config = error.config!;
        config.headers["Authorization"] = `Bearer ${token}`;
        return this.client.request(config);
      }
      throw error;
    });
  }

  private async getAccessToken(): Promise<string> {
    if (
      this.tokenCache &&
      this.tokenCache.expiresAt > Date.now() + 5 * 60 * 1000
    ) {
      return this.tokenCache.accessToken;
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
      timeout: 10_000,
    });

    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    logger.debug("IGDB access token acquired");

    return this.tokenCache.accessToken;
  }

  private buildCoverUrl(imageId: string): string {
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
  }

  private normalizeGame(
    raw: IgdbGameRaw,
    timeToBeatMap: Map<number, number>,
  ): IgdbGame {
    return {
      igdbId: raw.id,
      title: raw.name,
      coverUrl: raw.cover ? this.buildCoverUrl(raw.cover.image_id) : null,
      estimatedHours: timeToBeatMap.get(raw.id) ?? 10,
      genres: raw.genres?.map((g) => g.name) ?? [],
      rating: raw.total_rating ? Math.round(raw.total_rating) : null,
      releaseDate: raw.first_release_date
        ? new Date(raw.first_release_date * 1000)
        : null,
    };
  }

  private async fetchTimeToBeat(
    gameIds: number[],
  ): Promise<Map<number, number>> {
    if (gameIds.length === 0) return new Map();

    const { data: entries } = await this.client.post<TimeToBeatEntry[]>(
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

  async fetchGamesByPreferences(
    platform: Platform,
    genres: Genre[],
    limit: number = 20,
  ): Promise<IgdbGame[]> {
    const platformIds = igdbPlatformMap[platform];

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
      fields ${GAME_FIELDS};
      where ${whereClauses.join(" & ")};
      sort total_rating desc;
      limit ${limit};
    `.trim();

    logger.debug("IGDB query", { platform, genres, limit });

    const { data: raw } = await this.client.post<IgdbGameRaw[]>(
      "/games",
      query,
    );

    logger.debug("IGDB returned games", { count: raw.length });

    const gameIds = raw.map((g) => g.id);
    const timeToBeatMap = await this.fetchTimeToBeat(gameIds);

    logger.debug("IGDB time-to-beat data", {
      requested: gameIds.length,
      found: timeToBeatMap.size,
    });

    return raw.map((g) => this.normalizeGame(g, timeToBeatMap));
  }
}

export const igdbService = new IgdbService();
