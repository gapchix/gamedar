import { Box, Container, Skeleton, VStack } from "@chakra-ui/react";

export default function AddCalendarLoading() {
  return (
    <Box>
      <Container maxW="3xl" pt={{ base: "12", md: "16" }}>
        <VStack gap="3" alignItems="center">
          <Skeleton h="9" w="340px" />
          <Skeleton h="6" w="400px" />
        </VStack>
      </Container>

      <Container maxW="3xl" py={{ base: "8", md: "12" }}>
        <Box
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderRadius="2xl"
          p={{ base: "6", md: "10" }}
        >
          <VStack gap="6" alignItems="stretch">
            <Skeleton h="10" w="full" />
            <Skeleton h="10" w="full" />
            <Skeleton h="10" w="full" />
            <Skeleton h="10" w="full" />
            <Skeleton h="12" w="full" borderRadius="lg" />
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
