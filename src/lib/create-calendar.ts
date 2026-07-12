import { calendarFormSchema } from "@/types";
import { prisma } from "./prisma";
import { igdbService } from "./igdb";
import { generateSchedule } from "./anthropic";
import { logger } from "./logger";
import {
  reserveGenerationSlot,
  releaseGenerationSlot,
} from "./generation-limit";

export type CreateCalendarOutcome =
  | { status: "created"; id: string; remaining: number }
  | { status: "limit-reached" }
  | { status: "no-games" };

async function releaseSlotSafely(): Promise<void> {
  try {
    await releaseGenerationSlot();
  } catch (error) {
    // Log only — never mask the error that caused the release.
    logger.error("Failed to release generation slot", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Validate input, reserve a daily generation slot, fetch games from IGDB,
 * generate a schedule with Claude, and persist the calendar.
 *
 * Throws ZodError for invalid input — callers map it to their transport
 * (400 for the API route, form error for the server action).
 */
export async function createCalendarFromInput(
  input: unknown,
): Promise<CreateCalendarOutcome> {
  const data = calendarFormSchema.parse(input);

  const slot = await reserveGenerationSlot();
  if (!slot.reserved) {
    return { status: "limit-reached" };
  }

  try {
    logger.info("Creating calendar", {
      name: data.name,
      platform: data.platform,
      genres: data.genres,
      hoursPerWeek: data.hoursPerWeek,
      timePeriod: data.timePeriod,
      playStyle: data.playStyle,
    });

    const games = await igdbService.fetchGamesByPreferences(
      data.platform,
      data.genres,
    );

    if (games.length === 0) {
      logger.warn("No games found for preferences", {
        platform: data.platform,
        genres: data.genres,
      });
      await releaseSlotSafely();
      return { status: "no-games" };
    }

    logger.info("Fetched games from IGDB", { count: games.length });

    const result = await generateSchedule({
      calendarName: data.name,
      platform: data.platform,
      genres: [...data.genres],
      hoursPerWeek: data.hoursPerWeek,
      timePeriod: data.timePeriod,
      playStyle: data.playStyle,
      games,
    });

    logger.info("Generated schedule", {
      scheduledGames: result.games.length,
      summary: result.summary,
    });

    const igdbGameMap = new Map(games.map((g) => [g.igdbId, g]));

    const calendar = await prisma.calendar.create({
      data: {
        name: result.calendarName,
        platform: data.platform,
        genres: [...data.genres],
        hoursPerWeek: data.hoursPerWeek,
        timePeriod: data.timePeriod,
        playStyle: data.playStyle,
        summary: result.summary,
        games: {
          create: result.games.map((g) => ({
            igdbId: g.igdbId,
            title: g.title,
            coverUrl: igdbGameMap.get(g.igdbId)?.coverUrl ?? null,
            estimatedHours: g.estimatedHours,
            startDate: new Date(g.startDate),
            endDate: new Date(g.endDate),
            order: g.order,
            reason: g.reason,
          })),
        },
      },
    });

    logger.info("Calendar created", { calendarId: calendar.id });

    return { status: "created", id: calendar.id, remaining: slot.remaining };
  } catch (error) {
    await releaseSlotSafely();
    throw error;
  }
}
