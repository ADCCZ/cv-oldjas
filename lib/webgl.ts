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

/**
 * Written by MenuOverlay: true once the fullscreen menu covers the whole page, false again as soon as
 * it starts to close. The Driver draws nothing meanwhile – nobody would see it, and on touch screens
 * the hero liquid would keep the GPU busy under the menu.
 */
export const pageState = {
  covered: false,
};

/** Fired by HeroMotion once the name letters have settled – the WebGL layer may load now. */
export const HERO_READY_EVENT = "cv:hero-ready";

/** Written by AboutFacts: index of the fact the compass needle points at. */
export const aboutState = {
  activeFact: 0,
};

/**
 * Compass bearing (degrees, clockwise from north) from the centre of `from` to the centre of `to`
 * on screen. The compass needle points at the highlighted fact – literally, wherever the layout
 * puts it (beside the compass, below it, on a phone).
 */
export function bearing(from: Element, to: Element): number {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

/**
 * `html[data-webgl]`: "on" while the WebGL layer runs, "off" when the browser cannot run it.
 * CSS and the DOM fallbacks (SVG compass needle, CSS cover hover) key off this attribute.
 */
export function webglOn(): boolean {
  return document.documentElement.dataset.webgl === "on";
}
