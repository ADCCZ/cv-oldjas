"use client";

import { useEffect, useRef } from "react";
import { ButtonContent } from "@/components/ui/ButtonContent";
import { TrackedLink } from "@/components/ui/TrackedLink";
import type { Locale } from "@/content/types";
import { pad } from "@/lib/i18n";
import { NAV_ITEMS, type NavItem } from "@/lib/sections";
import { LangToggle } from "./LangToggle";

type Props = {
  open: boolean;
  /** restoreFocus: false when a menu link was used – focus then moves to the target section. */
  onClose: (options: { restoreFocus: boolean }) => void;
  locale: Locale;
  activeItem: NavItem | null;
  activeSection: string | null;
  projectCount: number;
  cvHref: string;
  labels: Record<NavItem, string> & {
    close: string;
    downloadCv: string;
    siteMenu: string;
    language: string;
  };
};

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Fullscreen menu (noth.in style): the red sheet wipes down from the top, then the giant links
 * are revealed line by line with a clip-path. Modal dialog – Esc closes it and Tab stays inside.
 */
export function MenuOverlay({ open, onClose, locale, activeItem, activeSection, projectCount, cvHref, labels }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog once it opens.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("nav a")?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose({ restoreFocus: true });
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    // Focus trap: wrap around at both ends.
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      id="site-menu"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={labels.siteMenu}
      data-open={open}
      onKeyDown={onKeyDown}
      className="menu-overlay pointer-events-auto fixed inset-0 z-[60] flex flex-col bg-red-950 text-cream"
    >
      <div className="flex h-(--header-h) shrink-0 items-center justify-between px-gutter">
        <button
          type="button"
          onClick={() => onClose({ restoreFocus: true })}
          className="btn btn-on-red btn-sm"
        >
          <ButtonContent label={labels.close} icon="✕" />
        </button>
        <LangToggle locale={locale} label={labels.language} activeSection={activeSection} tone="onRed" />
      </div>

      <nav aria-label={labels.siteMenu} className="flex flex-1 flex-col justify-center overflow-y-auto px-gutter py-6">
        <ol>
          {NAV_ITEMS.map((item, i) => (
            <li key={item} className="border-t border-cream/15 last:border-b">
              <a
                href={`#${item}`}
                onClick={() => onClose({ restoreFocus: false })}
                aria-current={item === activeItem ? "location" : undefined}
                className="menu-line group flex items-center gap-4 py-1 md:gap-8 md:py-2"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="w-8 font-label text-sm text-gold-soft" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="text-[clamp(2.75rem,8.5vw,8.5rem)] leading-[1.02] font-bold tracking-display transition-colors duration-300 group-hover:text-gold-soft">
                  {labels[item]}
                </span>
                {item === "projects" ? (
                  <span className="self-start pt-[0.8em] font-label text-sm text-cream/70">({projectCount})</span>
                ) : null}
                {item === activeItem ? <span className="ml-auto size-2.5 rounded-full bg-gold" aria-hidden="true" /> : null}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="eyebrow flex shrink-0 items-center justify-between gap-4 border-t border-cream/15 px-gutter py-5">
        <TrackedLink href={cvHref} download event="cv_download" data={{ lang: locale, version: "design" }} className="link-draw">
          {labels.downloadCv} ↓
        </TrackedLink>
        <span className="text-cream/60">OJŠ</span>
      </div>
    </div>
  );
}
