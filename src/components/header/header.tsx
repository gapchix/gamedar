"use client";

import { Box, Container, Flex, Heading, HStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { FiGithub } from "react-icons/fi";

export function Header() {
  return (
    <Box
      as="nav"
      bg="bg.subtle"
      borderBottom="1px solid"
      borderColor="border"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Container maxW="7xl">
        <Flex h="16" align="center" justify="space-between">
          <Link asChild _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
              <Heading size="lg" fontWeight="bold" color="accent">
                Gamedar
              </Heading>
            </NextLink>
          </Link>

          <HStack gap="6">
            <Link asChild _hover={{ color: "accent" }}>
              <NextLink href="/">Home</NextLink>
            </Link>
            <Link
              href="https://github.com/gapchix/gamedar"
              target="_blank"
              rel="noopener noreferrer"
              _hover={{ color: "accent" }}
            >
              <HStack gap="2">
                <FiGithub />
                <span>GitHub</span>
              </HStack>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
