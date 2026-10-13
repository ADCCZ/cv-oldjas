"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { afterFonts, MOTION_OK, rand, requestRefresh } from "@/lib/motion";

/**
 * About:
 * - the heading assembles from letters scattered in 3D – the counterpart of the hero name
 *   flying apart, so the name seems to rearrange itself into "About";
 * - the text changes from muted to full colour word by word as you read (scrubbed; the CSS
 *   variable --reveal feeds a color-mix, so both themes keep working).
 */
export function AboutMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#about");
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const title = section.querySelector<HTMLElement>("#about-title");
      const text = section.querySelector<HTMLElement>("[data-about-text]");
      if (!title || !text) return;

      let titleSplit: SplitText | null = null;
      let words: SplitText | null = null;
      const tweens: gsap.core.Tween[] = [];

      const cancelFonts = afterFonts(() => {
        // aria "auto": the heading keeps its name via aria-label, the letters are aria-hidden.
        titleSplit = SplitText.create(title, { type: "chars", charsClass: "about-char", aria: "auto" });
        tweens.push(
          gsap.from(titleSplit.chars, {
            x: () => rand(-0.5, 0.5) * window.innerWidth,
            y: () => rand(-0.6, 0.2) * window.innerHeight,
            z: () => rand(-600, 300),
            rotation: () => rand(-120, 120),
            rotationX: () => rand(-80, 80),
            transformPerspective: 900,
            opacity: 0,
            ease: "power2.out",
            stagger: { each: 0.03, from: "random" },
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 20%", scrub: 0.6, invalidateOnRefresh: true },
          }),
        );

        words = SplitText.create(text.querySelectorAll("p"), { type: "words", wordsClass: "about-word", aria: "none" });
        gsap.set(words.words, { "--reveal": 0 });
        tweens.push(
          gsap.to(words.words, {
            "--reveal": 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: text, start: "top 75%", end: "bottom 55%", scrub: true },
          }),
        );

        requestRefresh();
      });

      return () => {
        cancelFonts();
        tweens.forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
        titleSplit?.revert();
        words?.revert();
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
