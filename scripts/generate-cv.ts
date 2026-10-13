/**
 * Renders the four PDF CVs from the print pages (app/cv/print) into public/:
 * cv.pdf and cv-plain.pdf in English (the paths of the old website), cv-cs.pdf and cv-plain-cs.pdf
 * in Czech – the paths come from `links.cv` in content/links.config.ts.
 *
 *   npm run build && npm run cv
 *
 * Run by hand and commit the PDFs: Chromium does not belong in the Vercel build. The design CV must
 * come out at exactly two pages, the plain one at most two – otherwise the script fails.
 * BASE_URL=http://localhost:3000 renders from a server that is already running (scripts/serve.ts).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { links } from "../content/links.config.ts";
import { withProductionServer } from "./serve.ts";

type Variant = "design" | "plain";

const JOBS = (["en", "cs"] as const).flatMap((locale) =>
  (["design", "plain"] as const satisfies Variant[]).map((variant) => ({
    locale,
    variant,
    file: links.cv[locale][variant],
    /** [min, max] pages */
    pages: variant === "design" ? [2, 2] : [1, 2],
  })),
);

/** Page objects in the file – Chromium writes them uncompressed (`/Type /Page`). */
function countPages(pdf: Buffer): number {
  return pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-z])/g)?.length ?? 0;
}

const failures: string[] = [];

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const job of JOBS) {
      const response = await page.goto(`${baseUrl}/cv/print/${job.locale}/${job.variant}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`/cv/print/${job.locale}/${job.variant} returned ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);

      const pdf = await page.pdf({
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        // Headings become bookmarks, the structure is tagged for screen readers.
        outline: true,
        tagged: true,
      });
      const out = path.join("public", job.file);
      writeFileSync(out, pdf);

      const pages = countPages(pdf);
      const [min, max] = job.pages as [number, number];
      const ok = pages >= min && pages <= max;
      console.log(`${ok ? "✓" : "✗"} ${out}: ${pages} page${pages === 1 ? "" : "s"}, ${Math.round(pdf.length / 1024)} kB`);
      if (!ok) failures.push(`${out} has ${pages} pages, expected ${min === max ? min : `${min}–${max}`}`);
    }
  } finally {
    await browser.close();
  }
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
