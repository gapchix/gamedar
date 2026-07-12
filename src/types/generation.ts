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

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export const scheduledGameSchema = z.object({
  igdbId: z.number(),
  title: z.string().max(300),
  estimatedHours: z.number().positive(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  order: z.number().int().min(1),
  reason: z.string().max(1000),
});

export const generationResultSchema = z.object({
  calendarName: z.string().max(200),
  games: z.array(scheduledGameSchema).min(1).max(50),
  summary: z.string().max(2000),
});

export type ScheduledGame = z.infer<typeof scheduledGameSchema>;
export type GenerationResult = z.infer<typeof generationResultSchema>;
