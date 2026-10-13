/**
 * Subsets the self-hosted fonts to the characters the site can show: fonts/source/*.ttf (Google
 * Fonts originals, SIL OFL) → fonts/*.woff2, which lib/fonts.ts loads through next/font/local.
 *
 *   npm run fonts
 *
 * The character set: ASCII, the whole Czech and Slovak alphabet, common punctuation and arrows,
 * plus every other character found in the sources (content, components, app, lib), in both cases.
 * Re-run it after adding text with new characters and commit the fonts; the smoke tests fail when
 * the page shows a character outside fonts/charset.txt.
 * Archivo keeps the axis ranges the site uses: wght 400–900, wdth 100–125.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import subsetFont from "subset-font";

type Axes = Record<string, { min: number; max: number; default: number }>;

const JOBS: { source: string; out: string; axes?: Axes }[] = [
  {
    source: "archivo-variable.ttf",
    out: "archivo.woff2",
    axes: { wght: { min: 400, max: 900, default: 400 }, wdth: { min: 100, max: 125, default: 100 } },
  },
  { source: "instrument-serif-regular.ttf", out: "instrument-serif.woff2" },
  { source: "instrument-serif-italic.ttf", out: "instrument-serif-italic.woff2" },
];

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i));

const BASE = [
  ...range(0x20, 0x7e), // ASCII
  ..."ÁáÄäČčĎďÉéĚěÍíĹĺĽľŇňÓóÔôŔŕŘřŠšŤťÚúŮůÝýŽž", // Czech and Slovak
  ..."–—‘’‚“”„…•·×©€", // punctuation and signs
  String.fromCodePoint(0xa0, 0x2060), // no-break space, word joiner (lib/typography)
  ...range(0x2190, 0x2199), // arrows
];

/** Every non-ASCII character in the given folders' source files. */
function sourceCharacters(dirs: string[]): string[] {
  const found = new Set<string>();
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const file = path.join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else if (/[.]tsx?$/.test(name)) for (const char of readFileSync(file, "utf8")) if (char.codePointAt(0)! > 0x7e) found.add(char);
    }
  };
  dirs.forEach(walk);
  return [...found];
}

const chars = new Set<string>();
for (const char of [...BASE, ...sourceCharacters(["content", "components", "app", "lib"])]) {
  chars.add(char);
  // CSS text-transform needs the other case too.
  for (const other of [char.toUpperCase(), char.toLowerCase()]) if ([...other].length === 1) chars.add(other);
}
const text = [...chars].sort().join("");
writeFileSync(path.join("fonts", "charset.txt"), text);

for (const job of JOBS) {
  const source = readFileSync(path.join("fonts", "source", job.source));
  const subset = await subsetFont(source, text, { targetFormat: "woff2", variationAxes: job.axes });
  writeFileSync(path.join("fonts", job.out), subset);
  console.log(`fonts/${job.out}: ${Math.round(subset.length / 1024)} kB (source ${Math.round(source.length / 1024)} kB)`);
}
console.log(`${chars.size} characters → fonts/charset.txt`);
