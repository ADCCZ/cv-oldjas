/**
 * Shoots the share images from the /og pages (app/og) of the production build:
 * public/og.png (English) and public/og-cs.png (Czech), 1200 × 630 – the size Open Graph and
 * X/Twitter cards expect – and the LinkedIn profile banner docs/linkedin-banner.png (1584 × 396,
 * app/og/[locale]/linkedin; uploaded by hand, not served by the site).
 *
 *   npm run build && npm run og
 *
 * Run by hand after changing the name, the role, the status line or the portrait, and commit the
 * images. BASE_URL=http://localhost:3000 uses a server that is already running (scripts/serve.ts).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { withProductionServer } from "./serve.ts";

const OG = { width: 1200, height: 630 };
const JOBS = [
  { route: "/og/en", size: OG, out: path.join("public", "og.png") },
  { route: "/og/cs", size: OG, out: path.join("public", "og-cs.png") },
  { route: "/og/en/linkedin", size: { width: 1584, height: 396 }, out: path.join("docs", "linkedin-banner.png") },
];

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    for (const job of JOBS) {
      const page = await browser.newPage({ viewport: job.size, deviceScaleFactor: 1, reducedMotion: "reduce" });
      const response = await page.goto(baseUrl + job.route, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`${job.route} returned ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      const shot = await page.screenshot({ clip: { x: 0, y: 0, ...job.size } });
      const png = await sharp(shot).png({ compressionLevel: 9 }).toBuffer();
      writeFileSync(job.out, png);
      console.log(`✓ ${job.out}: ${Math.round(png.length / 1024)} kB`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
