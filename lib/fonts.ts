import { Archivo, Caveat, Instrument_Serif, JetBrains_Mono } from "next/font/google";

/**
 * All fonts are self-hosted by next/font with the latin-ext subset (Czech diacritics: ŘŠČŽĚŮ).
 * Archivo is variable on both weight (100–900) and width (62–125 %) – the width axis drives
 * the hover effect of the giant name in the footer.
 */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Italic accents in headings ("Beyond *code*"). */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Section numbers, labels, clocks. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

/** Handwritten text on the stickers only – not preloaded, it is never above the fold. */
export const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: "700",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

export const fontVariables = [archivo, instrumentSerif, jetbrainsMono, caveat].map((f) => f.variable).join(" ");
