import { Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container maxW="lg" py={{ base: "24", md: "32" }}>
      <VStack gap="6" textAlign="center">
        <Heading size={{ base: "4xl", md: "5xl" }} fontWeight="extrabold">
          404
        </Heading>
        <Heading size={{ base: "xl", md: "2xl" }}>Page not found</Heading>
        <Text color="fg.muted" fontSize="lg" maxW="md">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Button asChild size="lg">
          <Link href="/">Go Home</Link>
        </Button>
      </VStack>
    </Container>
  );
}
