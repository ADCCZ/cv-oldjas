"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { prefersReducedMotion } from "./useReducedMotion";

/**
 * Smooth scrolling (Lenis) wired into GSAP.
 *
 * Lenis is not run on its own rAF loop: GSAP's ticker drives it, so Lenis and every ScrollTrigger
 * read the scroll position in the same frame and pinned/scrubbed animations never lag behind.
 * With `prefers-reduced-motion: reduce` Lenis is never started and the page scrolls natively.
 */
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/** Same curve as the CSS token `--ease-inout`: cubic-bezier(0.65, 0, 0.35, 1). */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function startLenis(): () => void {
  const instance = new Lenis({ autoRaf: false });
  lenis = instance;

  instance.on("scroll", ScrollTrigger.update);

  // gsap.ticker passes seconds, Lenis expects milliseconds.
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  // Lenis needs the real frame delta – GSAP's lag smoothing would make it jump after a slow frame.
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

/** Respect each target's CSS `scroll-margin-top`, so Lenis and native jumps land on the same pixel. */
function scrollMargin(el: Element): number {
  return parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
}

/**
 * Scrolls to the element with the given id – through Lenis when it runs, natively otherwise.
 * Returns false when there is no such element.
 */
export function scrollToId(id: string, { immediate = false }: { immediate?: boolean } = {}): boolean {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return false;

  if (lenis) {
    lenis.scrollTo(id === "top" ? 0 : el, {
      offset: id === "top" ? 0 : -scrollMargin(el),
      immediate,
      duration: 1.2,
      easing: easeInOutCubic,
      force: true,
    });
  } else if (id === "top") {
    window.scrollTo({ top: 0, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
  } else {
    el.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }
  return true;
}

/**
 * Freezes page scrolling while the fullscreen menu is open. Both functions are idempotent and
 * synchronous on purpose: a menu link must unlock the page before the jump to its section starts.
 */
export function lockScroll(): void {
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = "hidden";
}

export function unlockScroll(): void {
  if (lenis) lenis.start();
  document.documentElement.style.overflow = "";
}
