import {
  Box,
  Card,
  Container,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiCpu, FiDatabase, FiMonitor, FiShare2 } from "react-icons/fi";

const features = [
  {
    icon: FiCpu,
    title: "AI-Powered Scheduling",
    description:
      "Our AI analyzes your preferences and available time to create the optimal gaming schedule.",
  },
  {
    icon: FiDatabase,
    title: "IGDB Game Database",
    description:
      "Access thousands of games with ratings, reviews, and details from the IGDB database.",
  },
  {
    icon: FiShare2,
    title: "Shareable Calendars",
    description:
      "Share your personalized game calendar with friends via a unique link.",
  },
  {
    icon: FiMonitor,
    title: "Cross-Platform",
    description:
      "Support for PC, PlayStation, Xbox, Nintendo Switch, and more platforms.",
  },
];

export function Features() {
  return (
    <Box
      py={{ base: "16", md: "24" }}
      bg="bg.subtle"
      borderTop="1px solid"
      borderColor="border"
      backgroundImage="radial-gradient(circle, {colors.purple.500/15} 1px, transparent 1px)"
      backgroundSize="24px 24px"
    >
      <Container maxW="7xl">
        <VStack gap="12">
          <VStack gap="4" textAlign="center">
            <Heading size={{ base: "2xl", md: "3xl" }}>
              Everything You Need
            </Heading>
            <Text fontSize="lg" color="fg.muted" maxW="2xl">
              Powerful features to help you organize your gaming life.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6" w="full">
            {features.map((feature) => (
              <Card.Root key={feature.title} bg="bg" borderColor="border">
                <Card.Body>
                  <VStack gap="4" align="start">
                    <Icon fontSize="3xl" color="purple.400">
                      <feature.icon />
                    </Icon>
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="fg.muted" fontSize="sm">
                      {feature.description}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
