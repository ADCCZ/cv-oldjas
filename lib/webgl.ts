"use client";

/**
 * Bridge between the server-rendered page (with its GSAP controllers) and the lazily loaded WebGL
 * layer in components/webgl. Plain mutable objects, read every frame inside gsap.ticker – no React
 * state, and nothing from three.js: this module is part of the first load.
 */

/** Written by HeroMotion. */
export const heroState = {
  /** The name letters stand in their final place (intro finished, SplitText done). */
  ready: false,
  /** Progress of the scroll timeline that scatters the letters: 0 = untouched … 1 = gone. */
  scatter: 0,
};

/** Fired by HeroMotion once the name letters have settled – the WebGL layer may load now. */
export const HERO_READY_EVENT = "cv:hero-ready";

/** Written by AboutFacts: index of the fact the compass needle points at. */
export const aboutState = {
  activeFact: 0,
};

/**
 * `html[data-webgl]`: "on" while the WebGL layer runs, "off" when the browser cannot run it.
 * CSS and the DOM fallbacks (SVG compass needle, CSS cover hover) key off this attribute.
 */
export function webglOn(): boolean {
  return document.documentElement.dataset.webgl === "on";
}
