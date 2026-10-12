"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonContent } from "@/components/ui/ButtonContent";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/content/types";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { NAV_ITEMS, NAV_ITEM_FOR_SECTION, SECTION_IDS, type NavItem, type SectionId } from "@/lib/sections";
import { useActiveSection } from "@/lib/useActiveSection";
import { LangToggle } from "./LangToggle";
import { MenuOverlay } from "./MenuOverlay";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  locale: Locale;
  projectCount: number;
  cvHref: string;
  labels: Record<NavItem, string> & {
    cta: string;
    menu: string;
    close: string;
    downloadCv: string;
    mainNav: string;
    siteMenu: string;
    language: string;
    home: string;
    themeToLight: string;
    themeToDark: string;
  };
};

/** Everything except the header becomes inert while the menu is open. */
function setPageInert(inert: boolean) {
  for (const el of document.querySelectorAll<HTMLElement>("body > main, body > footer")) el.inert = inert;
}

/**
 * Fixed header (griflan.com style).
 * Top of the page: vertical section list on the left, logo in the middle, language + theme + CTA
 * on the right. Past the hero the list folds away line by line into a "MENU ::" button and the
 * header gets a solid bar, so it never sits on top of content. The language switch always stays.
 */
export function Nav({ locale, projectCount, cvHref, labels }: Props) {
  const active = useActiveSection(SECTION_IDS);
  const activeItem = active ? NAV_ITEM_FOR_SECTION[active as SectionId] : null;
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    // Desktop folds the list once most of the hero is gone; phones only need the bar.
    const update = () => setCompact(window.scrollY > (desktop.matches ? window.innerHeight * 0.6 : 24));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    lockScroll();
    setPageInert(true);
    setMenuOpen(true);
  };

  // Synchronous on purpose: a menu link must unlock the page before its jump starts.
  const closeMenu = useCallback(({ restoreFocus }: { restoreFocus: boolean }) => {
    unlockScroll();
    setPageInert(false);
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  // Safety net: never leave the page locked if the header unmounts with the menu open.
  useEffect(
    () => () => {
      unlockScroll();
      setPageInert(false);
    },
    [],
  );

  const menuButton = (className: string, hidden = false) => (
    <button
      type="button"
      onClick={openMenu}
      aria-expanded={menuOpen}
      aria-controls="site-menu"
      inert={hidden}
      className={`btn btn-outline btn-sm transition-opacity duration-500 ${className}`}
    >
      <ButtonContent label={labels.menu} icon="::" />
    </button>
  );

  return (
    <header data-compact={compact} className="group/header pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Solid bar behind the compact header. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-(--header-h) border-b border-line bg-bg opacity-0 transition-opacity duration-500 group-data-[compact=true]/header:pointer-events-auto group-data-[compact=true]/header:opacity-100"
      />

      <div className="relative flex h-(--header-h) items-center justify-between px-gutter">
        <div className="flex items-center">
          {/* Desktop: the vertical list at the top of the page … */}
          <nav aria-label={labels.mainNav} inert={compact} className="absolute top-3.5 left-(--gutter) hidden md:block">
            <ul className="text-[0.95rem] leading-snug">
              {NAV_ITEMS.map((item, i) => {
                const isActive = item === activeItem;
                // Stagger: fold top-down, unfold bottom-up.
                const delay = compact ? i * 45 : (NAV_ITEMS.length - 1 - i) * 45;
                return (
                  <li
                    key={item}
                    className={`transition-[opacity,translate] duration-500 ease-brand ${
                      compact ? "-translate-y-2 opacity-0" : "pointer-events-auto translate-y-0 opacity-100"
                    }`}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    <a
                      href={`#${item}`}
                      aria-current={isActive ? "location" : undefined}
                      className="flex items-center gap-2 py-0.5 transition-colors duration-300 hover:text-gold-text"
                    >
                      <span
                        className={`size-1.5 rounded-full bg-gold transition-transform duration-500 ${isActive ? "scale-100" : "scale-0"}`}
                        aria-hidden="true"
                      />
                      <span className={isActive ? "text-gold-text" : undefined}>{labels[item]}</span>
                      {item === "projects" ? <span className="font-label text-xs text-fg-muted">({projectCount})</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* … folds into MENU :: once the hero is gone. */}
          {menuButton(`hidden md:inline-flex ${compact ? "pointer-events-auto opacity-100" : "opacity-0"}`, !compact)}

          <a href="#top" aria-label={labels.home} className="pointer-events-auto text-fg transition-colors duration-300 hover:text-gold-text md:hidden">
            <Logo />
          </a>
        </div>

        <a
          href="#top"
          aria-label={labels.home}
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 text-fg transition-colors duration-300 hover:text-gold-text md:block"
        >
          <Logo />
        </a>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <LangToggle locale={locale} label={labels.language} activeSection={active} />
          <ThemeToggle toLight={labels.themeToLight} toDark={labels.themeToDark} />
          <a href="#contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
            <ButtonContent label={labels.cta} icon={null} />
          </a>
          {menuButton("inline-flex md:hidden")}
        </div>
      </div>

      <MenuOverlay
        open={menuOpen}
        onClose={closeMenu}
        locale={locale}
        activeItem={activeItem}
        activeSection={active}
        projectCount={projectCount}
        cvHref={cvHref}
        labels={labels}
      />
    </header>
  );
}
