import type { Metadata } from "next";
import { Box, Flex } from "@chakra-ui/react";
import { Providers } from "./providers";
import { Header, Footer } from "@/components";

export const metadata: Metadata = {
  title: "Gamedar — AI-Powered Game Calendar",
  description:
    "Generate a personalized game calendar based on your preferences, platform, and available time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark"
      style={{ colorScheme: "dark" }}
    >
      <body>
        <Providers>
          <Flex direction="column" minH="dvh">
            <Header />
            <Box as="main" flex="1">
              {children}
            </Box>
            <Footer />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
