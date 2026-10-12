"use client";

import { useRef } from "react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK, shuffled } from "@/lib/motion";

/**
 * Footer: the giant surname rises letter by letter in random order when it scrolls into view
 * (noth.in style). The hover effect on the letters comes with the interactions.
 */
export function FooterMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const giant = marker.current?.closest("footer")?.querySelector<HTMLElement>("[data-giant]");
    if (!giant) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-giant-letter]", giant);
      giant.classList.add("is-masked");
      gsap.set(letters, { yPercent: 120 });

      let tween: gsap.core.Tween | null = null;
      const trigger = ScrollTrigger.create({
        trigger: giant,
        start: "top 95%",
        once: true,
        onEnter: () => {
          tween = gsap.to(shuffled(letters), {
            yPercent: 0,
            duration: 1.2,
            ease: EASE.mask,
            stagger: 0.05,
            onComplete: () => giant.classList.remove("is-masked"),
          });
        },
      });

      return () => {
        trigger.kill();
        tween?.kill();
        giant.classList.remove("is-masked");
        gsap.set(letters, { clearProps: "transform" });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
