"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Draggable as DraggableType } from "gsap/Draggable";
import type { Flip as FlipType } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Single place where GSAP plugins are registered. Every component imports gsap from here,
 * so the registration always runs before the first animation.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

/*
 * Interaction plugins are only needed far below the fold (draggable strips, the stack pile), so
 * they are loaded on demand – a separate chunk instead of more JavaScript in the first load.
 * The promises are cached: every caller gets the same, already registered plugin.
 */
let draggableLoad: Promise<typeof DraggableType> | null = null;
let flipLoad: Promise<typeof FlipType> | null = null;

/** Draggable + InertiaPlugin (throwing with momentum). */
export function loadDraggable(): Promise<typeof DraggableType> {
  draggableLoad ??= Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]).then(
    ([{ Draggable }, { InertiaPlugin }]) => {
      gsap.registerPlugin(Draggable, InertiaPlugin);
      return Draggable;
    },
  );
  return draggableLoad;
}

export function loadFlip(): Promise<typeof FlipType> {
  flipLoad ??= import("gsap/Flip").then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });
  return flipLoad;
}

/** Motion tokens shared with CSS (`--ease-inout`). power2.inOut = cubic-bezier(0.65, 0, 0.35, 1). */
export const EASE = {
  inOut: "power2.inOut",
  reveal: "expo.out",
  /** Masked text reveals (lines, letters). */
  mask: "power4.inOut",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
