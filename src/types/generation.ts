import { z } from "zod";
import type { IgdbGame } from "./igdb";
import type { Platform, PlayStyle, TimePeriod } from "./calendar";

export interface GenerationInput {
  calendarName: string;
  platform: Platform;
  genres: string[];
  hoursPerWeek: number;
  timePeriod: TimePeriod;
  playStyle: PlayStyle;
  games: IgdbGame[];
}

export const scheduledGameSchema = z.object({
  igdbId: z.number(),
  title: z.string(),
  estimatedHours: z.number().positive(),
  startDate: z.string(),
  endDate: z.string(),
  order: z.number().int().min(1),
  reason: z.string(),
});

export const generationResultSchema = z.object({
  calendarName: z.string(),
  games: z.array(scheduledGameSchema).min(1),
  summary: z.string(),
});

export type ScheduledGame = z.infer<typeof scheduledGameSchema>;
export type GenerationResult = z.infer<typeof generationResultSchema>;
