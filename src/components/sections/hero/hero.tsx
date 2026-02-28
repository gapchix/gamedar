import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

export function Hero() {
  return (
    <Box
      py={{ base: "20", md: "32" }}
      backgroundImage="radial-gradient(ellipse at 50% 0%, rgba(128,90,213,0.15) 0%, transparent 60%)"
    >
      <Container maxW="5xl">
        <VStack gap="8" textAlign="center">
          <Badge colorPalette="purple" size="lg" variant="subtle">
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

          <Button size="xl" colorPalette="purple" disabled>
            Coming Soon
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
