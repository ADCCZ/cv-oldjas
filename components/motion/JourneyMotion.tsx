"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MD_UP, MOTION_OK } from "@/lib/motion";

/**
 * Journey from md up: while the next folder slides over a row, that row's body fades out,
 * so only the folder being read is in full colour. The fade ends exactly where the next
 * folder sticks (its resolved sticky `top`). Titles decode themselves (ScrambleText).
 */
export function JourneyMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#journey");
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and ${MD_UP}`, () => {
      const tweens: gsap.core.Tween[] = [];

      section.querySelectorAll("ol").forEach((list) => {
        const rows = Array.from(list.children) as HTMLElement[];
        rows.forEach((row, i) => {
          const next = rows[i + 1];
          const body = row.querySelectorAll("[data-folder-body]");
          if (!next || body.length === 0) return;
          tweens.push(
            gsap.to(body, {
              opacity: 0.12,
              ease: "none",
              scrollTrigger: {
                trigger: next,
                start: "top bottom",
                end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }),
          );
        });
      });

      ScrollTrigger.refresh();

      return () =>
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.revert();
        });
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
