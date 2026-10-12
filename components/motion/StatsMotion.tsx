"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

/** Stats: every number counts up from 0 the first time the strip scrolls into view. */
export function StatsMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#stats");
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]", section);
      counters.forEach((el) => (el.textContent = "0"));
      const tweens: gsap.core.Tween[] = [];

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 85%",
        once: true,
        onEnter: () =>
          counters.forEach((el, i) => {
            const target = Number(el.dataset.count) || 0;
            const value = { n: 0 };
            tweens.push(
              gsap.to(value, {
                n: target,
                // Years need longer to read as counting, small numbers would flash by.
                duration: target > 100 ? 2.2 : 1.4,
                delay: i * 0.08,
                ease: "power3.out",
                onUpdate: () => (el.textContent = String(Math.round(value.n))),
              }),
            );
          }),
      });

      return () => {
        trigger.kill();
        tweens.forEach((tween) => tween.kill());
        counters.forEach((el) => (el.textContent = el.dataset.count ?? ""));
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
