"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { afterFonts, MOTION_OK } from "@/lib/motion";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MIXED = UPPER + "abcdefghijklmnopqrstuvwxyz";
/** A new random glyph every this many ms – fast enough to read as "decoding", slow enough to see. */
const GLYPH_MS = 50;
/** Decode time of a hover replay – long enough to notice, short enough not to hold up the click. */
const HOVER_SECONDS = 0.6;

type Props = {
  text: string;
  className?: string;
  /** Total decode time in seconds when the text scrolls into view. */
  duration?: number;
  /** Decode when the text scrolls into view (the default). */
  appear?: boolean;
  /** Decode again whenever the surrounding link or button is hovered or focused from the keyboard. */
  hover?: boolean;
};

type Char = { el: HTMLElement; final: string; start: number; lock: number };

/**
 * Text that decodes itself (juncastudio.com style): every character starts at its own moment,
 * flickers through random red glyphs and locks to the final letter – when it scrolls into view
 * and/or when its link is hovered. Each glyph keeps the measured width of the real letter, so the
 * line never jumps. Screen readers get the plain text; the animated copy is aria-hidden.
 * Reduced motion: no effect.
 */
export function ScrambleText({ text, className = "", duration = 0.7, appear = true, hover = false }: Props) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current?.querySelector<HTMLElement>("[data-scramble]");
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let split: SplitText | null = null;
        let chars: Char[] = [];
        let trigger: ScrollTrigger | null = null;
        let tween: gsap.core.Tween | null = null;
        const glyphs = text === text.toUpperCase() ? UPPER : MIXED;
        const state = { p: 1 };
        // A hover replay keeps the letters that have not started yet readable instead of hiding them.
        let quiet = false;
        let entered = !appear;
        let lastTick = -1;

        const ensureSplit = () => {
          if (split) return;
          split = SplitText.create(el, { type: "chars", charsClass: "scr-char", aria: "none" });
          const nodes = split.chars as HTMLElement[];
          // Freeze the real glyph widths before any random glyph replaces them – all reads first,
          // then all writes, so the page is laid out once and not once per letter.
          const widths = nodes.map((charEl) => charEl.getBoundingClientRect().width);
          chars = nodes.map((charEl, i) => {
            Object.assign(charEl.style, { display: "inline-block", width: `${widths[i]}px`, textAlign: "center" });
            return { el: charEl, final: charEl.textContent ?? "", start: 0, lock: 0 };
          });
        };

        // Left-to-right wave with jitter; each letter flickers for 15–30 % of the run.
        const plan = () => {
          const n = Math.max(1, chars.length - 1);
          chars.forEach((c, i) => {
            c.start = (i / n) * 0.55 + Math.random() * 0.25;
            c.lock = Math.min(1, c.start + 0.15 + Math.random() * 0.15);
          });
        };

        const render = () => {
          const tick = Math.floor(performance.now() / GLYPH_MS);
          for (const c of chars) {
            if (state.p >= c.lock || (quiet && state.p < c.start)) {
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

        const play = (seconds: number) => {
          tween?.kill();
          state.p = 0;
          render();
          tween = gsap.to(state, { p: 1, duration: seconds, ease: "none", onUpdate: render, onComplete: render });
        };

        const cancelFonts = appear
          ? afterFonts(() => {
              if (entered) return; // a hover got there first
              ensureSplit();
              plan();
              state.p = 0;
              render();
              trigger = ScrollTrigger.create({
                trigger: el,
                start: "top 92%",
                once: true,
                onEnter: () => {
                  entered = true;
                  quiet = false;
                  play(duration);
                },
              });
            })
          : () => {};

        const target = hover ? root.current?.closest<HTMLElement>("a, button") : null;
        const replay = () => {
          // Hovered before its entrance played (the last 8 % of the viewport) – the hover takes over.
          if (!entered) {
            entered = true;
            trigger?.kill();
          }
          ensureSplit();
          plan();
          quiet = true;
          play(HOVER_SECONDS);
        };
        const onEnter = (event: PointerEvent) => {
          if (event.pointerType !== "touch") replay();
        };
        const onFocus = () => {
          if (target?.matches(":focus-visible")) replay();
        };
        target?.addEventListener("pointerenter", onEnter);
        target?.addEventListener("focus", onFocus);

        return () => {
          cancelFonts();
          target?.removeEventListener("pointerenter", onEnter);
          target?.removeEventListener("focus", onFocus);
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
