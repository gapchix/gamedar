"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
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
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiGrid,
  FiMessageSquare,
  FiMonitor,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import { ShareButton } from "@/components/share-button";

interface CalendarGameData {
  id: string;
  title: string;
  coverUrl: string | null;
  estimatedHours: number;
  startDate: Date;
  endDate: Date;
  order: number;
  reason: string | null;
}

interface CalendarData {
  id: string;
  name: string;
  platform: string;
  genres: string[];
  hoursPerWeek: number;
  timePeriod: string;
  playStyle: string;
  summary: string | null;
  createdAt: Date;
  games: CalendarGameData[];
}

interface CalendarViewProps {
  calendar: CalendarData;
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
  // Fixed timeZone keeps server and client output identical (avoids hydration mismatch)
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDuration(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

export function CalendarView({ calendar }: CalendarViewProps) {
  const totalHours = calendar.games.reduce(
    (sum, g) => sum + g.estimatedHours,
    0,
  );

  const scheduleDuration =
    calendar.games.length > 0
      ? formatDuration(
          calendar.games[0].startDate,
          calendar.games.at(-1)!.endDate,
        )
      : "N/A";

  return (
    <Container maxW="5xl" py={{ base: "8", md: "16" }}>
      <VStack gap="10" align="stretch">
        {/* Header */}
        <VStack gap="6" align="stretch">
          <HStack justify="space-between" align="start">
            <VStack gap="4" align="start" flex="1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/calendars">
                  <FiArrowLeft /> Back to Calendars
                </Link>
              </Button>
              <Heading size={{ base: "2xl", md: "4xl" }}>
                {calendar.name}
              </Heading>
              <HStack gap="3" flexWrap="wrap">
                <Badge variant="subtle" size="sm">
                  <FiMonitor />{" "}
                  {platformLabels[calendar.platform] ?? calendar.platform}
                </Badge>
                <Badge variant="outline" size="sm">
                  <FiPlay />{" "}
                  {playStyleLabels[calendar.playStyle] ?? calendar.playStyle}
                </Badge>
                <Badge variant="outline" size="sm">
                  <FiClock /> {calendar.hoursPerWeek}h/week
                </Badge>
                <Badge variant="outline" size="sm">
                  <FiCalendar />{" "}
                  {timePeriodLabels[calendar.timePeriod] ?? calendar.timePeriod}
                </Badge>
              </HStack>
              <HStack gap="2" flexWrap="wrap">
                {calendar.genres.map((genre) => (
                  <Badge key={genre} variant="surface" size="sm">
                    {genre}
                  </Badge>
                ))}
              </HStack>
            </VStack>
            <ShareButton calendarId={calendar.id} variant="full" />
          </HStack>
        </VStack>

        {/* AI Summary */}
        {calendar.summary && (
          <Card.Root bg="bg" borderColor="border">
            <Card.Body>
              <HStack gap="3" align="start">
                <Icon fontSize="xl" color="fg.muted" mt="0.5">
                  <FiMessageSquare />
                </Icon>
                <VStack gap="1" align="start">
                  <Text fontWeight="semibold" fontSize="sm" color="fg.muted">
                    AI Summary
                  </Text>
                  <Text fontSize="md" lineHeight="tall">
                    {calendar.summary}
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          <Card.Root bg="bg" borderColor="border">
            <Card.Body>
              <HStack gap="3">
                <Icon fontSize="xl" color="fg.muted">
                  <FiGrid />
                </Icon>
                <VStack gap="0" align="start">
                  <Text fontSize="2xl" fontWeight="bold">
                    {calendar.games.length}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Total games
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
          <Card.Root bg="bg" borderColor="border">
            <Card.Body>
              <HStack gap="3">
                <Icon fontSize="xl" color="fg.muted">
                  <FiClock />
                </Icon>
                <VStack gap="0" align="start">
                  <Text fontSize="2xl" fontWeight="bold">
                    {Math.round(totalHours)}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Estimated hours
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
          <Card.Root bg="bg" borderColor="border">
            <Card.Body>
              <HStack gap="3">
                <Icon fontSize="xl" color="fg.muted">
                  <FiCalendar />
                </Icon>
                <VStack gap="0" align="start">
                  <Text fontSize="2xl" fontWeight="bold">
                    {scheduleDuration}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Schedule duration
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Game Timeline */}
        <VStack gap="0" align="stretch" position="relative">
          {/* Vertical timeline line - desktop only */}
          <Box
            display={{ base: "none", md: "block" }}
            position="absolute"
            left="20px"
            top="0"
            bottom="0"
            w="2px"
            bg="purple.500/30"
          />

          {calendar.games.map((game, index) => (
            <Box
              key={game.id}
              position="relative"
              pl={{ base: "0", md: "16" }}
              pb="6"
              animation="fadeIn 0.5s ease-out both"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              {/* Timeline node - desktop only */}
              <Box
                display={{ base: "none", md: "flex" }}
                position="absolute"
                left="10px"
                top="6"
                w="22px"
                h="22px"
                borderRadius="full"
                bg="purple.500"
                color="white"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight="bold"
                zIndex="1"
              >
                {game.order}
              </Box>

              <Card.Root
                bg="bg"
                borderColor="border"
                transition="all 0.2s"
                _hover={{
                  borderColor: "purple.500/50",
                  shadow: "0 0 20px {colors.purple.500/10}",
                }}
                overflow="hidden"
              >
                <Card.Body p="0">
                  <HStack
                    gap="0"
                    align="stretch"
                    flexDir={{ base: "column", sm: "row" }}
                  >
                    {/* Cover image */}
                    <Box
                      w={{ base: "full", sm: "120px" }}
                      h={{ base: "160px", sm: "auto" }}
                      minH={{ sm: "160px" }}
                      flexShrink={0}
                    >
                      {game.coverUrl ? (
                        <Image
                          src={game.coverUrl}
                          alt={game.title}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      ) : (
                        <Box
                          w="full"
                          h="full"
                          bgGradient="to-br"
                          gradientFrom="purple.900/40"
                          gradientTo="purple.600/20"
                        />
                      )}
                    </Box>

                    {/* Game info */}
                    <VStack gap="3" align="start" p="4" flex="1" minW="0">
                      <HStack justify="space-between" w="full" gap="2">
                        <Heading as="h3" size="md" lineClamp={1}>
                          {game.title}
                        </Heading>
                        <Badge variant="subtle" size="sm" flexShrink={0}>
                          <FiClock /> {game.estimatedHours}h
                        </Badge>
                      </HStack>

                      <Text fontSize="sm" color="fg.muted">
                        {formatDate(game.startDate)} —{" "}
                        {formatDate(game.endDate)}
                      </Text>

                      {game.reason && (
                        <Text fontSize="sm" color="fg.muted" lineClamp={2}>
                          {game.reason}
                        </Text>
                      )}

                      {/* Hours bar */}
                      <Box w="full">
                        <Box
                          h="3px"
                          bg="border"
                          borderRadius="full"
                          overflow="hidden"
                        >
                          <Box
                            h="full"
                            bg="purple.500"
                            borderRadius="full"
                            w={`${totalHours > 0 ? (game.estimatedHours / totalHours) * 100 : 0}%`}
                            transition="width 0.5s ease-out"
                            style={{
                              transitionDelay: `${0.1 * index + 0.3}s`,
                            }}
                          />
                        </Box>
                      </Box>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            </Box>
          ))}
        </VStack>

        {/* CTA Bottom */}
        <Card.Root bg="purple.500/10" borderColor="purple.500/20">
          <Card.Body>
            <VStack gap="4" textAlign="center" py="4">
              <Heading size="lg">Want your own gaming calendar?</Heading>
              <Text color="fg.muted">
                Let AI create a personalized schedule based on your preferences.
              </Text>
              <Button asChild size="lg">
                <Link href="/calendars/add">
                  <FiPlus /> Create Your Calendar
                </Link>
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
}
