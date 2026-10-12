export type Locale = "en" | "cs";

/** A value that differs per language. */
export type Localized<T = string> = Record<Locale, T>;

/**
 * Text in the content configs: a plain string is the same in both languages
 * (names, course codes, technologies), an object is translated.
 */
export type Text = string | Localized;
