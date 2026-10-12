"use client";

/**
 * Small helpers shared by the scroll/intro animations.
 */

/** Media query used with gsap.matchMedia(): full motion only when the visitor did not ask for less. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Desktop and tablet layouts (pinned horizontal projects, sticky folders). */
export const MD_UP = "(min-width: 768px)";
/** A mouse or trackpad – hover effects, the custom cursor and magnetic buttons need one. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Runs `callback` once web fonts are ready (SplitText must measure final glyphs).
 * Returns a cancel function so effects can clean up before the promise resolves.
 */
export function afterFonts(callback: () => void): () => void {
  let cancelled = false;
  document.fonts.ready.then(() => {
    if (!cancelled) callback();
  });
  return () => {
    cancelled = true;
  };
}

/** Random number in [min, max). */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Fisher–Yates shuffle of a copy – used for "letters arrive in random order". */
export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Intro state written by the inline script in app/[locale]/layout.tsx before first paint:
 * "play" – first visit in this tab session, the loader runs;
 * "replay" – loader already seen, only the hero letters rise;
 * "skip" – deep link (#section) or reduced motion, no intro at all.
 */
export type IntroState = "play" | "replay" | "skip";

export function introState(): IntroState {
  const value = document.documentElement.dataset.intro;
  return value === "play" || value === "replay" ? value : "skip";
}

/** Fired by the loader when its curtain starts lifting – the hero letters rise on this cue. */
export const INTRO_REVEAL_EVENT = "cv:intro-reveal";
