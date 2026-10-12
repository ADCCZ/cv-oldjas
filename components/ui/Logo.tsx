"use client";

import { Fragment, useEffect, useRef } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  /** Short → middle → full form of the name (content/*.ts, nav.logo); the first is the monogram. */
  names: readonly string[];
  className?: string;
};

/** The full name only fits the centred header slot from lg up – below it would run into the toggles. */
const FULL_NAME_FITS = "(min-width: 1024px)";
/** Clip of a gap while it opens or closes, and once open (overhanging accents stay visible). */
const CLIPPED = "inset(0em 0em 0em 0em)";
const OPEN = "inset(-0.3em -0.4em 0em 0em)";
/** Where waiting and rolled-out words sit (% of their height) – well clear of the open clip. */
const AWAY = 150;
/** How long each form stays before the next one takes over. */
const HOLD = { middle: 1.4, full: 2.4 };

/**
 * What follows each monogram letter in a form: "Oldřich Jan Švehla" around O, J, Š gives
 * ["ldřich ", "an ", "vehla"], "OlďJaŠ" gives ["lď", "a", ""].
 */
function gapsOf(form: string, letters: string[]): string[] {
  let from = 0;
  return letters.map((letter, i) => {
    const at = form.indexOf(letter, from);
    const nextLetter = letters[i + 1];
    const next = nextLetter === undefined ? form.length : form.indexOf(nextLetter, at + 1);
    from = next < 0 ? form.length : next;
    return at < 0 ? "" : form.slice(at + 1, next < 0 ? form.length : next);
  });
}

/**
 * Monogram placeholder until the final SVG logo lands in public/logo.svg.
 *
 * While the pointer rests on the logo (or the link has keyboard focus) the monogram spreads out:
 * the letters O, J and Š stay the very same glyphs and slide apart while the gaps after them open
 * and uncover the rest – "OlďJaŠ", then "Oldřich Jan Švehla" (the words in the gaps roll over),
 * the two taking turns for as long as the pointer stays. Leaving closes the gaps again.
 * The centred logo grows from its middle. With reduced motion the full name simply appears.
 */
export function Logo({ names, className = "" }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const letters = Array.from(names[0] ?? "");
  const gaps = names.map((form) => gapsOf(form, letters));

  useEffect(() => {
    const el = root.current;
    const target = el?.closest("a") ?? el;
    if (!el || !target || names.length < 2) return;
    const gapEls = gsap.utils.toArray<HTMLElement>("[data-logo-gap]", el);
    const words = gapEls.map((gap) => gsap.utils.toArray<HTMLElement>("[data-logo-word]", gap));
    // GSAP takes over the waiting position the markup gave the hidden words.
    words.forEach((list) => gsap.set(list, { y: 0, yPercent: (i: number) => (i ? AWAY : 0) }));
    let current = 0;
    let call: gsap.core.Tween | null = null;

    const show = (next: number) => {
      if (next === current) return;
      const d = prefersReducedMotion() ? 0 : 0.6;
      gapEls.forEach((gap, i) => {
        const list = words[i]!;
        const from = list[current]!;
        const to = list[next]!;
        // Clipped while it moves; once open, accents may overhang like in plain text (the ď caron).
        gsap.set(gap, { clipPath: CLIPPED });
        gsap.to(gap, {
          width: to.offsetWidth,
          duration: d,
          ease: EASE.inOut,
          overwrite: "auto",
          onComplete: () => {
            if (to.textContent && current === next) gsap.set(gap, { clipPath: OPEN });
          },
        });
        if (from.textContent === to.textContent) return;
        if (!from.textContent || gap.offsetWidth < 1) {
          // Opening from nothing: the widening gap uncovers the word.
          gsap.set(list, { yPercent: (k: number) => (k === next ? 0 : AWAY) });
        } else if (to.textContent) {
          // One word for another: it rolls over while the gap adjusts.
          gsap.to(from, { yPercent: -AWAY, duration: d * 0.85, ease: EASE.inOut, overwrite: true });
          gsap.fromTo(to, { yPercent: AWAY }, { yPercent: 0, duration: d * 0.85, delay: d * 0.1, ease: EASE.inOut, overwrite: true });
        }
        // Closing to nothing: the narrowing gap covers the word.
      });
      current = next;
    };

    // OlďJaŠ ⇄ Oldřich Jan Švehla for as long as the pointer stays.
    const cycle = () => {
      if (names.length < 3 || !window.matchMedia(FULL_NAME_FITS).matches) return;
      const next = current === 1 ? 2 : 1;
      call = gsap.delayedCall(current === 1 ? HOLD.middle : HOLD.full, () => {
        show(next);
        cycle();
      });
    };

    const open = () => {
      call?.kill();
      if (prefersReducedMotion()) {
        show(names.length - 1);
        return;
      }
      show(1);
      cycle();
    };
    const close = () => {
      call?.kill();
      call = null;
      show(0);
    };
    const onFocus = () => target.matches(":focus-visible") && open();

    target.addEventListener("pointerenter", open);
    target.addEventListener("pointerleave", close);
    target.addEventListener("focus", onFocus);
    target.addEventListener("blur", close);
    return () => {
      call?.kill();
      target.removeEventListener("pointerenter", open);
      target.removeEventListener("pointerleave", close);
      target.removeEventListener("focus", onFocus);
      target.removeEventListener("blur", close);
      gsap.set([...gapEls, ...words.flat()], { clearProps: "transform,width,clipPath" });
    };
  }, [names]);

  return (
    <span
      ref={root}
      className={`inline-flex items-start align-middle text-2xl leading-none font-black tracking-[-0.06em] whitespace-pre ${className}`}
      aria-hidden="true"
    >
      {letters.map((letter, i) => (
        <Fragment key={i}>
          <span className="block">{letter}</span>
          {names.length > 1 ? (
            // The gap after the letter: as wide as the word it shows, clipped (starts closed).
            <span data-logo-gap className="relative block h-[1em] w-0 [clip-path:inset(0)]">
              {gaps.map((formGaps, f) => (
                <span
                  key={f}
                  data-logo-word
                  className="absolute top-0 left-0 block"
                  style={f === 0 ? undefined : { transform: `translateY(${AWAY}%)` }}
                >
                  {formGaps[i]}
                </span>
              ))}
            </span>
          ) : null}
        </Fragment>
      ))}
    </span>
  );
}
