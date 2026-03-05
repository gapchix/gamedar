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
import { prisma } from "@/lib";

export const dynamic = "force-dynamic";

export default async function CalendarsPage() {
  const calendars = await prisma.calendar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { games: true } },
      games: {
        select: { coverUrl: true, title: true },
        orderBy: { order: "asc" },
        take: 5,
      },
    },
  });

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
