import { cs } from "@/content/cs";
import { en, type Dictionary } from "@/content/en";
import type { Locale } from "@/content/types";

const dictionaries: Record<Locale, Dictionary> = { en, cs };

/**
 * Server-side access to the dictionaries. Client components get only the strings
 * they need as props, so neither dictionary ends up in the client bundle.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
