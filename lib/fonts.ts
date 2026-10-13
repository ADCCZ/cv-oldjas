import { Caveat } from "next/font/google";
import localFont from "next/font/local";

/**
 * Archivo and Instrument Serif are self-hosted subsets (fonts/*.woff2, made by `npm run fonts` from
 * fonts/source): only the characters the site shows, Czech diacritics (ŘŠČŽĚŮ) included. Two thirds
 * lighter than the Google subsets – they load before the first paint, so every kilobyte counts.
 * Archivo is variable on weight (400–900) and width (100–125 %). It also sets every label, number and
 * clock (caps, slightly wide via the width axis) – the site has no monospace font.
 */
export const archivo = localFont({
  src: "../fonts/archivo.woff2",
  weight: "400 900",
  style: "normal",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Italic accents in headings ("Beyond *code*"), the upright cut for the big numbers. */
export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/** Handwritten text on the stickers only – not preloaded, it is never above the fold. */
export const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: "700",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

export const fontVariables = [archivo, instrumentSerif, caveat].map((f) => f.variable).join(" ");
