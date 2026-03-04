"use client";

import { useSyncExternalStore } from "react";
import {
  Toaster as ChakraToaster,
  Toast,
  createToaster,
} from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
});

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Toaster() {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!mounted) return null;

  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Toast.Root>
          <Toast.Indicator />
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </ChakraToaster>
  );
}
