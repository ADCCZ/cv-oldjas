# cv-oldjas

[![CI](https://github.com/ADCCZ/cv-oldjas/actions/workflows/ci.yml/badge.svg)](https://github.com/ADCCZ/cv-oldjas/actions/workflows/ci.yml)

Personal CV and portfolio of **Oldřich Jan Švehla** – junior full-stack developer, Pilsen.
Live at **https://cv-oldrich-jan-svehla.vercel.app/** (English) and
**[/cs](https://cv-oldrich-jan-svehla.vercel.app/cs)** (Czech). The previous website
([ADCCZ/olda-web](https://github.com/ADCCZ/olda-web)) stays at https://cv-oldjas-tan.vercel.app/.

Built with Next.js 15 (App Router, static pages with hourly revalidation), React 19, TypeScript, Tailwind CSS v4,
GSAP + Lenis, matter-js and React Three Fiber (WebGL shaders). Developed together with
[Claude Code](https://claude.com/claude-code).

## Getting started

Requires Node 24 (`.nvmrc`).

```bash
npm install
npx playwright install chromium   # once – smoke tests, PDF CVs, screenshots, share images, Lighthouse
npm run dev                        # http://localhost:3000
```

Optional: copy `.env.example` to `.env.local` and set `GITHUB_TOKEN` to raise the GitHub API rate limit
(see [Deployment](#deployment-vercel)).

Always go through the npm scripts – on Windows `scripts/next.mjs` works around two Next.js quirks (exFAT drives,
font preloads). `npm run dev` and `npm run build` share `.next`, so stop the dev server before building.

| Command | What it does |
| --- | --- |
| `npm run dev` | development server (Turbopack) |
| `npm run build` / `npm run start` | production build / serve it |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |
| `npm run test` | Playwright smoke tests against the production build (build first) |
| `npm run cv` | the four PDF CVs into `public/` (build first) |
| `npm run og` | share images `public/og.png` and `public/og-cs.png` (build first) |
| `npm run screenshots` | project screenshots into `public/projects/` (`-- <id>` for one project) |
| `npm run fonts` | subset the self-hosted fonts to the characters the site uses |
| `npm run lighthouse` | Lighthouse mobile on `/` and `/cs` against the production build |

Everything these scripts generate (PDFs, images, fonts) is committed – none of them runs in the Vercel build.

## Where things live

- **All text** is in `content/en.ts` (main language, defines the `Dictionary` type) and `content/cs.ts` – every new
  string needs both, nothing is hard-coded in the components.
- **Projects** – `content/projects.config.ts`, **technologies** – `content/stack.config.ts`, **stats** –
  `content/stats.config.ts`, **links and availability** – `content/links.config.ts`, **what the PDF CVs pick** –
  `content/cv.config.ts`.
- The project rules (design, motion, accessibility, code structure) are in [`CLAUDE.md`](CLAUDE.md), the original
  brief in [`docs/PROMPT.md`](docs/PROMPT.md).

## Adding a project

Add an entry to `projects` in `content/projects.config.ts`:

```ts
{
  id: "my-app",                      // stable: anchor #project-my-app, image name, analytics
  featured: true,                    // true = card in the horizontal strip, false = row in the archive
  repo: "ADCCZ/my-app",              // public GitHub repo, or null for a private one (+ optional privateNote)
  demo: "https://my-app.vercel.app", // optional – the cover links to it, `npm run screenshots` shoots it
  title: "My App",                   // a string, or { cs, en } when it gets translated
  description: { cs: "…", en: "…" },
  summary: { cs: "…", en: "…" },     // one sentence for the PDF CVs
  stack: ["React", "Tailwind CSS"],
  tags: ["WEBAPP"],                  // featured only – labels on the cover
  image: "/projects/my-app.webp",    // used once the file exists, until then a typographic cover
},
```

Then:

1. Language, stars and the last push come from the GitHub API on their own. Add the repo to
   `content/github-snapshot.json` too – that is the backup shown when the API fails.
2. Link the project from the technologies it uses: add its `id` to `usedIn` in `content/stack.config.ts`.
3. The design CV shows the six projects listed in `cvConfig.projects` (`content/cv.config.ts`), the plain CV every
   featured project – regenerate the PDFs (`npm run build && npm run cv`) and commit them.
4. The project count in the stats updates itself.

## Adding a technology

Add it to a category in `content/stack.config.ts`:

```ts
{ id: "nextjs", name: "Next.js", level: 2, icon: "nextdotjs", usedIn: ["cv-oldjas"] },
```

- `level` – 1 tried it · 2 basics, school projects · 3 independently on projects · 4 advanced, long-term ·
  5 expert. Technologies in the `planned` category have no level.
- `name` – a string, or `{ en, cs }` when it gets translated.
- `icon` – the [simple-icons](https://simpleicons.org/) slug of the logo. Import the icon (`siNextdotjs` for
  `nextdotjs`) in `lib/techIcons.ts` and add it to the list there – only imported icons end up in the bundle. Without
  `icon` the tile is text-only (Playwright, C#, Power BI and other brands that simple-icons does not have).
- `usedIn` – project ids, the tile's tooltip links to them.

The design CV lists the technologies too – `npm run build && npm run cv` and commit the PDFs.

## Swapping a cover for a screenshot

Projects without an image get a typographic cover. To replace it with a real screenshot:

1. Give the project a `demo` URL and `image: "/projects/<id>.webp"` in `content/projects.config.ts`.
2. If the page needs a click before the shot (opening a view, closing a banner), add a step for the project to
   `PREPARE` in `scripts/screenshots.ts`.
3. Run `npm run screenshots -- <id>` – 1600 × 1000 at 2× → `public/projects/<id>.webp`. Other projects are shot from
   their live demo, this website from the local production build (`npm run build` first).
4. Commit the image. The cover switches over by itself, the WebGL ripple effect included.

A project without a public demo gets its image by hand: a 16 : 10 WebP (3200 × 2000) saved as
`public/projects/<id>.webp`.

## PDF CVs

```bash
npm run build && npm run cv
```

renders `public/cv.pdf` and `public/cv-plain.pdf` (English), `public/cv-cs.pdf` and `public/cv-plain-cs.pdf`
(Czech) from the print pages `/cv/print/<en|cs>/<design|plain>`. It fails unless the design CV has exactly two pages
and the plain one at most two – then shorten the text. CV-only texts are in the `cv` block of `content/en.ts` and
`content/cs.ts`. Rerun after every content change the CVs show and commit the PDFs.

`/cv.pdf` and `/cv-plain.pdf` are linked from sent applications – these paths must never change.

## Share images

```bash
npm run build && npm run og
```

shoots the `/og/<en|cs>` pages into `public/og.png` and `public/og-cs.png` (1200 × 630). Rerun after changing the
name, the role, the status line or the portrait, and commit the images.

## Fonts

Archivo and Instrument Serif are self-hosted as subsets (`fonts/*.woff2`, made from the SIL OFL originals in
`fonts/source`). After adding text with a character outside `fonts/charset.txt` – the smoke tests fail when a page
shows one – run `npm run fonts` and commit the fonts.

## Lighthouse

```bash
npm run build && npm run lighthouse
```

measures `/` and `/cs` with the mobile config, three runs each in a fresh browser; the median run counts. It fails
below the targets: Performance ≥ 85, Accessibility ≥ 95, SEO 100, CLS < 0.05. `npm run lighthouse -- cs` measures
one language, `LH_RUNS=1` does a single run, HTML reports land in `test-results/lighthouse/`. Local only – shared CI
runners swing too much to gate a build on.

## Deployment (Vercel)

The Vercel project is connected to this repository: a push to `main` deploys production, other branches and pull
requests get preview deployments. Settings: framework preset Next.js with the default commands, Node.js 24.x (also
pinned in `package.json` → `engines`).

- **Environment variable** – *Settings → Environment Variables*: `GITHUB_TOKEN` (optional) for Production and
  Preview, a fine-grained token with read-only access to public repositories. It only raises the API rate limit;
  without it, or when the API fails, the projects fall back to `content/github-snapshot.json` with a small note.
- **Analytics** – the project's **Analytics** tab → *Enable* (Web Analytics), then the **Speed Insights** tab →
  *Enable*. Data comes in from the next deployment. `<Analytics />` and `<SpeedInsights />` render only on Vercel
  (`process.env.VERCEL`), so local builds and CI send nothing.
- On Vercel the print pages (`/cv/print/*`, they carry the phone number) and the share image pages (`/og/*`)
  return 404 – the PDFs and images are generated locally and committed.
- The GitHub metadata revalidates hourly (ISR), everything else is static.
- A bad deployment is reverted in *Deployments → ⋯ → Instant Rollback*.

## CI

`.github/workflows/ci.yml` runs lint → typecheck → build → Playwright smoke tests on every push and pull request (the
badge above). The smoke tests cover both languages, every anchor including the legacy aliases, the PDF CVs, the font
subset, keyboard and touch, reduced motion and the WebGL fallback – see `tests/smoke.spec.ts`.
