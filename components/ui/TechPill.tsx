"use client";

import { useEffect, useRef, useState } from "react";
import type { Level } from "@/content/stack.config";

type Props = {
  /** Stable id from stack.config.ts – used for aria-controls. */
  id: string;
  name: string;
  level?: Level;
  planned?: boolean;
  /** simple-icons path (24 × 24). */
  iconPath?: string;
  /** "3/5 – independently on projects" or "planned". */
  levelText: string;
  usedInLabel: string;
  usedIn: { id: string; title: string }[];
};

const PANEL_WIDTH = 256;

/** Five tile sizes – the size of a tile says how well I know the technology. */
const SIZE: Record<Level, string> = {
  1: "gap-1.5 px-3 py-1.5 text-xs",
  2: "gap-2 px-3.5 py-2 text-sm",
  3: "gap-2 px-4 py-2.5 text-base",
  4: "gap-2.5 px-5 py-3 text-lg",
  5: "gap-3 px-6 py-3.5 text-xl",
};

/**
 * Technology tile with a small disclosure panel (level in words + projects where it was used).
 * Hover shows the panel on desktop; click / tap / Enter toggles it, Esc or a click outside closes it.
 * The physics pile (StackPhysics) moves these same elements: the <li> is translated, the button
 * rotated, so the panel next to it never turns upside down.
 */
export function TechPill({ id, name, level, planned = false, iconPath, levelText, usedInLabel, usedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const panelId = `tech-${id}-panel`;
  const rootRef = useRef<HTMLLIElement>(null);

  // The panel opens to the right of the tile; tiles near the right edge open it to the left instead.
  const placePanel = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left + PANEL_WIDTH > document.documentElement.clientWidth - 16);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const tone = planned
    ? "border-dashed border-line-strong text-fg-muted"
    : level === 4 || level === 5
      ? "border-gold bg-surface"
      : "border-line-strong bg-surface";

  return (
    <li
      ref={rootRef}
      data-tile
      data-level={planned ? 0 : (level ?? 0)}
      data-open={open}
      className="group relative"
      onPointerEnter={placePanel}
      onFocus={placePanel}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          placePanel();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center border leading-none font-medium whitespace-nowrap transition-colors duration-300 hover:border-fg ${SIZE[level ?? 2]} ${tone}`}
      >
        {iconPath ? (
          <svg viewBox="0 0 24 24" className="size-[1em] shrink-0" fill="currentColor" aria-hidden="true" focusable="false">
            <path d={iconPath} />
          </svg>
        ) : null}
        {name}
      </button>

      <div
        id={panelId}
        data-tech-panel
        // Closed panels are display:none – a hidden-but-laid-out panel would widen the page on phones.
        className={`absolute bottom-full z-20 hidden w-64 max-w-[calc(100vw-2rem)] pb-2 group-data-[open=true]:block [@media(hover:hover)]:group-hover:block ${
          alignRight ? "right-0" : "left-0"
        }`}
      >
        <div className="border border-line-strong bg-bg p-4 text-sm shadow-[0_12px_40px_rgb(0_0_0/0.35)]">
          <p className="eyebrow text-gold-text">{levelText}</p>
          {usedIn.length > 0 ? (
            <p className="mt-2 text-fg-muted">
              {usedInLabel}:{" "}
              {usedIn.map((project, i) => (
                <span key={project.id}>
                  {i > 0 ? ", " : null}
                  <a href={`#project-${project.id}`} className="link-draw text-fg" onClick={() => setOpen(false)}>
                    {project.title}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
