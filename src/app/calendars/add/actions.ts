"use server";

import { calendarFormSchema } from "@/types";
import { prisma, igdbService, generateSchedule, logger } from "@/lib";
import { DAILY_GENERATION_LIMIT } from "@/utils";

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createCalendar(formData: unknown): Promise<ActionResult> {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayCount = await prisma.calendar.count({
      where: { createdAt: { gte: todayStart } },
    });

    if (todayCount >= DAILY_GENERATION_LIMIT) {
      logger.warn("Daily generation limit reached", {
        limit: DAILY_GENERATION_LIMIT,
        used: todayCount,
      });
      return {
        success: false,
        error: "Daily generation limit reached. Please try again tomorrow.",
      };
    }

    const data = calendarFormSchema.parse(formData);

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
      return {
        success: false,
        error: "No games found for the selected preferences.",
      };
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

    return { success: true, id: calendar.id };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.warn("Invalid form data", {
        error: errorMessage,
        name: error instanceof Error ? error.name : "Unknown",
      });
      return { success: false, error: "Invalid form data." };
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to create calendar", {
      error: errorMessage,
      name: error instanceof Error ? error.name : "Unknown",
    });
    return { success: false, error: "Failed to create calendar." };
  }
}
