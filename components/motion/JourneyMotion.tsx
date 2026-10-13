"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MD_UP, MOTION_OK, requestRefresh } from "@/lib/motion";

/**
 * Journey from md up:
 * - measures the heading of each stack into --stack-head and pins it (data-pinned, globals.css), so
 *   the folders stack right below it – kept up to date by a ResizeObserver (fonts, wrapping);
 * - while the next folder slides over a row, that row's body fades out,
 * so only the folder being read is in full colour. The fade ends exactly where the next
 * folder sticks (its resolved sticky `top`). Titles decode themselves (ScrambleText).
 */
export function JourneyMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#journey");
    if (!section) return;

    const mm = gsap.matchMedia();

    // Layout, not motion – the headings stick with reduced motion too, like the folders do.
    mm.add(MD_UP, () => {
      const stacks = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-stack]"));
      const heights = new Map<Element, number>();
      const observer = new ResizeObserver((entries) => {
        let changed = false;
        for (const entry of entries) {
          const stack = entry.target.closest<HTMLElement>("[data-journey-stack]")!;
          const height = Math.round(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
          if (heights.get(stack) === height) continue;
          heights.set(stack, height);
          stack.style.setProperty("--stack-head", `${height}px`);
          stack.dataset.pinned = "";
          changed = true;
        }
        if (changed) requestRefresh();
      });
      stacks.forEach((stack) => {
        const content = stack.querySelector("[data-stack-head-content]");
        if (content) observer.observe(content);
      });

      return () => {
        observer.disconnect();
        stacks.forEach((stack) => {
          stack.style.removeProperty("--stack-head");
          delete stack.dataset.pinned;
        });
      };
    });

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

      requestRefresh();

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
