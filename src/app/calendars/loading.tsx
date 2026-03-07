import { Box, Container, Skeleton, HStack, VStack } from "@chakra-ui/react";

export default function CalendarsLoading() {
  return (
    <Box>
      <Container maxW="7xl" py={{ base: "12", md: "16" }}>
        <VStack gap="10" alignItems="stretch">
          <HStack
            w="full"
            justify="space-between"
            align="end"
            flexDir={{ base: "column", sm: "row" }}
            gap="4"
          >
            <VStack gap="2" align={{ base: "center", sm: "start" }}>
              <Skeleton h="9" w="200px" />
              <Skeleton h="6" w="320px" />
            </VStack>
            <Skeleton h="10" w="140px" borderRadius="lg" />
          </HStack>

          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap="6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} h="280px" borderRadius="xl" />
            ))}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
