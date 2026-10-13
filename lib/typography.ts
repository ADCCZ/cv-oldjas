import type { Locale } from "@/content/types";

/** Czech typography: a one-letter preposition or conjunction (v, k, s, z, a, i, o, u) never ends a line. */
export function nbsp(text: string, locale: Locale): string {
  return locale === "cs" ? text.replace(/(?<=^|[\s(„])([AIKOSUVZaikosuvz]) +/g, "$1\u00a0") : text;
}

/** Where widont() glues the last two words: running text only – short labels and titles balance in CSS. */
const WIDONT_MIN_WORDS = 6;
/** Longer tails could overflow a narrow column – they wrap as usual. */
const WIDONT_MAX_TAIL = 20;
/** Compounds kept whole by keepCompounds(). */
const COMPOUND_MAX = 12;

/**
 * The last two words of a sentence share a no-break space, so no line ends up with a lone word
 * (CSS text-wrap: pretty does not do it reliably in Chrome).
 */
export function widont(text: string): string {
  if (text.trim().split(/\s+/).length < WIDONT_MIN_WORDS) return text;
  const at = text.lastIndexOf(" ");
  if (at < 0 || text.length - at > WIDONT_MAX_TAIL) return text;
  return `${text.slice(0, at)}\u00a0${text.slice(at + 1)}`;
}

/** An arrow never starts a line on its own ("Live demo ↗"). */
export function glueArrows(text: string): string {
  return text.replace(/ (?=[→←↑↓↗↙↔])/g, "\u00a0");
}

/**
 * A short hyphenated compound ("self-service", "part-time") never breaks at its hyphen: a word
 * joiner follows it. Longer ones ("special-purpose") may still break there – a narrow column
 * needs it. Web only – in the PDFs the invisible character could trip up keyword search (ATS).
 * Single words are left alone: they are values like "en-GB", not text that wraps.
 */
export function keepCompounds(text: string): string {
  if (!text.includes(" ")) return text;
  return text.replace(/(?<![-\p{L}])(\p{L}+)-(\p{L}+)(?![-\p{L}])/gu, (word, a, b) =>
    word.length <= COMPOUND_MAX ? `${a}-\u2060${b}` : word,
  );
}

type ProseOptions = { compounds?: boolean };

/** Text as the page shows it: Czech no-break spaces, glued arrows and last words. */
export function prose(text: string, locale: Locale, { compounds = false }: ProseOptions = {}): string {
  const glued = glueArrows(nbsp(text, locale));
  return widont(compounds ? keepCompounds(glued) : glued);
}

/** `value` with prose() applied to every string in it (dictionaries, config objects). */
export function typeset<T>(value: T, locale: Locale, options: ProseOptions = {}): T {
  if (typeof value === "string") return prose(value, locale, options) as T;
  if (Array.isArray(value)) return value.map((item: unknown) => typeset(item, locale, options)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typeset(item, locale, options)])) as T;
  }
  return value;
}
