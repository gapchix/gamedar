import {
  createSystem,
  defaultConfig,
  defineConfig,
  mergeConfigs,
} from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        accent: {
          value: {
            _light: "{colors.purple.500}",
            _dark: "{colors.purple.400}",
          },
        },
        "accent.subtle": {
          value: {
            _light: "{colors.purple.50}",
            _dark: "{colors.purple.950}",
          },
        },
        "accent.fg": {
          value: {
            _light: "{colors.purple.700}",
            _dark: "{colors.purple.300}",
          },
        },
        "accent.secondary": {
          value: { _light: "{colors.cyan.500}", _dark: "{colors.cyan.400}" },
        },
      },
    },
  },
});

export const system = createSystem(mergeConfigs(defaultConfig, customConfig));
