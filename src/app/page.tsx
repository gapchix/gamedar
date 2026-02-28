import { Box } from "@chakra-ui/react";
import {
  Hero,
  Features,
  HowItWorks,
  Faq,
  CtaBottom,
} from "@/components/sections";

export default function Home() {
  return (
    <Box>
      <Hero />
      <Features />
      <HowItWorks />
      <Faq />
      <CtaBottom />
    </Box>
  );
}
