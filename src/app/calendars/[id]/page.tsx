import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { prisma } from "@/lib";
import { CalendarView } from "@/components";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  params: Promise<{ id: string }>;
}

const platformLabels: Record<string, string> = {
  pc: "PC",
  playstation: "PlayStation",
  xbox: "Xbox",
  "nintendo-switch": "Nintendo Switch",
};

export async function generateMetadata({
  params,
}: CalendarPageProps): Promise<Metadata> {
  const { id } = await params;

  const calendar = await prisma.calendar.findUnique({
    where: { id },
    select: {
      name: true,
      platform: true,
      genres: true,
      hoursPerWeek: true,
      summary: true,
      _count: { select: { games: true } },
    },
  });

  if (!calendar) {
    return {
      title: "Calendar Not Found",
    };
  }

  const platform = platformLabels[calendar.platform] ?? calendar.platform;
  const genres = calendar.genres.join(", ");
  const description =
    calendar.summary ??
    `A ${platform} gaming calendar with ${calendar._count.games} games across ${genres}. ${calendar.hoursPerWeek}h/week.`;

  return {
    title: calendar.name,
    description,
    openGraph: {
      title: `${calendar.name} | Gamedar`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${calendar.name} | Gamedar`,
      description,
    },
  };
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { id } = await params;

  const calendar = await prisma.calendar.findUnique({
    where: { id },
    include: { games: { orderBy: { order: "asc" } } },
  });

  if (!calendar) {
    notFound();
  }

  return (
    <Box
      bgGradient="to-b"
      gradientFrom="purple.500/5"
      gradientTo="transparent"
      minH="100vh"
    >
      <CalendarView calendar={calendar} />
    </Box>
  );
}
