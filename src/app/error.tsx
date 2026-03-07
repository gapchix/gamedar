"use client";

import { Button, Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container maxW="lg" py={{ base: "24", md: "32" }}>
      <VStack gap="6" textAlign="center">
        <Heading size={{ base: "2xl", md: "3xl" }}>
          Something went wrong
        </Heading>
        <Text color="fg.muted" fontSize="lg" maxW="md">
          An unexpected error occurred. Please try again or go back to the
          homepage.
        </Text>
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </VStack>
    </Container>
  );
}
