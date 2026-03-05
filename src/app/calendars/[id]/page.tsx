import { notFound } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { prisma } from "@/lib";
import { CalendarView } from "@/components";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  params: Promise<{ id: string }>;
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
