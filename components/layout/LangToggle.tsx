"use client";

import type { Locale } from "@/content/types";
import { track } from "@/lib/analytics";
import { localePath, locales } from "@/lib/i18n";

type Props = {
  locale: Locale;
  label: string;
  /** Section the visitor is reading – the other language opens at the same place. */
  activeSection: string | null;
  /** "onRed" for the red menu overlay, where theme colours would lose contrast. */
  tone?: "default" | "onRed";
  className?: string;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * EN / CS switch. No automatic redirect by browser language: the visitor chooses, the choice
 * is remembered in the `lang` cookie (next.config.ts sends a returning Czech visitor from `/` to `/cs`).
 */
export function LangToggle({ locale, label, activeSection, tone = "default", className = "" }: Props) {
  const activeColor = tone === "onRed" ? "text-gold-soft" : "text-gold-text";
  const idleColor = tone === "onRed" ? "text-cream/70 hover:text-cream" : "text-fg-muted hover:text-fg";

  const switchTo = (target: Locale) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return; // let "open in new tab" work
    event.preventDefault();
    if (target === locale) return;

    document.cookie = `lang=${target}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    track("lang_switch", { from: locale, to: target });

    const section = activeSection ?? decodeURIComponent(location.hash.slice(1));
    const hash = section && section !== "top" ? `#${section}` : "";
    window.location.assign(localePath(target) + hash);
  };

  return (
    <div role="group" aria-label={label} className={`flex items-center font-mono text-xs ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span className={`px-1 ${tone === "onRed" ? "text-cream/50" : "text-fg-muted"}`} aria-hidden="true">
              /
            </span>
          )}
          <a
            href={localePath(l)}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            onClick={switchTo(l)}
            className={`px-1 py-2 transition-colors duration-300 ${l === locale ? activeColor : idleColor}`}
          >
            {l.toUpperCase()}
          </a>
        </span>
      ))}
    </div>
  );
}
