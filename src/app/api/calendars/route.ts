import { NextResponse } from "next/server";
import { calendarFormSchema } from "@/types";
import { prisma, igdbService, generateSchedule, logger } from "@/lib";
import { DAILY_GENERATION_LIMIT } from "@/utils";

export async function POST(request: Request) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await prisma.calendar.count({
      where: { createdAt: { gte: todayStart } },
    });

    if (todayCount >= DAILY_GENERATION_LIMIT) {
      logger.warn("Daily generation limit reached", {
        limit: DAILY_GENERATION_LIMIT,
        used: todayCount,
      });
      return NextResponse.json(
        {
          error: "Daily generation limit reached. Please try again tomorrow.",
          limit: DAILY_GENERATION_LIMIT,
          remaining: 0,
        },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = calendarFormSchema.parse(body);

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
      return NextResponse.json(
        { error: "No games found for the selected preferences" },
        { status: 404 },
      );
    }

    logger.info("Fetched games from IGDB", { count: games.length });

    const result = await generateSchedule({
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
        name: data.name,
        platform: data.platform,
        genres: [...data.genres],
        hoursPerWeek: data.hoursPerWeek,
        timePeriod: data.timePeriod,
        playStyle: data.playStyle,
        games: {
          create: result.games.map((g) => ({
            igdbId: g.igdbId,
            title: g.title,
            coverUrl: igdbGameMap.get(g.igdbId)?.coverUrl ?? null,
            estimatedHours: g.estimatedHours,
            startDate: new Date(g.startDate),
            endDate: new Date(g.endDate),
            order: g.order,
          })),
        },
      },
    });

    logger.info("Calendar created", { calendarId: calendar.id });

    return NextResponse.json(
      {
        id: calendar.id,
        remaining: DAILY_GENERATION_LIMIT - todayCount - 1,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      logger.warn("Invalid request data", { error });
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 },
      );
    }
    logger.error("Failed to create calendar", { error });
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const calendars = await prisma.calendar.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { games: true } } },
    });

    logger.info("Fetched calendars", { count: calendars.length });

    return NextResponse.json(calendars);
  } catch (error) {
    logger.error("Failed to fetch calendars", { error });
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 },
    );
  }
}
