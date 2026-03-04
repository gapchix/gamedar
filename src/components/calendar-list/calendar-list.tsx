"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiGrid,
  FiMonitor,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import { ShareButton } from "@/components/share-button";

interface CalendarGame {
  coverUrl: string | null;
  title: string;
}

interface CalendarItem {
  id: string;
  name: string;
  platform: string;
  genres: string[];
  hoursPerWeek: number;
  timePeriod: string;
  playStyle: string;
  createdAt: Date;
  games: CalendarGame[];
  _count: { games: number };
}

interface CalendarListProps {
  calendars: CalendarItem[];
}

const platformLabels: Record<string, string> = {
  pc: "PC",
  playstation: "PlayStation",
  xbox: "Xbox",
  "nintendo-switch": "Nintendo Switch",
};

const timePeriodLabels: Record<string, string> = {
  "1-month": "1 month",
  "3-months": "3 months",
  "6-months": "6 months",
};

const playStyleLabels: Record<string, string> = {
  casual: "Casual",
  balanced: "Balanced",
  hardcore: "Hardcore",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CalendarList({ calendars }: CalendarListProps) {
  if (calendars.length === 0) {
    return (
      <VStack gap="6" py="16" textAlign="center">
        <Icon fontSize="6xl" color="fg.subtle">
          <FiCalendar />
        </Icon>
        <VStack gap="2">
          <Heading size="lg">No calendars yet</Heading>
          <Text color="fg.muted" maxW="md">
            Create your first AI-powered gaming calendar and start organizing
            your play time.
          </Text>
        </VStack>
        <Button asChild size="lg">
          <Link href="/calendars/add">
            <FiPlus /> Create Your First Calendar
          </Link>
        </Button>
      </VStack>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
      {calendars.map((calendar) => (
        <Box
          key={calendar.id}
          asChild
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
        >
          <Link href={`/calendars/${calendar.id}`}>
            <Card.Root
              bg="bg"
              borderColor="border"
              transition="all 0.2s"
              _hover={{
                borderColor: "purple.500/50",
                shadow: "0 0 20px {colors.purple.500/10}",
                transform: "scale(1.02)",
              }}
              h="full"
              overflow="hidden"
            >
              <Box position="relative" h="40" overflow="hidden">
                <Box position="absolute" top="2" right="2" zIndex="2">
                  <ShareButton calendarId={calendar.id} variant="icon" />
                </Box>
                {calendar.games.some((g) => g.coverUrl) ? (
                  <SimpleGrid
                    columns={Math.min(
                      calendar.games.filter((g) => g.coverUrl).length,
                      5,
                    )}
                    h="full"
                  >
                    {calendar.games
                      .filter((g) => g.coverUrl)
                      .map((game, i) => (
                        <Box key={i} overflow="hidden" h="full">
                          <Image
                            src={game.coverUrl!}
                            alt={game.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                            transition="transform 0.3s"
                          />
                        </Box>
                      ))}
                  </SimpleGrid>
                ) : (
                  <Box
                    h="full"
                    bgGradient="to-br"
                    gradientFrom="purple.900/40"
                    gradientTo="purple.600/20"
                  />
                )}
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  h="16"
                  bgGradient="to-t"
                  gradientFrom="bg"
                  gradientTo="transparent"
                />
              </Box>
              <Card.Body>
                <VStack gap="4" align="start">
                  <VStack gap="1" align="start" w="full">
                    <Heading as="h3" size="lg" lineClamp={1}>
                      {calendar.name}
                    </Heading>
                    <Badge variant="subtle" size="sm">
                      <FiMonitor />{" "}
                      {platformLabels[calendar.platform] ?? calendar.platform}
                    </Badge>
                  </VStack>

                  <HStack gap="2" flexWrap="wrap">
                    {calendar.genres.map((genre) => (
                      <Badge key={genre} variant="outline" size="sm">
                        {genre}
                      </Badge>
                    ))}
                  </HStack>

                  <SimpleGrid columns={2} gap="3" w="full">
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <Icon fontSize="sm">
                        <FiGrid />
                      </Icon>
                      <Text>
                        {calendar._count.games}{" "}
                        {calendar._count.games === 1 ? "game" : "games"}
                      </Text>
                    </HStack>
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <Icon fontSize="sm">
                        <FiClock />
                      </Icon>
                      <Text>{calendar.hoursPerWeek}h/week</Text>
                    </HStack>
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <Icon fontSize="sm">
                        <FiCalendar />
                      </Icon>
                      <Text>
                        {timePeriodLabels[calendar.timePeriod] ??
                          calendar.timePeriod}
                      </Text>
                    </HStack>
                    <HStack gap="1.5" color="fg.muted" fontSize="sm">
                      <Icon fontSize="sm">
                        <FiPlay />
                      </Icon>
                      <Text>
                        {playStyleLabels[calendar.playStyle] ??
                          calendar.playStyle}
                      </Text>
                    </HStack>
                  </SimpleGrid>

                  <Text color="fg.subtle" fontSize="xs">
                    Created {formatDate(calendar.createdAt)}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Link>
        </Box>
      ))}
    </SimpleGrid>
  );
}
