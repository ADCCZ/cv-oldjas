"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Single place where GSAP plugins are registered. Every component imports gsap from here,
 * so the registration always runs before the first animation. Interaction plugins
 * (Flip, Draggable, InertiaPlugin) join with the interactions phase.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

/** Motion tokens shared with CSS (`--ease-inout`). power2.inOut = cubic-bezier(0.65, 0, 0.35, 1). */
export const EASE = {
  inOut: "power2.inOut",
  reveal: "expo.out",
  /** Masked text reveals (lines, letters). */
  mask: "power4.inOut",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
