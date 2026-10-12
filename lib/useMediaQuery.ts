"use client";

import { useSyncExternalStore } from "react";

/**
 * Live result of a CSS media query. The server snapshot is `false`, so components that depend on
 * it (custom cursor, physics) render nothing on the server and appear after hydration.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
