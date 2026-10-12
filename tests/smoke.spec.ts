import { expect, test, type Page } from "@playwright/test";

const NAME = "Oldřich Jan Švehla";
const SECTIONS = ["top", "about", "stats", "projects", "stack", "skills", "journey", "off-code", "contact"];
/** Anchors from the old website – links to them are in sent internship applications. */
const LEGACY_ANCHORS = ["education", "experience", "leadership"];
const PDFS = ["/cv.pdf", "/cv-plain.pdf", "/cv-cs.pdf", "/cv-plain-cs.pdf"];

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
  });
});
