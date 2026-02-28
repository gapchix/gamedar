import { Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function CalendarPage() {
  return (
    <Container maxW="5xl" py={{ base: "16", md: "24" }}>
      <VStack gap="4" textAlign="center">
        <Heading size={{ base: "2xl", md: "3xl" }}>Your Calendar</Heading>
        <Text color="fg.muted" fontSize="lg">
          This page is coming soon.
        </Text>
      </VStack>
    </Container>
  );
}
