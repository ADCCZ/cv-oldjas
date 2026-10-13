import type { Locale, Text } from "@/content/types";
import { prose } from "@/lib/typography";

/** English is the main language (served on `/`), Czech lives on `/cs`. */
export const locales = ["en", "cs"] as const satisfies readonly Locale[];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Resolves config text that is either shared by both languages or translated, typeset (lib/typography). */
export function tx(text: Text, locale: Locale): string {
  return prose(typeof text === "string" ? text : text[locale], locale);
}

/** Public path of the home page in the given language. */
export function localePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

/** "20 h/week · Pilsen or remote" */
export function availabilityLine(hours: number, unit: string, location: string): string {
  return `${hours} ${unit} · ${location}`;
}

/** Zero-padded index used for section and item numbers: 1 → "01". */
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
