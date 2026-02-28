import {
  Box,
  Circle,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";

const steps = [
  {
    step: 1,
    title: "Set Your Preferences",
    description:
      "Choose your platform, favorite genres, and how many hours per week you want to play.",
  },
  {
    step: 2,
    title: "AI Generates Your Calendar",
    description:
      "Our AI picks the best games and schedules them into a personalized calendar.",
  },
  {
    step: 3,
    title: "Share & Play",
    description:
      "Get a shareable link to your calendar and start playing on schedule.",
  },
];

export function HowItWorks() {
  return (
    <Box
      py={{ base: "16", md: "24" }}
      borderTop="1px solid"
      borderColor="border"
    >
      <Container maxW="7xl">
        <VStack gap="12">
          <VStack gap="4" textAlign="center">
            <Heading size={{ base: "2xl", md: "3xl" }}>How It Works</Heading>
            <Text fontSize="lg" color="fg.muted" maxW="2xl">
              Three simple steps to your personalized gaming schedule.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="10" w="full">
            {steps.map((step) => (
              <VStack key={step.step} gap="4" textAlign="center">
                <Circle
                  size="16"
                  bg="purple.500/20"
                  color="purple.400"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  {step.step}
                </Circle>
                <Heading size="md">{step.title}</Heading>
                <Text color="fg.muted">{step.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
