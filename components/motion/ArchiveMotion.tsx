"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK } from "@/lib/motion";

/** Rows open only once the pointer rests on them – sweeping across the list opens nothing. */
const HOVER_INTENT_MS = 90;

/**
 * Archive rows (<details>):
 * - open and close with an animated height instead of the native jump (click, Enter, Space);
 * - with a mouse they also expand while hovered and collapse when the pointer leaves, unless the
 *   row was opened by a click – then it stays open until clicked again;
 * - keep `data-expanded` on the <details> at the state the row is heading to: the "+" turns into a
 *   "×" by it (globals.css) and back as soon as the pointer leaves, not only once the row collapsed.
 * The red fill and text colours are CSS (globals.css, ProjectArchive). Reduced motion keeps the
 * native, instant <details>.
 */
export function ArchiveMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const list = marker.current?.parentElement?.querySelector("ol");
    if (!list) return;

    const mm = gsap.matchMedia();
    mm.add({ motion: MOTION_OK, hover: `${MOTION_OK} and ${FINE_POINTER}` }, (context) => {
      const { motion, hover } = context.conditions as { motion: boolean; hover: boolean };
      if (!motion) return;

      const cleanups = Array.from(list.querySelectorAll<HTMLDetailsElement>("details[data-archive-row]"), (details) => {
        const row = details.parentElement!;
        const summary = details.querySelector("summary")!;
        const body = details.querySelector<HTMLElement>("[data-archive-body]")!;
        let wanted = details.open; // the state the row is animating towards
        let pinned = details.open; // opened by a click – leaving with the pointer does not close it
        let hoverBlocked = false; // closed by a click while hovered – no reopening until the pointer leaves
        let intent = 0;
        details.dataset.expanded = String(wanted);

        const setOpen = (open: boolean) => {
          if (open === wanted) return;
          wanted = open;
          details.dataset.expanded = String(open);
          gsap.killTweensOf(body);
          if (open) {
            const from = details.open ? body.offsetHeight : 0;
            details.open = true;
            gsap.fromTo(body, { height: from }, { height: "auto", duration: 0.6, ease: EASE.inOut, clearProps: "height" });
            return;
          }
          gsap.fromTo(
            body,
            { height: body.offsetHeight },
            {
              height: 0,
              duration: 0.45,
              ease: EASE.inOut,
              onComplete: () => {
                details.open = false;
                gsap.set(body, { clearProps: "height" });
              },
            },
          );
        };

        const onClick = (event: MouseEvent) => {
          event.preventDefault();
          pinned = !wanted;
          hoverBlocked = wanted;
          setOpen(!wanted);
        };
        // Opened by the browser itself (find in page) – treat it like a click.
        const onToggle = () => {
          if (details.open && !wanted) {
            wanted = pinned = true;
            details.dataset.expanded = "true";
          }
        };
        const onEnter = (event: PointerEvent) => {
          if (!hover || event.pointerType === "touch") return;
          window.clearTimeout(intent);
          intent = window.setTimeout(() => !hoverBlocked && setOpen(true), HOVER_INTENT_MS);
        };
        const onLeave = () => {
          window.clearTimeout(intent);
          hoverBlocked = false;
          if (hover && !pinned) setOpen(false);
        };

        summary.addEventListener("click", onClick);
        details.addEventListener("toggle", onToggle);
        row.addEventListener("pointerenter", onEnter);
        row.addEventListener("pointerleave", onLeave);

        return () => {
          window.clearTimeout(intent);
          summary.removeEventListener("click", onClick);
          details.removeEventListener("toggle", onToggle);
          row.removeEventListener("pointerenter", onEnter);
          row.removeEventListener("pointerleave", onLeave);
          gsap.killTweensOf(body);
          gsap.set(body, { clearProps: "height" });
          details.open = wanted;
          delete details.dataset.expanded;
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
