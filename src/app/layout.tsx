import type { Metadata } from "next";
import { Box, Flex } from "@chakra-ui/react";
import { Providers } from "./providers";
import { Header, Footer } from "@/components";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Gamedar — AI-Powered Game Calendar",
    template: "%s | Gamedar",
  },
  description:
    "Generate a personalized gaming calendar with AI. Pick your platform, genres, and available time — get a tailored schedule of games to play.",
  applicationName: "Gamedar",
  keywords: [
    "game calendar",
    "gaming schedule",
    "AI game recommendations",
    "personalized gaming",
    "game planner",
    "PC games",
    "PlayStation",
    "Xbox",
    "Nintendo Switch",
  ],
  openGraph: {
    type: "website",
    siteName: "Gamedar",
    title: "Gamedar — AI-Powered Game Calendar",
    description:
      "Generate a personalized gaming calendar with AI. Pick your platform, genres, and available time — get a tailored schedule of games to play.",
    url: APP_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamedar — AI-Powered Game Calendar",
    description:
      "Generate a personalized gaming calendar with AI. Pick your platform, genres, and available time — get a tailored schedule of games to play.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
