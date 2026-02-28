import { z } from "zod";

export const platformValues = [
  "pc",
  "playstation",
  "xbox",
  "nintendo-switch",
] as const;

export const genreValues = [
  "action",
  "rpg",
  "adventure",
  "strategy",
  "shooter",
  "sports",
  "puzzle",
  "simulation",
  "horror",
] as const;

export const timePeriodValues = ["1-month", "3-months", "6-months"] as const;

export const playStyleValues = ["casual", "balanced", "hardcore"] as const;

export type Platform = (typeof platformValues)[number];
export type Genre = (typeof genreValues)[number];
export type TimePeriod = (typeof timePeriodValues)[number];
export type PlayStyle = (typeof playStyleValues)[number];

export const calendarFormSchema = z.object({
  name: z.string().min(1, "Calendar name is required"),
  platform: z.enum(platformValues),
  genres: z.array(z.enum(genreValues)).min(1, "Select at least one genre"),
  hoursPerWeek: z.number().int().min(1).max(40),
  timePeriod: z.enum(timePeriodValues),
  playStyle: z.enum(playStyleValues),
});

export type CalendarFormData = z.infer<typeof calendarFormSchema>;
