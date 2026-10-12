"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/content/types";
import { NAV_ITEMS, NAV_ITEM_FOR_SECTION, SECTION_IDS, type NavItem } from "@/lib/sections";
import { useActiveSection } from "@/lib/useActiveSection";
import { Logo } from "@/components/ui/Logo";
import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  locale: Locale;
  projectCount: number;
  labels: Record<NavItem, string> & {
    cta: string;
    mainNav: string;
    language: string;
    home: string;
    themeToLight: string;
    themeToDark: string;
  };
};

/**
 * Fixed header (griflan.com style): vertical text list on the left, logo in the middle,
 * language + theme + CTA on the right. Below the hero the list steps aside so it never
 * covers content (the "MENU ::" overlay replaces it in the layout phase).
 */
export function Nav({ locale, projectCount, labels }: Props) {
  const active = useActiveSection(SECTION_IDS);
  const activeItem = active ? NAV_ITEM_FOR_SECTION[active as keyof typeof NAV_ITEM_FOR_SECTION] : null;
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="relative flex items-start justify-between px-gutter pt-4 md:pt-5">
        <nav
          aria-label={labels.mainNav}
          className={`hidden transition-opacity duration-500 md:block ${
            pastHero ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          }`}
        >
          <ul className="space-y-0.5 text-[0.95rem] leading-snug">
            {NAV_ITEMS.map((item) => {
              const isActive = item === activeItem;
              return (
                <li key={item}>
                  <a
                    href={`#${item}`}
                    aria-current={isActive ? "location" : undefined}
                    tabIndex={pastHero ? -1 : undefined}
                    className="group flex items-center gap-2 py-0.5 transition-colors duration-300 hover:text-gold-text"
                  >
                    <span
                      className={`size-1.5 rounded-full bg-gold transition-transform duration-500 ${
                        isActive ? "scale-100" : "scale-0"
                      }`}
                      aria-hidden="true"
                    />
                    <span className={isActive ? "text-gold-text" : undefined}>{labels[item]}</span>
                    {item === "projects" && (
                      <span className="font-mono text-xs text-fg-muted">({projectCount})</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <a
          href="#top"
          aria-label={labels.home}
          className="pointer-events-auto text-fg transition-colors duration-300 hover:text-gold-text md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          <Logo />
        </a>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <LangToggle locale={locale} label={labels.language} activeSection={active} />
          <ThemeToggle toLight={labels.themeToLight} toDark={labels.themeToDark} />
          <a href="#contact" className="pill pill-red hidden sm:inline-flex">
            {labels.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
