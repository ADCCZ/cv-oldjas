/**
 * Screenshots of the projects that have a live demo → public/projects/<id>.webp
 *
 *   npm run screenshots                  every project with a `demo` in content/projects.config.ts
 *   npm run screenshots -- campmaster    only the given ids
 *
 * Run by hand, never during the build, and commit the images: a file in public/projects/ replaces
 * the typographic cover of its project automatically (components/ui/ProjectCover.tsx).
 * Viewport 1600 × 1000 (the 16:10 of the cover) at deviceScaleFactor 2 → a 3200 × 2000 WebP.
 *
 * This website's own demo is shot from the local production build (scripts/serve.ts) – it is the
 * same code, and the live domain may still serve an older deployment.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import sharp from "sharp";
import { links } from "../content/links.config.ts";
import { projects } from "../content/projects.config.ts";
import { withProductionServer } from "./serve.ts";

const VIEWPORT = { width: 1600, height: 1000 };
const OUT_DIR = path.join("public", "projects");

/** Demos whose first screen is not the telling one – steps that get the page there before the shot. */
const PREPARE: Partial<Record<string, (page: Page) => Promise<void>>> = {
  // The start screen only lists the events; the dashboard (map, routes, stations) opens with "Otevřít".
  campmaster: async (page) => {
    await page.getByRole("button", { name: /Otevřít|Open/ }).last().click();
    await page.waitForLoadState("networkidle");
  },
  // The previous website in its default dark theme, without the archive guide and her folder.
  "olda-web": async (page) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.getByText("Schovat", { exact: true }).click();
    await page.waitForTimeout(800);
    const hideFolder = page.getByLabel("Schovat", { exact: true });
    if (await hideFolder.count()) await hideFolder.first().click();
    await page.waitForTimeout(1500);
  },
};

const isOwnSite = (url: string) => new URL(url).origin === new URL(links.site).origin;

async function shoot(browser: Browser, id: string, url: string, own: boolean): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    // This site is dark by default; other demos keep their own look.
    colorScheme: own ? "dark" : "light",
    // The hero name of this site is an endless marquee – reduced motion shows it whole and still,
    // so the shot is the same every time.
    reducedMotion: own ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  try {
    if (own) {
      await page.goto(url, { waitUntil: "networkidle" });
    } else {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    }
    await PREPARE[id]?.(page);
    await page.waitForTimeout(1500); // entrance animations, map tiles, charts
    return await page.screenshot({ type: "png" });
  } finally {
    await context.close();
  }
}

const ids = process.argv.slice(2);
const targets = projects.filter((p) => p.demo && (!ids.length || ids.includes(p.id)));
if (!targets.length) {
  console.error(ids.length ? `No project with a demo among: ${ids.join(", ")}` : "No project has a demo.");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const project of targets) {
    const demo = project.demo!;
    const own = isOwnSite(demo);
    console.log(`${project.id}: ${own ? "local build" : demo}`);
    const png = own
      ? await withProductionServer((base) => shoot(browser, project.id, new URL(new URL(demo).pathname, base).href, true))
      : await shoot(browser, project.id, demo, false);

    const file = path.join(OUT_DIR, `${project.id}.webp`);
    const webp = await sharp(png).webp({ quality: 82, effort: 6 }).toBuffer();
    writeFileSync(file, webp);
    console.log(`  → ${file} (${Math.round(webp.length / 1024)} kB)`);
  }
} finally {
  await browser.close();
}
