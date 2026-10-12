"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { pad } from "@/lib/i18n";
import { MD_UP, MOTION_OK } from "@/lib/motion";

/**
 * Projects from md up: the block is pinned and the vertical scroll distance is converted into
 * horizontal movement of the strip (scrub). The counter "01 / 07" follows the progress and each
 * cover drifts against the card (containerAnimation) – the image moves slower than its frame.
 */
export function ProjectsMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const pinEl = marker.current?.closest<HTMLElement>("[data-projects-pin]");
    const track = pinEl?.querySelector<HTMLElement>("[data-projects-track]");
    const counter = pinEl?.querySelector<HTMLElement>("[data-projects-counter]");
    if (!pinEl || !track) return;

    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and ${MD_UP}`, () => {
      track.classList.add("is-pinned");
      const cards = track.querySelectorAll<HTMLElement>("article");
      const total = cards.length;
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

      const strip = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (counter) counter.textContent = pad(Math.min(total, Math.floor(self.progress * total) + 1));
          },
        },
      });

      const parallax = gsap.utils.toArray<HTMLElement>("[data-parallax]", track).map((layer) =>
        gsap.fromTo(
          layer,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: layer.closest("article") ?? layer,
              containerAnimation: strip,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        ),
      );

      ScrollTrigger.refresh();

      return () => {
        [strip, ...parallax].forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        track.classList.remove("is-pinned");
        gsap.set(track, { clearProps: "transform" });
        if (counter) counter.textContent = "01";
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
