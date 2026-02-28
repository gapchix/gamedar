"use client";

import {
  Accordion,
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

const faqs = [
  {
    question: "What is Gamedar?",
    answer:
      "Gamedar is an AI-powered tool that creates personalized game calendars. It analyzes your preferences, available time, and platform to suggest the best games and schedule them for you.",
  },
  {
    question: "How does the AI scheduling work?",
    answer:
      "Our AI considers your preferred genres, platform, available hours per week, and the time period you want to plan for. It then selects games from the IGDB database and creates an optimized schedule.",
  },
  {
    question: "What game database do you use?",
    answer:
      "We use the IGDB (Internet Game Database) which contains data on thousands of games across all platforms, including ratings, release dates, and detailed descriptions.",
  },
  {
    question: "Is Gamedar free to use?",
    answer:
      "Gamedar will offer a free tier for basic calendar generation. Premium features like advanced AI customization and calendar exports may be available in the future.",
  },
  {
    question: "Can I share my calendar with friends?",
    answer:
      "Yes! Every generated calendar gets a unique shareable link. You can send it to friends so they can see your gaming schedule.",
  },
];

export function Faq() {
  return (
    <Box
      py={{ base: "16", md: "24" }}
      bg="bg.subtle"
      borderTop="1px solid"
      borderColor="border"
      backgroundImage="radial-gradient(circle, {colors.purple.500/15} 1px, transparent 1px)"
      backgroundSize="24px 24px"
    >
      <Container maxW="3xl">
        <VStack gap="12">
          <VStack gap="4" textAlign="center">
            <Heading size={{ base: "2xl", md: "3xl" }}>
              Frequently Asked Questions
            </Heading>
            <Text fontSize="lg" color="fg.muted">
              Got questions? We have answers.
            </Text>
          </VStack>

          <Accordion.Root multiple w="full" variant="enclosed">
            {faqs.map((faq, i) => (
              <Accordion.Item key={i} value={`faq-${i}`}>
                <Accordion.ItemTrigger>
                  <Text flex="1" textAlign="left" fontWeight="medium">
                    {faq.question}
                  </Text>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody>
                    <Text color="fg.muted">{faq.answer}</Text>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </VStack>
      </Container>
    </Box>
  );
}
