import { NextResponse } from "next/server";
import { prisma, logger } from "@/lib";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const calendar = await prisma.calendar.findUnique({
      where: { id },
      include: { games: { orderBy: { order: "asc" } } },
    });

    if (!calendar) {
      logger.warn("Calendar not found", { id });
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 },
      );
    }

    logger.info("Fetched calendar", {
      id: calendar.id,
      games: calendar.games.length,
    });

    return NextResponse.json(calendar);
  } catch (error) {
    logger.error("Failed to fetch calendar", { error });
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 },
    );
  }
}
