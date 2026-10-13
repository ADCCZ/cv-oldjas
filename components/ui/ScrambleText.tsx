"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { afterFonts, MOTION_OK } from "@/lib/motion";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MIXED = UPPER + "abcdefghijklmnopqrstuvwxyz";
/** A new random glyph every this many ms – fast enough to read as "decoding", slow enough to see. */
const GLYPH_MS = 50;

type Props = {
  text: string;
  className?: string;
  /** Total decode time in seconds. */
  duration?: number;
};

type Char = { el: HTMLElement; final: string; start: number; lock: number };

/**
 * Text that decodes itself when it scrolls into view (juncastudio.com style): every character
 * starts at its own moment, flickers through random red glyphs and locks to the final letter.
 * Each glyph keeps the measured width of the real letter, so the line never jumps.
 * Screen readers get the plain text; the animated copy is aria-hidden. Reduced motion: no effect.
 */
export function ScrambleText({ text, className = "", duration = 0.7 }: Props) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current?.querySelector<HTMLElement>("[data-scramble]");
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let split: SplitText | null = null;
        let trigger: ScrollTrigger | null = null;
        let tween: gsap.core.Tween | null = null;

        const cancelFonts = afterFonts(() => {
          split = SplitText.create(el, { type: "chars", charsClass: "scr-char", aria: "none" });
          const glyphs = text === text.toUpperCase() ? UPPER : MIXED;
          const n = Math.max(1, split.chars.length - 1);
          const nodes = split.chars as HTMLElement[];
          // Freeze the real glyph widths before any random glyph replaces them – all reads first,
          // then all writes, so the page is laid out once and not once per letter.
          const widths = nodes.map((charEl) => charEl.getBoundingClientRect().width);
          const chars: Char[] = nodes.map((charEl, i) => {
            Object.assign(charEl.style, { display: "inline-block", width: `${widths[i]}px`, textAlign: "center" });
            // Left-to-right wave with jitter; each letter flickers for 15–30 % of the run.
            const start = (i / n) * 0.55 + Math.random() * 0.25;
            return { el: charEl, final: charEl.textContent ?? "", start, lock: Math.min(1, start + 0.15 + Math.random() * 0.15) };
          });

          const state = { p: 0 };
          let lastTick = -1;
          const render = () => {
            const tick = Math.floor(performance.now() / GLYPH_MS);
            for (const c of chars) {
              if (state.p >= c.lock) {
                c.el.className = "scr-char";
                if (c.el.textContent !== c.final) c.el.textContent = c.final;
              } else if (state.p >= c.start) {
                c.el.className = "scr-char is-band";
                if (tick !== lastTick) c.el.textContent = glyphs[(Math.random() * glyphs.length) | 0]!;
              } else {
                c.el.className = "scr-char is-noise";
              }
            }
            lastTick = tick;
          };
          render();

          trigger = ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () => {
              tween = gsap.to(state, { p: 1, duration, ease: "none", onUpdate: render, onComplete: render });
            },
          });
        });

        return () => {
          cancelFonts();
          trigger?.kill();
          tween?.kill();
          split?.revert();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <span ref={root} className={className}>
      <span className="sr-only">{text}</span>
      <span data-scramble aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
