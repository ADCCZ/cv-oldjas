"use client";

import { useRef } from "react";
import { gsap, loadDraggable, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK } from "@/lib/motion";

/** Spring back into the slot – a card let go wobbles home instead of stopping dead. */
const RETURN = { duration: 1.1, ease: "elastic.out(1, 0.55)" };

/**
 * Cards of a drifting strip (Beyond code) can be picked up on their own with the mouse: a `[data-toss]`
 * card follows the pointer inside the strip and springs back into its slot when let go, so the loop of
 * copies (DriftStrip) stays intact. While a card is held the strip stands still (`data-strip-hold`);
 * the strip itself is grabbed by the gaps between the cards. Links on a card keep their click.
 * Mouse and full motion only – touch keeps the native swipe of the strip.
 */
export function CardToss() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const strip = marker.current?.parentElement?.querySelector<HTMLElement>("[data-strip]");
    if (!strip) return;

    const mm = gsap.matchMedia();
    mm.add(`${FINE_POINTER} and ${MOTION_OK}`, () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-toss]", strip);
      let draggables: Draggable[] = [];
      let cancelled = false;

      void loadDraggable().then(({ Draggable }) => {
        if (cancelled) return;
        draggables = cards.flatMap((card) =>
          Draggable.create(card, {
            type: "x,y",
            bounds: strip,
            dragClickables: false,
            minimumMovement: 4,
            zIndexBoost: false,
            onPress() {
              gsap.killTweensOf(card);
              gsap.set(card, { zIndex: 20 });
              strip.setAttribute("data-strip-hold", "");
            },
            onRelease() {
              strip.removeAttribute("data-strip-hold");
              gsap.to(card, { x: 0, y: 0, ...RETURN, onComplete: () => gsap.set(card, { clearProps: "zIndex" }) });
            },
          }),
        );
      });

      return () => {
        cancelled = true;
        draggables.forEach((draggable) => draggable.kill());
        strip.removeAttribute("data-strip-hold");
        gsap.set(cards, { clearProps: "transform,zIndex" });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
