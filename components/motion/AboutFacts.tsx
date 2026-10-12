"use client";

import { useRef } from "react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { aboutState, bearing } from "@/lib/webgl";

/**
 * About – quick facts next to the compass. While the text is read, one fact after another is
 * highlighted and the compass needle turns towards it (the 3D compass reads aboutState; without
 * WebGL the SVG needle swings here). Full motion only – otherwise all facts simply stay equal.
 */
export function AboutFacts() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#about");
    const list = section?.querySelector<HTMLElement>("[data-facts]");
    const text = section?.querySelector<HTMLElement>("[data-about-text]");
    const compass = section?.querySelector<HTMLElement>("[data-compass]");
    const needle = section?.querySelector<SVGElement>("[data-compass-needle]");
    if (!section || !list || !text) return;
    const facts = gsap.utils.toArray<HTMLElement>("[data-fact]", list);

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      list.classList.add("is-live");
      let active = -1;
      let angle = 0;
      const activate = (index: number) => {
        if (index === active) return;
        facts[active]?.removeAttribute("data-active");
        facts[index]?.setAttribute("data-active", "");
        active = index;
        aboutState.activeFact = index;
        // SVG fallback: swing the flat needle, taking the shorter way round.
        const icon = facts[index]?.querySelector("[data-fact-icon]");
        if (needle && compass && icon) {
          const target = bearing(compass, icon);
          angle += ((((target - angle) % 360) + 540) % 360) - 180;
          gsap.to(needle, { rotation: angle, svgOrigin: "100 100", duration: 1.4, ease: "elastic.out(1, 0.45)", overwrite: true });
        }
      };
      activate(0);

      const trigger = ScrollTrigger.create({
        trigger: text,
        start: "top 70%",
        end: "bottom 45%",
        onUpdate: (self) => activate(Math.min(facts.length - 1, Math.floor(self.progress * facts.length))),
      });

      return () => {
        trigger.kill();
        list.classList.remove("is-live");
        facts.forEach((fact) => fact.removeAttribute("data-active"));
        aboutState.activeFact = 0;
        if (needle) gsap.to(needle, { rotation: 0, svgOrigin: "100 100", duration: 0.2, ease: EASE.inOut });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
