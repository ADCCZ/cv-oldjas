import { cs } from "@/content/cs";
import { en, type Dictionary } from "@/content/en";
import type { Locale } from "@/content/types";
import { typeset } from "@/lib/typography";

/**
 * Typeset once, here (lib/typography). "web" – the page text, hyphenated compounds kept whole;
 * "plain" – without invisible characters, for the PDFs and the meta tags.
 */
type Medium = "web" | "plain";

const dictionaries: Record<Medium, Record<Locale, Dictionary>> = {
  web: { en: typeset(en, "en", { compounds: true }), cs: typeset(cs, "cs", { compounds: true }) },
  plain: { en: typeset(en, "en"), cs: typeset(cs, "cs") },
};

/**
 * Server-side access to the dictionaries. Client components get only the strings
 * they need as props, so neither dictionary ends up in the client bundle.
 */
export function getDictionary(locale: Locale, medium: Medium = "web"): Dictionary {
  return dictionaries[medium][locale];
}

export type { Dictionary };
