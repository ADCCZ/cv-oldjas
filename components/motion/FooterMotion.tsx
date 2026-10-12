"use client";

import { useRef } from "react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK, shuffled } from "@/lib/motion";

/**
 * Footer, the giant surname (noth.in style):
 * - entrance: the letters rise in random order when the name scrolls into view;
 * - hover: a letter shrinks to a dot and springs back (elastic). A letter that is still
 *   animating ignores the pointer, so sweeping across the name plays each letter once.
 */
export function FooterMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const giant = marker.current?.closest("footer")?.querySelector<HTMLElement>("[data-giant]");
    if (!giant) return;
    const letters = gsap.utils.toArray<HTMLElement>("[data-giant-letter]", giant);

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
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

    mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
      const busy = new Set<HTMLElement>();
      const timelines: gsap.core.Timeline[] = [];

      const onEnter = (event: MouseEvent) => {
        const letter = event.currentTarget as HTMLElement;
        if (busy.has(letter)) return;
        busy.add(letter);
        const timeline = gsap
          .timeline({
            onComplete: () => {
              busy.delete(letter);
              timelines.splice(timelines.indexOf(timeline), 1);
            },
          })
          .to(letter, { scale: 0.05, duration: 0.6, ease: EASE.inOut })
          .to(letter, { scale: 1, duration: 1.8, ease: "elastic.out(1, 0.8)" });
        timelines.push(timeline);
      };

      letters.forEach((letter) => letter.addEventListener("mouseenter", onEnter));

      return () => {
        letters.forEach((letter) => letter.removeEventListener("mouseenter", onEnter));
        timelines.forEach((timeline) => timeline.kill());
        gsap.set(letters, { scale: 1 });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
