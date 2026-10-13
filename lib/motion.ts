"use client";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Small helpers shared by the scroll/intro animations.
 */

/** Media query used with gsap.matchMedia(): full motion only when the visitor did not ask for less. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** Desktop and tablet layouts (pinned horizontal projects, sticky folders). */
export const MD_UP = "(min-width: 768px)";
/** A mouse or trackpad – hover effects, the custom cursor and magnetic buttons need one. */
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/*
 * Setup that measures text (SplitText, ScrollTrigger) waits for the web fonts. The controllers'
 * callbacks then run one per task in the order they were registered – the hero first – so the
 * browser can paint between them (the intro keeps moving, no second-long freeze on a phone), and
 * ScrollTrigger measures the page once at the end instead of once per controller.
 */
const setupQueue: Array<() => void> = [];
const afterRefresh: Array<() => void> = [];
let draining = false;
let refreshWanted = false;

function drain() {
  if (draining) return;
  draining = true;
  const step = () => {
    const next = setupQueue.shift();
    if (next) {
      window.setTimeout(step, 0); // scheduled first: a throwing callback must not stall the queue
      next();
      return;
    }
    draining = false;
    if (refreshWanted) {
      refreshWanted = false;
      ScrollTrigger.refresh();
    }
    afterRefresh.splice(0).forEach((callback) => callback());
  };
  document.fonts.ready.then(() => window.setTimeout(step, 0));
}

/**
 * Runs `callback` once web fonts are ready (SplitText must measure final glyphs), in its own task.
 * Returns a cancel function so effects can clean up before it runs.
 */
export function afterFonts(callback: () => void): () => void {
  let cancelled = false;
  setupQueue.push(() => {
    if (!cancelled) callback();
  });
  drain();
  return () => {
    cancelled = true;
  };
}

/**
 * Asks for one ScrollTrigger.refresh() after the queued setup (and the fonts) – controllers that
 * add pins or change the layout call this instead of refreshing on their own. `then` runs right
 * after that refresh (e.g. a deep link that needs the final layout).
 */
export function requestRefresh(then?: () => void): void {
  refreshWanted = true;
  if (then) afterRefresh.push(then);
  drain();
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
 * Intro state written by the inline script in app/_site/SiteLayout.tsx before first paint:
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

/**
 * Dispatched on a drifting strip ([data-strip], DriftStrip) whenever its content moves; detail =
 * horizontal movement of the content in px (negative = to the left). The stats stickers ride on it.
 */
export const STRIP_MOVE_EVENT = "cv:strip-move";
