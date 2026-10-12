"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToId, startLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Moves keyboard / screen-reader focus to the target of an in-page jump. */
function focusTarget(id: string) {
  const el = id === "top" ? document.getElementById("main") : document.getElementById(id);
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}

/**
 * Smooth scrolling + in-page navigation.
 *
 * - Starts Lenis (unless the visitor prefers reduced motion).
 * - Every `<a href="#id">` on the page scrolls through Lenis and updates the URL hash.
 * - A deep link (`/#projects`, old `/#education`) is resolved only after fonts are loaded and
 *   ScrollTrigger has measured the final layout – pinned sections change page height, so a
 *   native jump on load would land in the wrong place.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const stopLenis = reducedMotion ? () => {} : startLenis();

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const id = decodeURIComponent(anchor.hash.slice(1));
      if (!id || !scrollToId(id)) return;

      event.preventDefault();
      history.pushState(null, "", id === "top" ? location.pathname : `#${id}`);
      focusTarget(id);
    };

    const onPopState = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      scrollToId(id || "top");
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      const id = decodeURIComponent(location.hash.slice(1));
      if (id) scrollToId(id, { immediate: true });
    });

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
      stopLenis();
    };
  }, [reducedMotion]);

  return children;
}
