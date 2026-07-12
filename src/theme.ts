import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    "html, body": {
      colorPalette: "purple",
    },
  },
  theme: {
    semanticTokens: {
      colors: {
        accent: {
          value: {
            _light: "{colors.purple.500}",
            _dark: "{colors.purple.400}",
          },
        },
      },
    },
  },
});

export const system = createSystem(mergeConfigs(defaultConfig, customConfig));
