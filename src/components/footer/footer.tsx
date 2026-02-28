import { Box, Container, Flex, HStack, Link, Text } from "@chakra-ui/react";
import { FiGithub } from "react-icons/fi";

export function Footer() {
  return (
    <Box as="footer" borderTop="1px solid" borderColor="border" py="8">
      <Container maxW="7xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap="4"
        >
          <Text fontSize="sm" color="fg.muted">
            &copy; {new Date().getFullYear()} Gamedar. All rights reserved.
          </Text>

          <HStack gap="4">
            <Link
              href="https://github.com/gapchix/gamedar"
              target="_blank"
              rel="noopener noreferrer"
              color="fg.muted"
              _hover={{ color: "accent" }}
            >
              <FiGithub size={20} />
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
