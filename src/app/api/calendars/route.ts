import { NextResponse } from "next/server";
import { prisma, createCalendarFromInput, logger } from "@/lib";
import { DAILY_GENERATION_LIMIT } from "@/utils";

const MAX_BODY_SIZE = 10 * 1024; // 10 KB

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const outcome = await createCalendarFromInput(body);

    switch (outcome.status) {
      case "limit-reached":
        return NextResponse.json(
          {
            error: "Daily generation limit reached. Please try again tomorrow.",
            limit: DAILY_GENERATION_LIMIT,
            remaining: 0,
          },
          { status: 429 },
        );
      case "no-games":
        return NextResponse.json(
          { error: "No games found for the selected preferences" },
          { status: 404 },
        );
      case "created":
        return NextResponse.json(
          { id: outcome.id, remaining: outcome.remaining },
          { status: 201 },
        );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      logger.warn("Invalid request data", {
        error: error.message,
        name: error.name,
      });
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to create calendar", {
      error: errorMessage,
      name: error instanceof Error ? error.name : "Unknown",
    });
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
      take: 50,
    });

    logger.info("Fetched calendars", { count: calendars.length });

    return NextResponse.json(calendars);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Failed to fetch calendars", {
      error: errorMessage,
      name: error instanceof Error ? error.name : "Unknown",
    });
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 },
    );
  }
}
