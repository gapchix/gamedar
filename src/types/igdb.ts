import type { Genre, Platform } from "./calendar";

// IGDB uses both genres and themes to classify games.
// Some of our app genres map to IGDB genres, others to IGDB themes.

// IGDB genre IDs — https://api-docs.igdb.com/#genre
export const igdbGenreMap: Partial<Record<Genre, number>> = {
  rpg: 12,
  adventure: 31,
  strategy: 15,
  shooter: 5,
  sports: 14,
  puzzle: 9,
  simulation: 13,
};

// IGDB theme IDs — https://api-docs.igdb.com/#theme
export const igdbThemeMap: Partial<Record<Genre, number>> = {
  action: 1,
  horror: 19,
};

// IGDB platform IDs — https://api-docs.igdb.com/#platform
export const igdbPlatformMap: Record<Platform, number[]> = {
  pc: [6],
  playstation: [167, 48],
  xbox: [169],
  "nintendo-switch": [130],
};

export interface IgdbCover {
  id: number;
  image_id: string;
}

export interface IgdbGameRaw {
  id: number;
  name: string;
  cover?: IgdbCover;
  genres?: { id: number; name: string }[];
  platforms?: { id: number }[];
  total_rating?: number;
  first_release_date?: number;
}

export interface IgdbGame {
  igdbId: number;
  title: string;
  coverUrl: string | null;
  estimatedHours: number;
  genres: string[];
  rating: number | null;
  releaseDate: Date | null;
}
