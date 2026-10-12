import { expect, test, type Page } from "@playwright/test";

const NAME = "Oldřich Jan Švehla";
const SECTIONS = ["top", "about", "stats", "projects", "stack", "skills", "journey", "off-code", "contact"];
/** Anchors from the old website – links to them are in sent internship applications. */
const LEGACY_ANCHORS = ["education", "experience", "leadership"];
const PDFS = ["/cv.pdf", "/cv-plain.pdf", "/cv-cs.pdf", "/cv-plain-cs.pdf"];

/** Mark the intro as already seen, so the tests do not wait for the loader (it has its own test). */
const SKIP_INTRO = () => sessionStorage.setItem("cv:intro", "1");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(SKIP_INTRO);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const [path, lang] of [
  ["/", "en"],
  ["/cs", "cs"],
] as const) {
  test(`${path} loads without console errors and shows the name in h1`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(NAME);

    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test(`${path} has every section anchor and the legacy aliases`, async ({ page }) => {
    await page.goto(path);
    for (const id of [...SECTIONS, ...LEGACY_ANCHORS]) {
      await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    }
  });
}

test("language switch moves between / and /cs and keeps the anchor", async ({ page }) => {
  await page.goto("/#projects");
  await page.getByRole("group", { name: "Language" }).getByRole("link", { name: "CS" }).click();
  await expect(page).toHaveURL(/\/cs#projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");

  await page.getByRole("group", { name: "Jazyk" }).getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/:\d+\/#projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the language choice is remembered in the lang cookie", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lang", value: "cs", url: baseURL! }]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/cs$/);
});

test("/en redirects to the canonical /", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/:\d+\/$/);
});

test("nothing overflows horizontally on a phone", async ({ browser }) => {
  // A wider document makes mobile browsers zoom out the whole page (fixed header slides off-screen).
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await context.addInitScript(SKIP_INTRO);
  const page = await context.newPage();
  for (const path of ["/", "/cs"]) {
    await page.goto(path);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, path).toBeLessThanOrEqual(375);
  }
  await context.close();
});

test("the fullscreen menu traps focus, closes with Escape and navigates", async ({ browser }) => {
  // On phones the MENU :: button is always in the header.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(SKIP_INTRO);
  const page = await context.newPage();
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Menu" });
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await menuButton.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: /About/ })).toBeFocused();

  // Tab never leaves the dialog.
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();

  await menuButton.click();
  await dialog.getByRole("link", { name: /Contact/ }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
  await context.close();
});

test("the intro loader plays on the first visit and then reveals the hero", async ({ browser }) => {
  const context = await browser.newContext(); // fresh session storage → intro plays
  const page = await context.newPage();
  const errors = collectErrors(page);
  await page.goto("/");

  await expect(page.locator(".intro")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-intro", "done", { timeout: 15_000 });
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.locator("[data-hero-name]")).toBeVisible();

  expect(errors).toEqual([]);

  // A deep link from an old application (opened in a new tab) skips the intro entirely.
  const deep = await context.newPage();
  await deep.goto("/#education");
  await expect(deep.locator("html")).toHaveAttribute("data-intro", "skip");
  await context.close();
});

test("the stats strip loops through clones that screen readers skip", async ({ page }) => {
  await page.goto("/");
  const copies = page.locator("#stats [data-strip-copy]");
  await expect(copies).toHaveCount(3);
  for (const i of [0, 2]) {
    await expect(copies.nth(i)).toHaveAttribute("aria-hidden", "true");
    await expect(copies.nth(i)).toHaveAttribute("inert", "");
  }
  await expect(copies.nth(1)).not.toHaveAttribute("aria-hidden", /.*/);
  // Screen readers get every number exactly once.
  await expect(page.getByRole("group", { name: "In numbers" }).getByRole("listitem")).toHaveCount(8);
});

test("the custom cursor follows a mouse and switches over project covers", async ({ page }) => {
  await page.goto("/");
  // The cursor mounts after hydration – keep moving until it has picked the mouse up.
  const cursor = page.locator(".cursor");
  let x = 400;
  await expect(async () => {
    await page.mouse.move((x += 10), 320);
    await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 500 });
  }).toPass();

  // The covers sit in the pinned, horizontally moving strip – point at one once it has settled.
  await page.evaluate(() => document.getElementById("projects")?.scrollIntoView());
  await page.waitForTimeout(1200);
  const cover = await page.locator("[data-cursor='view']").first().boundingBox();
  expect(cover).not.toBeNull();
  await page.mouse.move(cover!.x + cover!.width / 2, cover!.y + cover!.height / 2, { steps: 4 });
  await expect(cursor).toHaveAttribute("data-state", "view");
});

test("touch devices keep the system cursor and the plain stack grid", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(SKIP_INTRO);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".cursor")).toHaveCount(0);
  await page.locator("#stack").scrollIntoViewIfNeeded();
  await expect(page.locator("#stack-tiles")).not.toHaveAttribute("data-mode", "pile");
  await expect(page.locator("#stats .stat-pill")).toHaveCount(0);
  await context.close();
});

test("the stack pile sorts into the grid and back without moving the page", async ({ page }) => {
  await page.goto("/");
  const tiles = page.locator("#stack-tiles");
  await tiles.scrollIntoViewIfNeeded();
  await expect(tiles).toHaveAttribute("data-mode", "pile");
  const sort = page.locator("#stack").getByRole("button", { name: "Sort" });
  await expect(sort).toBeEnabled();

  const height = () => page.evaluate(() => document.documentElement.scrollHeight);
  const before = await height();
  await sort.click();
  await expect(tiles).toHaveAttribute("data-mode", "grid");
  const scatter = page.locator("#stack").getByRole("button", { name: "Scatter" });
  await expect(scatter).toBeVisible();
  expect(await height()).toBe(before);

  await scatter.click();
  await expect(tiles).toHaveAttribute("data-mode", "pile");
  expect(await height()).toBe(before);
});

test("archive rows open with the keyboard", async ({ page }) => {
  await page.goto("/");
  const row = page.locator("[data-archive-row]").first();
  await row.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(row).toHaveAttribute("open", "");
  await expect(row.locator("[data-archive-body] p").first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(row).not.toHaveAttribute("open", "");
});

test("unknown pages return 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
});

test.describe("PDF CVs", () => {
  // TODO(phase 6): remove once `npm run cv` has generated and committed the PDFs.
  test.fixme(true, "The PDFs are generated in phase 6 (npm run cv).");

  for (const file of PDFS) {
    test(`${file} is served as a PDF`, async ({ request }) => {
      const response = await request.get(file);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/pdf");
    });
  }
});

test.describe("prefers-reduced-motion: reduce", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("every section is visible without scroll animations", async ({ page }) => {
    await page.goto("/");
    for (const id of SECTIONS) {
      const section = page.locator(`[id="${id}"]`);
      await section.scrollIntoViewIfNeeded();
      await expect(section, `#${id}`).toBeVisible();

      const heading = section.locator("h1, h2").first();
      await expect(heading).toBeAttached();
      expect(await heading.evaluate((el) => getComputedStyle(el).opacity), `#${id} heading opacity`).toBe("1");
    }
    // The infinite marquee is replaced by the static name.
    await expect(page.locator(".marquee-track")).toBeHidden();
    // No drifting clones, no physics, no custom cursor.
    await expect(page.locator("#stats [data-strip-copy]").nth(0)).toBeHidden();
    await expect(page.locator("#stack-tiles")).not.toHaveAttribute("data-mode", /.*/);
    await expect(page.locator(".cursor")).toHaveCount(0);
  });
});
