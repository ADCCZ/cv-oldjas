"use client";

import { useMediaQuery } from "./useMediaQuery";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Live `prefers-reduced-motion: reduce`. The server snapshot is `false` (full motion). */
export function useReducedMotion(): boolean {
  return useMediaQuery(QUERY);
}

/** Non-hook variant for event handlers and effects. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}
