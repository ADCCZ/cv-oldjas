"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

/** How far from a button's edge the pull starts (px). */
const RADIUS = 80;
/** Strongest pull of the button itself (px). The label moves half as much again (CSS). */
const MAX_PULL = 12;

type Magnet = { el: HTMLElement; offset: { x: number; y: number }; active: boolean };

function render(magnet: Magnet) {
  magnet.el.style.setProperty("--mag-x", `${magnet.offset.x}px`);
  magnet.el.style.setProperty("--mag-y", `${magnet.offset.y}px`);
}

/**
 * Magnetic buttons: every `.btn` leans towards the pointer once it is within RADIUS of its edge
 * (max MAX_PULL px), its label and icon a half more (parallax), and springs back with
 * elastic.out when the pointer leaves.
 *
 * The pull is written to CSS variables read by `translate` (globals.css), so it never fights the
 * GSAP transforms of the hero intro or the rolling label (which moves the inner spans).
 * Fine pointers and full motion only; one ticker pass per frame however fast the mouse moves.
 */
export function MagneticButtons() {
  const enabled = useMediaQuery(`${FINE_POINTER} and ${MOTION_OK}`);

  useEffect(() => {
    if (!enabled) return;

    // Buttons are looked up on every pass – some appear only after hydration (the stack Sort button).
    const magnets = new Map<HTMLElement, Magnet>();
    const magnetFor = (el: HTMLElement) => {
      let magnet = magnets.get(el);
      if (!magnet) magnets.set(el, (magnet = { el, offset: { x: 0, y: 0 }, active: false }));
      return magnet;
    };
    const pointer = { x: -1e4, y: -1e4 };
    let dirty = false;

    const release = (magnet: Magnet) => {
      if (!magnet.active) return;
      magnet.active = false;
      gsap.to(magnet.offset, {
        x: 0,
        y: 0,
        duration: 1.1,
        ease: "elastic.out(1, 0.35)",
        overwrite: true,
        onUpdate: () => render(magnet),
      });
    };

    const update = () => {
      for (const el of document.querySelectorAll<HTMLElement>(".btn")) {
        const magnet = magnetFor(el);
        const rect = el.getBoundingClientRect();
        // The rect already contains the current pull – measure from the resting position.
        const cx = rect.left + rect.width / 2 - magnet.offset.x;
        const cy = rect.top + rect.height / 2 - magnet.offset.y;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        // Distance from the button's edge (0 inside it).
        const edge = Math.hypot(Math.max(Math.abs(dx) - rect.width / 2, 0), Math.max(Math.abs(dy) - rect.height / 2, 0));

        const usable =
          edge < RADIUS && rect.width > 0 && (el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true);
        if (!usable) {
          release(magnet);
          continue;
        }

        const t = 1 - edge / RADIUS;
        const strength = t * t * (3 - 2 * t); // smoothstep – no hard edge at the radius
        const distance = Math.hypot(dx, dy) || 1;
        const pull = Math.min(distance * 0.3, MAX_PULL) * strength;
        magnet.active = true;
        gsap.to(magnet.offset, {
          x: (dx / distance) * pull,
          y: (dy / distance) * pull,
          duration: 0.45,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => render(magnet),
        });
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      dirty = true;
    };
    // The page can move under a resting pointer as well.
    const onScroll = () => (dirty = true);
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.x = pointer.y = -1e4;
      dirty = true;
    };
    const tick = () => {
      if (!dirty) return;
      dirty = false;
      update();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerout", onLeave);
      gsap.ticker.remove(tick);
      for (const magnet of magnets.values()) {
        gsap.killTweensOf(magnet.offset);
        magnet.el.style.removeProperty("--mag-x");
        magnet.el.style.removeProperty("--mag-y");
      }
    };
  }, [enabled]);

  return null;
}
