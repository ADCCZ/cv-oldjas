"use client";

import { useRef } from "react";
import { gsap, loadDraggable, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK, STRIP_MOVE_EVENT } from "@/lib/motion";

type Props = {
  /** Drift speed of the content to the left, px/s. */
  speed?: number;
};

/** While the pointer rests on the strip it slows down, so a card or number can be read. */
const HOVER_SLOWDOWN = 0.35;
/** How quickly a throw (or a stop) blends back into the drift – higher = sooner, 1/s. */
const BLEND = 2.2;
/** After a native scroll (touch, trackpad, keyboard) the drift waits this long before it resumes. */
const NATIVE_PAUSE_MS = 900;

/**
 * Drifting strip (griflan.com): a native horizontal scroller that moves by itself, can be grabbed
 * and thrown with the mouse, and loops forever.
 *
 * Markup contract: `[data-strip]` is the overflow-x scroller, inside it three identical
 * `[data-strip-copy]` blocks – clone, original, clone (the clones are aria-hidden). The position
 * always stays inside the middle copy; when it drifts half a copy away it jumps by exactly one copy
 * width, which looks identical, so the loop never ends.
 *
 * - Drift: scrollLeft advances at `speed` px/s (slower while hovered).
 * - Mouse: Draggable on a detached proxy turns pointer movement into scroll movement; on release
 *   the throw velocity (InertiaPlugin's tracker) decays smoothly back into the drift.
 * - Touch, trackpad, keyboard: the browser scrolls natively; the drift pauses and then resumes.
 * - `[data-toss]` cards (CardToss) are picked up on their own: the strip drag skips them, and while
 *   one is held (`data-strip-hold` on the strip) the strip stands still.
 * Every frame the content movement is announced with STRIP_MOVE_EVENT (the stickers ride on it).
 * Reduced motion: none of this – the clones are hidden by CSS and the strip is a plain scroller.
 */
export function DriftStrip({ speed = 30 }: Props) {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const strip = marker.current?.parentElement?.querySelector<HTMLElement>("[data-strip]");
    const copies = strip?.querySelectorAll<HTMLElement>("[data-strip-copy]");
    if (!strip || !copies || copies.length < 3) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      let copyWidth = 0;
      let pos = 0; // wanted scrollLeft, fractional
      let pending = 0; // content movement since the last frame
      let written = 0; // scrollLeft we set ourselves – anything else is a native scroll
      let velocity = 0; // px/s, blends towards the drift speed
      let mode: "drift" | "drag" | "native" = "drift";
      let nativeUntil = 0;
      let touching = false;
      let hovered = false;
      let visible = false;
      let draggable: Draggable | null = null;
      let cancelled = false;

      const measure = () => {
        const previous = copyWidth;
        copyWidth = copies[1]!.getBoundingClientRect().left - copies[0]!.getBoundingClientRect().left;
        pos = previous > 0 ? (pos / previous) * copyWidth : copyWidth; // start at the original
        strip.scrollLeft = written = pos;
      };
      measure();

      const moveBy = (delta: number) => {
        pos += delta;
        pending += delta;
      };

      const tick = (_time: number, deltaMs: number) => {
        if (!visible || copyWidth <= 0) return;
        const dt = Math.min(deltaMs, 64) / 1000;

        if (mode === "native") {
          moveBy(strip.scrollLeft - pos);
          if (!touching && performance.now() > nativeUntil) {
            mode = "drift";
            velocity = 0;
          }
        } else if (strip.hasAttribute("data-strip-hold")) {
          velocity = 0; // a card is held – it must stay under the pointer
        } else if (mode === "drift") {
          const target = speed * (hovered ? HOVER_SLOWDOWN : 1);
          velocity += (target - velocity) * (1 - Math.exp(-dt * BLEND));
          moveBy(velocity * dt);
        }

        // Stay inside the middle copy. The jump is not movement – the copies look the same.
        if (pos < copyWidth * 0.5) pos += copyWidth;
        else if (pos >= copyWidth * 1.5) pos -= copyWidth;

        if (Math.abs(strip.scrollLeft - pos) >= 0.5) {
          strip.scrollLeft = pos;
          written = strip.scrollLeft;
        }
        if (pending !== 0) {
          strip.dispatchEvent(new CustomEvent(STRIP_MOVE_EVENT, { detail: -pending }));
          pending = 0;
        }
      };

      const onScroll = () => {
        if (mode === "drag") return;
        if (mode === "native" || Math.abs(strip.scrollLeft - written) > 2) {
          mode = "native";
          nativeUntil = performance.now() + NATIVE_PAUSE_MS;
        }
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType !== "touch") return;
        touching = true;
        mode = "native";
      };
      const onTouchEnd = (event: PointerEvent) => {
        if (event.pointerType !== "touch") return;
        touching = false;
        nativeUntil = performance.now() + NATIVE_PAUSE_MS;
      };
      const onEnter = (event: PointerEvent) => event.pointerType === "mouse" && (hovered = true);
      const onLeave = () => (hovered = false);

      const observer = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting), { rootMargin: "100px 0px" });
      observer.observe(strip);
      // A copy, not the scroller: its width changes when fonts load or the viewport resizes.
      const resize = new ResizeObserver(() => measure());
      resize.observe(copies[1]!);

      strip.addEventListener("scroll", onScroll, { passive: true });
      strip.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointerup", onTouchEnd, { passive: true });
      window.addEventListener("pointercancel", onTouchEnd, { passive: true });
      strip.addEventListener("pointerenter", onEnter);
      strip.addEventListener("pointerleave", onLeave);
      gsap.ticker.add(tick);

      // Mouse dragging. Touch devices scroll natively, so Draggable is only loaded for fine pointers.
      if (window.matchMedia(FINE_POINTER).matches) {
        void loadDraggable().then(({ Draggable, InertiaPlugin }) => {
          if (cancelled) return;
          const proxy = document.createElement("div");
          let lastX = 0;
          const follow = function (this: Draggable) {
            moveBy(lastX - this.x); // pointer to the right = content to the right = scrollLeft down
            lastX = this.x;
          };
          draggable = Draggable.create(proxy, {
            type: "x",
            trigger: strip,
            // Links keep their native click (and Ctrl+click), tossable cards their own drag; a drag of
            // the strip starts anywhere else on it.
            dragClickables: false,
            clickableTest: (el: Element) => !!el.closest?.("a, button, input, select, textarea, label, [data-toss]"),
            minimumMovement: 4,
            onPress() {
              lastX = this.x;
              mode = "drag";
            },
            onDrag: follow,
            onRelease() {
              // Hand the throw over to the drift – it decays into the drift speed instead of stopping.
              velocity = gsap.utils.clamp(-3000, 3000, -InertiaPlugin.getVelocity(proxy, "x"));
              mode = "drift";
            },
          })[0]!;
        });
      }

      return () => {
        cancelled = true;
        draggable?.kill();
        gsap.ticker.remove(tick);
        observer.disconnect();
        resize.disconnect();
        strip.removeEventListener("scroll", onScroll);
        strip.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onTouchEnd);
        window.removeEventListener("pointercancel", onTouchEnd);
        strip.removeEventListener("pointerenter", onEnter);
        strip.removeEventListener("pointerleave", onLeave);
        strip.scrollLeft = 0;
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
