"use client";

import { useEffect, useState } from "react";

/**
 * Id of the section that currently crosses the middle of the viewport.
 * Drives the gold dot in the navigation and lets the language toggle keep the visitor's place.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // A 1 % tall band in the middle of the viewport: whichever section overlaps it is "active".
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-49% 0px -50% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
