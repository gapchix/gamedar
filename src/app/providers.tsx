"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { Toaster } from "@/components";

/**
 * Emotion cache registry for streaming SSR.
 *
 * Without it, Emotion emits <style data-emotion> tags inline next to the
 * elements inside streamed Suspense segments; the client render has no
 * such nodes, so React 19 fails hydration (#418). With a custom cache,
 * styles accumulate in cache.inserted and useServerInsertedHTML flushes
 * them into the stream's head section instead.
 */
function useEmotionCache() {
  const [cache] = useState(() => {
    const emotionCache = createCache({ key: "css" });
    emotionCache.compat = true;
    return emotionCache;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted).filter(
      (name) => typeof cache.inserted[name] === "string",
    );
    if (names.length === 0) return null;
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: names.map((name) => cache.inserted[name]).join(" "),
        }}
      />
    );
  });

  return cache;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const cache = useEmotionCache();

  return (
    <CacheProvider value={cache}>
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    </CacheProvider>
  );
}
