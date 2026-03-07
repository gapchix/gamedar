import type { Metadata } from "next";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { CalendarList } from "@/components";
import { prisma, logger } from "@/lib";

export const metadata: Metadata = {
  title: "Browse Calendars",
  description:
    "Explore AI-generated gaming calendars. Find inspiration for your next gaming schedule across PC, PlayStation, Xbox, and Nintendo Switch.",
  openGraph: {
    title: "Browse Gaming Calendars | Gamedar",
    description:
      "Explore AI-generated gaming calendars. Find inspiration for your next gaming schedule.",
  },
};

export const dynamic = "force-dynamic";

export default async function CalendarsPage() {
  let calendars: Awaited<ReturnType<typeof fetchCalendars>> = [];

  try {
    calendars = await fetchCalendars();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to fetch calendars", {
      error: message,
      name: error instanceof Error ? error.name : "Unknown",
    });
  }

  return (
    <Box
      backgroundImage="radial-gradient(ellipse at 50% 0%, rgba(128,90,213,0.15) 0%, transparent 50%), radial-gradient(circle, rgba(128,90,213,0.06) 1px, transparent 1px)"
      backgroundSize="100% 100%, 24px 24px"
    >
      <Container maxW="7xl" py={{ base: "12", md: "16" }}>
        <VStack gap="10" alignItems="stretch">
          <HStack
            w="full"
            justify="space-between"
            align="end"
            flexDir={{ base: "column", sm: "row" }}
            gap="4"
          >
            <VStack gap="1" align={{ base: "center", sm: "start" }}>
              <Heading size={{ base: "2xl", md: "3xl" }}>Calendars</Heading>
              <Text color="fg.muted" fontSize="lg">
                Browse all generated gaming calendars.
              </Text>
            </VStack>
            <Button asChild>
              <Link href="/calendars/add">
                <FiPlus /> Create New
              </Link>
            </Button>
          </HStack>

          <CalendarList calendars={calendars} />
        </VStack>
      </Container>
    </Box>
  );
}

function fetchCalendars() {
  return prisma.calendar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { games: true } },
      games: {
        select: { coverUrl: true, title: true },
        orderBy: { order: "asc" },
        take: 5,
      },
    },
    take: 50,
  });
}
