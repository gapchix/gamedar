import { Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function Home() {
  return (
    <Container maxW="lg" py="20">
      <VStack gap="6" textAlign="center">
        <Heading as="h1" size="4xl">
          Gamedar
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Your AI-powered game calendar. Select your platform, favorite genres,
          and available hours — and get a personalized gaming schedule.
        </Text>
      </VStack>
    </Container>
  );
}