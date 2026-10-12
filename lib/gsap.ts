"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single place where GSAP plugins are registered. Every component imports gsap from here,
 * so the registration always runs before the first animation. Plugins are added as the
 * phases that need them land (SplitText, Flip, Observer, Draggable, InertiaPlugin).
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Motion tokens shared with CSS (`--ease-inout`). power2.inOut = cubic-bezier(0.65, 0, 0.35, 1). */
export const EASE = {
  inOut: "power2.inOut",
  reveal: "expo.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
