"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

/**
 * Draws the hand-drawn underlines (`[data-draw]`) of the heading next to it once it scrolls into view
 * (CSS clip-path transition, globals.css). The state lives on the heading itself: SplitText
 * rebuilds the heading's content on every resize, so the paths cannot be tweened directly.
 * Without full motion the underlines are simply there.
 */
export function UnderlineDraw() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const heading = marker.current?.parentElement?.querySelector<HTMLElement>("h2");
    if (!heading) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      heading.setAttribute("data-draw-ready", "");
      // end "max": a page opened below the heading (#contact) draws it right away.
      const trigger = ScrollTrigger.create({
        trigger: heading,
        start: "top 75%",
        end: "max",
        once: true,
        onEnter: () => heading.setAttribute("data-drawn", ""),
      });
      return () => {
        trigger.kill();
        heading.removeAttribute("data-draw-ready");
        heading.removeAttribute("data-drawn");
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
