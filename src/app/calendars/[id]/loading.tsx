import {
  Container,
  Skeleton,
  SimpleGrid,
  VStack,
  HStack,
} from "@chakra-ui/react";

export default function CalendarViewLoading() {
  return (
    <Container maxW="5xl" py={{ base: "8", md: "16" }}>
      <VStack gap="10" align="stretch">
        <VStack gap="4" align="start">
          <Skeleton h="8" w="160px" />
          <Skeleton h="10" w="300px" />
          <HStack gap="3">
            <Skeleton h="6" w="80px" borderRadius="full" />
            <Skeleton h="6" w="80px" borderRadius="full" />
            <Skeleton h="6" w="80px" borderRadius="full" />
          </HStack>
        </VStack>

        <Skeleton h="80px" borderRadius="xl" />

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          <Skeleton h="80px" borderRadius="xl" />
          <Skeleton h="80px" borderRadius="xl" />
          <Skeleton h="80px" borderRadius="xl" />
        </SimpleGrid>

        <VStack gap="6" align="stretch">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} h="160px" borderRadius="xl" />
          ))}
        </VStack>
      </VStack>
    </Container>
  );
}
