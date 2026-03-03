import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { CalendarForm } from "@/components";
import { prisma } from "@/lib";
import { DAILY_GENERATION_LIMIT } from "@/utils";

export default async function AddCalendarPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const used = await prisma.calendar.count({
    where: { createdAt: { gte: todayStart } },
  });

  const remaining = Math.max(0, DAILY_GENERATION_LIMIT - used);
  return (
    <Box
      backgroundImage="radial-gradient(ellipse at 50% 0%, rgba(128,90,213,0.15) 0%, transparent 50%), radial-gradient(circle, rgba(128,90,213,0.06) 1px, transparent 1px)"
      backgroundSize="100% 100%, 24px 24px"
    >
      {/* Page header */}
      <Container maxW="3xl" pt={{ base: "12", md: "16" }}>
        <VStack gap="3" textAlign="center">
          <Heading size={{ base: "2xl", md: "3xl" }}>
            Create Your Gaming Calendar
          </Heading>
          <Text color="fg.muted" fontSize="lg" maxW="xl">
            Tell us what you like and how much time you have — AI will handle
            the rest.
          </Text>
        </VStack>
      </Container>

      {/* Form */}
      <Container maxW="3xl" py={{ base: "8", md: "12" }}>
        <Box
          bg="bg"
          border="1px solid"
          borderColor="border"
          borderRadius="2xl"
          p={{ base: "6", md: "10" }}
        >
          <CalendarForm remaining={remaining} limit={DAILY_GENERATION_LIMIT} />
        </Box>
      </Container>
    </Box>
  );
}
