/**
 * Lighthouse with its default (mobile) config against the production build: `/` and `/cs`, three
 * runs each in a fresh browser – the median run counts. Fails unless the targets of docs/PROMPT.md §6
 * hold. HTML reports of the median runs land in test-results/lighthouse/.
 *
 *   npm run build && npm run lighthouse          (`-- cs` measures one language, LH_RUNS=1 one run)
 *
 * Local only: scores from a shared CI runner swing too much to gate a build on.
 * BASE_URL=http://localhost:3000 measures a server that is already running (scripts/serve.ts).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import lighthouse, { generateReport } from "lighthouse";
import { computeMedianRun } from "lighthouse/core/lib/median-run.js";
import { freePort, withProductionServer } from "./serve.ts";

type Lhr = Parameters<typeof computeMedianRun>[0][number];
/** The parts of a Lighthouse result this script reads. */
type Summary = {
  categories: Record<string, { title: string; score: number | null }>;
  audits: Record<string, { title: string; numericValue?: number } | undefined>;
};

// Languages, not paths: Git Bash would turn an argument "/cs" into a Windows path.
const PAGES = (process.argv.length > 2 ? process.argv.slice(2) : ["en", "cs"]).map((locale) =>
  locale === "en" ? "/" : `/${locale}`,
);
const RUNS = Number(process.env.LH_RUNS ?? 3);
const OUT_DIR = path.join("test-results", "lighthouse");

/** docs/PROMPT.md §6 – scores 0–1, metrics in ms (CLS unitless). */
const TARGETS = {
  scores: { performance: 0.85, accessibility: 0.95, seo: 1 } as Record<string, number>,
  metrics: { "largest-contentful-paint": 2500, "cumulative-layout-shift": 0.05 } as Record<string, number>,
};

async function audit(url: string): Promise<Lhr> {
  const port = await freePort();
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
  try {
    const result = await lighthouse(url, {
      port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    if (!result) throw new Error(`Lighthouse returned nothing for ${url}`);
    if (result.lhr.runtimeError) throw new Error(`${url}: ${result.lhr.runtimeError.message}`);
    return result.lhr;
  } finally {
    await browser.close();
  }
}

const format = (id: string, value: number) =>
  id === "cumulative-layout-shift" ? value.toFixed(3) : `${(value / 1000).toFixed(2)} s`;

const failures: string[] = [];

await withProductionServer(async (baseUrl) => {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const pagePath of PAGES) {
    const runs: Lhr[] = [];
    for (let i = 0; i < RUNS; i++) {
      const lhr = await audit(`${baseUrl}${pagePath}`);
      const perf = Math.round(((lhr as unknown as Summary).categories.performance?.score ?? 0) * 100);
      console.log(`  ${pagePath} run ${i + 1}/${RUNS}: performance ${perf}`);
      runs.push(lhr);
    }
    const median = computeMedianRun(runs);
    const summary = median as unknown as Summary;

    const scores = Object.entries(summary.categories).map(([id, category]) => {
      const score = category.score ?? 0;
      const target = TARGETS.scores[id];
      if (target !== undefined && score < target) failures.push(`${pagePath} ${id} ${Math.round(score * 100)} < ${target * 100}`);
      return `${category.title} ${Math.round(score * 100)}`;
    });
    const metrics = Object.entries(TARGETS.metrics).map(([id, max]) => {
      const value = summary.audits[id]?.numericValue ?? Number.NaN;
      if (!(value < max)) failures.push(`${pagePath} ${id} ${format(id, value)} ≥ ${format(id, max)}`);
      return `${summary.audits[id]?.title ?? id} ${format(id, value)}`;
    });
    console.log(`${pagePath}  ${scores.join(" · ")}\n    ${metrics.join(" · ")}`);

    const file = path.join(OUT_DIR, `${pagePath === "/" ? "en" : pagePath.slice(1)}.html`);
    writeFileSync(file, generateReport(median, "html"));
    writeFileSync(file.replace(/\.html$/, ".json"), JSON.stringify(median));
    console.log(`    report: ${file}`);
  }
});

if (failures.length) {
  console.error(`\nBelow target:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
