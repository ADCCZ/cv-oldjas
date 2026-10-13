/**
 * Shoots the share images from the /og pages (app/og) of the production build:
 * public/og.png (English) and public/og-cs.png (Czech), 1200 × 630 – the size Open Graph and
 * X/Twitter cards expect.
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

const JOBS = [
  { locale: "en", file: "og.png" },
  { locale: "cs", file: "og-cs.png" },
];

await withProductionServer(async (baseUrl) => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    for (const job of JOBS) {
      const response = await page.goto(`${baseUrl}/og/${job.locale}`, { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`/og/${job.locale} returned ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
      const png = await sharp(shot).png({ compressionLevel: 9 }).toBuffer();
      const out = path.join("public", job.file);
      writeFileSync(out, png);
      console.log(`✓ ${out}: ${Math.round(png.length / 1024)} kB`);
    }
  } finally {
    await browser.close();
  }
});
