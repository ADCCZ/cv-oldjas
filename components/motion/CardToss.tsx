"use client";

import { useRef } from "react";
import { gsap, loadDraggable, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK } from "@/lib/motion";

/** Spring back into the slot – a card let go wobbles home instead of stopping dead. */
const RETURN = { duration: 1.1, ease: "elastic.out(1, 0.55)" };
/** The held card floats over the page, under the header (z-50). */
const LIFT_Z = 45;

/**
 * Cards of a drifting strip (Beyond code) can be picked up on their own with the mouse and carried
 * anywhere on the screen. The strip is a horizontal scroller, so it clips everything vertically too –
 * a card cannot leave it. Picking one up therefore lays an exact copy over the page (fixed, same size,
 * tilt and colours) and hides the original, which keeps its slot; the copy follows the pointer and,
 * when let go, springs back onto the slot, then the original shows again. The loop of copies
 * (DriftStrip) is never touched. While a card is held the strip stands still (`data-strip-hold`); the
 * strip itself is grabbed by the gaps between the cards. Links on a card keep their click.
 * Mouse and full motion only – touch keeps the native swipe of the strip.
 */
export function CardToss() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const strip = marker.current?.parentElement?.querySelector<HTMLElement>("[data-strip]");
    if (!strip) return;

    const mm = gsap.matchMedia();
    mm.add(`${FINE_POINTER} and ${MOTION_OK}`, () => {
      let cancelled = false;
      let active: { card: HTMLElement; ghost: HTMLElement; drag: Draggable } | null = null;
      let DraggableClass: typeof Draggable | null = null;
      void loadDraggable().then(({ Draggable }) => {
        if (!cancelled) DraggableClass = Draggable;
      });

      const centre = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      };

      const finish = () => {
        if (!active) return;
        active.drag.kill();
        active.ghost.remove();
        active.card.style.visibility = "";
        active = null;
        strip.removeAttribute("data-strip-hold");
      };

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || event.button !== 0 || !DraggableClass || active) return;
        const target = event.target as Element;
        const card = target.closest<HTMLElement>("[data-toss]");
        if (!card || target.closest("a, button")) return;

        // The copy: same box size, centred where the card is – the CSS tilt turns it around the same centre.
        const { x, y } = centre(card);
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        const ghost = card.cloneNode(true) as HTMLElement;
        ghost.removeAttribute("data-toss");
        ghost.setAttribute("aria-hidden", "true");
        ghost.inert = true;
        Object.assign(ghost.style, {
          position: "fixed",
          left: `${x - w / 2}px`,
          top: `${y - h / 2}px`,
          width: `${w}px`,
          height: `${h}px`,
          margin: "0",
          zIndex: String(LIFT_Z),
        });
        document.body.append(ghost);
        card.style.visibility = "hidden";
        strip.setAttribute("data-strip-hold", "");

        const drag = DraggableClass.create(ghost, {
          type: "x,y",
          zIndexBoost: false,
          onRelease() {
            // Back onto the slot where the card is now (the page may have scrolled meanwhile).
            const from = centre(ghost);
            const to = centre(card);
            gsap.to(ghost, {
              x: `+=${to.x - from.x}`,
              y: `+=${to.y - from.y}`,
              ...RETURN,
              onComplete: finish,
            });
          },
        })[0]!;
        active = { card, ghost, drag };
        gsap.set(ghost, { scale: 1.03 });
        drag.startDrag(event);
      };

      strip.addEventListener("pointerdown", onPointerDown);

      return () => {
        cancelled = true;
        strip.removeEventListener("pointerdown", onPointerDown);
        if (active) gsap.killTweensOf(active.ghost);
        finish();
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
