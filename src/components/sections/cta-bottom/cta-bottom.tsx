import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

export function CtaBottom() {
  return (
    <Box
      py={{ base: "16", md: "24" }}
      borderTop="1px solid"
      borderColor="border"
    >
      <Container maxW="3xl">
        <VStack
          gap="6"
          textAlign="center"
          bg="purple.500/10"
          py="16"
          px="8"
          borderRadius="2xl"
          border="1px solid"
          borderColor="purple.500/20"
        >
          <Heading size={{ base: "2xl", md: "3xl" }}>
            Ready to Level Up Your Gaming?
          </Heading>
          <Text color="fg.muted" fontSize="lg" maxW="lg">
            Be the first to know when Gamedar launches. Your perfect gaming
            schedule is just around the corner.
          </Text>
          <Button size="xl" disabled>
            Coming Soon
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
