import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";

export function Hero() {
  return (
    <Box
      py={{ base: "20", md: "32" }}
      backgroundImage="radial-gradient(ellipse at 50% 0%, rgba(128,90,213,0.15) 0%, transparent 60%)"
    >
      <Container maxW="5xl">
        <VStack gap="8" textAlign="center">
          <Badge size="lg" variant="subtle">
            AI-Powered
          </Badge>

          <Heading
            size={{ base: "4xl", md: "6xl" }}
            fontWeight="bold"
            lineHeight="tight"
          >
            Your Personal{" "}
            <Text as="span" color="purple.400">
              Game Calendar
            </Text>
          </Heading>

          <Text fontSize={{ base: "lg", md: "xl" }} color="fg.muted" maxW="2xl">
            Tell us your platform, favorite genres, and how many hours you can
            play — our AI creates the perfect gaming schedule tailored just for
            you.
          </Text>

          <Link asChild _hover={{ textDecoration: "none" }}>
            <NextLink href="/calendars/add">
              <Button size="xl">Get Started</Button>
            </NextLink>
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
