"use client";

import { useEffect, useRef } from "react";
import { splitIcon } from "@/components/ui/ButtonContent";
import { gsap } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Props = {
  /** "View project ↗" – shown over clickable project covers. */
  viewLabel: string;
  /** "Drag ↔" – shown over draggable strips and tiles. */
  dragLabel: string;
};

type CursorState = "default" | "link" | "button" | "view" | "drag";

/** Anything the pointer can act on. The nearest match decides the state. */
const INTERACTIVE = "[data-cursor], a[href], button, summary, label, [role='button']";

/**
 * Per-frame follow factors at 60 fps (converted for other refresh rates in the loop).
 * The dot is the pointer itself, the ring trails it, the label trails a bit more (juncastudio: 0.18).
 */
const RING_LERP = 0.22;
const LABEL_LERP = 0.18;

function resolveState(target: Element | null): { state: CursorState; red: boolean } {
  const el = target?.closest(INTERACTIVE);
  const declared = el?.getAttribute("data-cursor");
  const state: CursorState =
    declared === "view" || declared === "drag" ? declared : el?.classList.contains("btn") ? "button" : el ? "link" : "default";
  return { state, red: !!target?.closest('[data-surface="red"]') };
}

/**
 * Custom cursor: a gold dot that is the pointer itself and a ring that trails it with a lerp.
 *
 * - Links: the ring grows. Buttons: the ring steps back (the button itself is magnetic).
 * - Project covers: a red "View project ↗" block follows the pointer (juncastudio.com).
 * - Draggable strips and tiles: "Drag ↔".
 * - The ring uses mix-blend-mode: difference, so it stays visible on dark, light and images.
 *   Over red surfaces difference would turn it cyan – there ([data-surface="red"]) it is plain cream.
 *
 * Only with a fine pointer and full motion; touch devices and reduced motion keep the system cursor.
 * Elements are positioned by transforms in a GSAP ticker; states are CSS (globals.css, "Cursor").
 */
export function Cursor({ viewLabel, dragLabel }: Props) {
  const enabled = useMediaQuery(`${FINE_POINTER} and ${MOTION_OK}`);
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!enabled || !root || !ring || !dot || !label) return;

    const html = document.documentElement;
    const pointer = { x: 0, y: 0 };
    const ringPos = { x: 0, y: 0 };
    const labelPos = { x: 0, y: 0 };
    let seen = false;
    let state: CursorState = "default";
    let lastScroll = window.scrollY;
    let frame = 0;
    let moved = false;

    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const setVisible = (visible: boolean) => {
      root.dataset.visible = String(visible);
      html.classList.toggle("has-cursor", visible);
    };

    const apply = (target: Element | null) => {
      const next = resolveState(target);
      // The label appears where the pointer is instead of flying in from where it was hidden.
      const labelShown = (s: CursorState) => s === "view" || s === "drag";
      if (labelShown(next.state) && !labelShown(state)) {
        labelPos.x = pointer.x;
        labelPos.y = pointer.y;
        moved = true; // write the new position even if the pointer itself rests
      }
      state = next.state;
      const surface = next.red ? "red" : "base";
      // Written only on change – the hit test also runs on resting frames.
      if (root.dataset.state !== next.state) root.dataset.state = next.state;
      if (root.dataset.surface !== surface) root.dataset.surface = surface;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        setVisible(false);
        return;
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      moved = true;
      if (!seen) {
        // First move: start everything at the pointer, nothing slides in from the corner.
        seen = true;
        ringPos.x = labelPos.x = pointer.x;
        ringPos.y = labelPos.y = pointer.y;
        apply(event.target as Element);
      }
      if (root.dataset.visible !== "true") setVisible(true);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "touch") apply(event.target as Element);
    };
    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) setVisible(false); // the pointer left the window
    };
    const onDown = () => (root.dataset.pressed = "true");
    const onUp = () => (root.dataset.pressed = "false");
    const onBlur = () => setVisible(false);

    const tick = (_time: number, deltaMs: number) => {
      if (!seen) return;
      // Nothing left to catch up with – no style writes while the mouse rests.
      const settled =
        Math.abs(pointer.x - ringPos.x) + Math.abs(pointer.y - ringPos.y) + Math.abs(pointer.x - labelPos.x) + Math.abs(pointer.y - labelPos.y) <
        0.1;
      if (!settled || moved) {
        const steps = Math.min(deltaMs, 64) / (1000 / 60);
        const follow = (base: number) => 1 - Math.pow(1 - base, steps);
        ringPos.x += (pointer.x - ringPos.x) * follow(RING_LERP);
        ringPos.y += (pointer.y - ringPos.y) * follow(RING_LERP);
        labelPos.x += (pointer.x - labelPos.x) * follow(LABEL_LERP);
        labelPos.y += (pointer.y - labelPos.y) * follow(LABEL_LERP);
        place(dot, pointer.x, pointer.y);
        place(ring, ringPos.x, ringPos.y);
        place(label, labelPos.x, labelPos.y);
        moved = false;
      }

      // The page moves under a resting pointer (smooth scroll, the pinned projects strip, drifting
      // strips) – re-test what is under it, browsers only fire pointerover on real movement.
      frame += 1;
      if (window.scrollY !== lastScroll || frame % 12 === 0) {
        lastScroll = window.scrollY;
        apply(document.elementFromPoint(pointer.x, pointer.y));
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onBlur);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
      gsap.ticker.remove(tick);
      html.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const view = splitIcon(viewLabel);
  const drag = splitIcon(dragLabel);

  return (
    // No position or z-index here: the ring must blend with the page, not inside its own layer.
    <div ref={rootRef} className="cursor" data-state="default" data-visible="false" data-surface="base" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring">
        <span />
      </div>
      <div ref={dotRef} className="cursor-dot">
        <span />
      </div>
      <div ref={labelRef} className="cursor-label">
        {[
          { id: "view", ...view },
          { id: "drag", ...drag },
        ].map((item) => (
          <span key={item.id} data-label={item.id}>
            <span className="btn-face">{item.text}</span>
            {item.icon ? <span className="btn-icon">{item.icon}</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
