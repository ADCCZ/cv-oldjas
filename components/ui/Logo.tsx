"use client";

import { useEffect, useRef } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

type Props = {
  /** Short → middle → full form of the name (content/*.ts, nav.logo). */
  names: readonly string[];
  className?: string;
};

/** The full name only fits the centred header slot from lg up – below it would run into the toggles. */
const FULL_NAME_FITS = "(min-width: 1024px)";
/** How long each form stays before the next one rolls in. */
const HOLD = { middle: 1.4, full: 2.4 };

/**
 * Monogram placeholder until the final SVG logo lands in public/logo.svg.
 *
 * While the pointer rests on the logo (or the link has keyboard focus) the monogram unfolds: "OJŠ"
 * rolls up into "OlďJaŠ", then into the full name, and the two keep taking turns; leaving it rolls
 * back to "OJŠ". The width eases along with the text, so the centred logo grows from its middle.
 * With reduced motion the full name simply appears. Decorative – the link carries the name.
 */
export function Logo({ names, className = "" }: Props) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const target = el?.closest("a") ?? el;
    if (!el || !target || names.length < 2) return;
    const forms = gsap.utils.toArray<HTMLElement>("[data-logo-form]", el);
    // GSAP takes over the waiting position the markup gave the hidden forms.
    gsap.set(forms, { y: 0, yPercent: (i: number) => (i ? 110 : 0) });
    let current = 0;
    let call: gsap.core.Tween | null = null;

    const show = (next: number) => {
      if (next === current || !forms[next]) return;
      const reduced = prefersReducedMotion();
      const width = forms[next]!.offsetWidth;
      gsap.to(el, { width, duration: reduced ? 0 : 0.5, ease: EASE.inOut, overwrite: true });
      gsap.to(forms[current]!, { yPercent: -110, duration: reduced ? 0 : 0.45, ease: EASE.inOut, overwrite: true });
      gsap.fromTo(
        forms[next]!,
        { yPercent: 110 },
        { yPercent: 0, duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.04, ease: EASE.inOut, overwrite: true },
      );
      current = next;
    };

    // OlďJaŠ ⇄ Oldřich Jan Švehla for as long as the pointer stays.
    const cycle = () => {
      const fullFits = forms.length > 2 && window.matchMedia(FULL_NAME_FITS).matches;
      if (!fullFits) return;
      const next = current === 1 ? 2 : 1;
      call = gsap.delayedCall(current === 1 ? HOLD.middle : HOLD.full, () => {
        show(next);
        cycle();
      });
    };

    const open = () => {
      call?.kill();
      if (prefersReducedMotion()) {
        show(forms.length - 1);
        return;
      }
      show(1);
      cycle();
    };
    const close = () => {
      call?.kill();
      call = null;
      show(0);
      // Back to the natural width once folded (fonts or the viewport may change meanwhile).
      gsap.delayedCall(prefersReducedMotion() ? 0 : 0.55, () => current === 0 && gsap.set(el, { clearProps: "width" }));
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
      gsap.set([el, ...forms], { clearProps: "transform,width" });
    };
  }, [names]);

  return (
    <span
      ref={root}
      className={`relative inline-block overflow-hidden py-[0.12em] align-middle text-2xl leading-none font-black tracking-[-0.06em] whitespace-nowrap ${className}`}
      aria-hidden="true"
    >
      {names.map((name, i) => (
        <span
          key={name}
          data-logo-form={i}
          className={i === 0 ? "block" : "absolute top-[0.12em] left-0 block"}
          style={i === 0 ? undefined : { transform: "translateY(110%)" }}
        >
          {name}
        </span>
      ))}
    </span>
  );
}
