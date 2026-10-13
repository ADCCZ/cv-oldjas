"use client";

import { useRef } from "react";
import { EASE, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { afterFonts, MOTION_OK, requestRefresh } from "@/lib/motion";

/** Strongest heading skew in degrees while the page is flung fast. */
const MAX_SKEW = 4;

/**
 * Page-wide scroll effects:
 * - red progress bar at the very top (an indicator, so it also runs with reduced motion);
 * - section headings ([data-reveal="lines"]) slide out of a mask line by line when they enter;
 * - big headings ([data-skew]) lean slightly with the scroll velocity and settle when it stops.
 */
export function MotionRoot() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const progress = gsap.to(bar.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const splits: SplitText[] = [];
      const reveals: gsap.core.Tween[] = [];

      const cancelFonts = afterFonts(() => {
        document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
          splits.push(
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              aria: "auto",
              autoSplit: true, // re-split on resize; the returned tween is replaced with it
              onSplit: (self) => {
                const tween = gsap.from(self.lines, {
                  yPercent: 105,
                  duration: 1,
                  ease: EASE.mask,
                  stagger: 0.08,
                  scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
                });
                reveals.push(tween);
                return tween;
              },
            }),
          );
        });
        requestRefresh();
      });

      // Velocity skew – quickTo smooths the jumps of the raw velocity.
      const skewEls = gsap.utils.toArray<HTMLElement>("[data-skew]");
      const skewTo = skewEls.map((el) => gsap.quickTo(el, "skewY", { duration: 0.6, ease: "power3.out" }));
      const tick = () => {
        const skew = gsap.utils.clamp(-MAX_SKEW, MAX_SKEW, -(getLenis()?.velocity ?? 0) * 0.15);
        skewTo.forEach((to) => to(skew));
      };
      gsap.ticker.add(tick);

      return () => {
        cancelFonts();
        gsap.ticker.remove(tick);
        reveals.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        splits.forEach((split) => split.revert());
        gsap.set(skewEls, { clearProps: "transform" });
      };
    });

    return () => {
      progress.scrollTrigger?.kill();
      progress.kill();
      mm.revert();
    };
  });

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left scale-x-0 bg-red-500"
    />
  );
}
