# CLAUDE.md – cv-oldjas

Personal CV / portfolio of Oldřich Jan Švehla (junior full-stack developer, Pilsen).
Live: https://cv-oldrich-jan-svehla.vercel.app/ (own Vercel project, `links.site`). The previous website (repo
ADCCZ/olda-web, never edit it) stays at https://cv-oldjas-tan.vercel.app/ – that URL is in sent internship applications.
The full brief is in `docs/PROMPT.md`; effect decisions from the reference research in `docs/REFERENCES.md`
(they override the brief where they differ). These are the rules that must hold in every session.

## Stack and versions

- Next.js 15 (App Router, SSG + ISR; two static routes `app/(en)` → `/`, `app/cs` → `/cs`, shared code in `app/_site`) ·
  React 19 · TypeScript 5.9 (strict, `noUncheckedIndexedAccess`)
- Tailwind CSS v4 – design tokens are CSS variables in `app/globals.css`, the default palette is removed
- GSAP 3 (ScrollTrigger, SplitText; Draggable, InertiaPlugin, Flip loaded on demand via `loadDraggable()` / `loadFlip()`) –
  register plugins only in `lib/gsap.ts`
- Lenis smooth scroll driven by `gsap.ticker` (`lib/lenis.ts`); off with reduced motion
- matter-js (stats stickers, stack pile) – always a dynamic `import("matter-js")`, never in the first load
- React Three Fiber + drei (one shared fixed `<Canvas>` + drei `<View>`) – phase 5
- next-themes (dark default, follows `prefers-color-scheme`), simple-icons, Vercel Analytics + Speed Insights
- Fonts: Archivo + Instrument Serif self-hosted through `next/font/local` as subsets (`fonts/*.woff2`, made by
  `npm run fonts` from the OFL originals in `fonts/source`); Caveat stays `next/font/google` (not preloaded)
- Playwright for smoke tests, PDF CV generation, screenshots and the share images; Lighthouse 13 for `npm run lighthouse`
- Node 24 (`.nvmrc`)

## Design rules

- **60 / 30 / 10**: 60 % base (`--bg`, `--surface`), 30 % red (`--red-950 … --red-500`), 10 % gold (`--gold`, `--gold-soft`, `--gold-text`).
- Red text only at >= 24 px on dark. In light mode red text is `#9E0F1C`, gold text `#8A6A12`.
- Gold never as a large area – numbers, hairlines, active states, focus ring, underlines.
- **Square corners** on buttons, tags, tiles and icon buttons. Round only for stickers, badges and status dots.
- Buttons: `.btn` + `.btn-primary | .btn-outline | .btn-cream | .btn-on-red` (+ `.btn-sm`) with `<ButtonContent label=… />` –
  label block + separate icon square, text rolls on hover (juncastudio.com style). Never pill buttons.
- Hairlines: `--line` (fg at 12 %). Grain overlay 5 %.
- Easing `cubic-bezier(0.65, 0, 0.35, 1)` (`--ease-inout`, GSAP `power2.inOut`), `expo.out` for reveals, 0.6–1.2 s.
- Fonts (Czech included, test "ŘŠČŽĚŮ"): Archivo variable (subset keeps wght 400–900, wdth 100–125) for display, text **and
  labels** (`.eyebrow`, `font-label`: caps, wdth 112 %, tabular numbers), Instrument Serif italic for accent words,
  Caveat only on stickers. **No monospace font** – the user rejected JetBrains Mono as "AI-looking".
- Logo: placeholder text "OJŠ" (`components/ui/Logo.tsx`) until the SVG lands in `public/logo.svg` (`fill="currentColor"`).
- **No lone word or lone " · " part on a last line, at any width.** Dictionary and config text goes through
  `lib/typography` (`getDictionary`, `tx()`): Czech no-break spaces after v, k, s, z, a, i, o, u, arrows glued to their
  word, the last two words of running text joined, short hyphenated compounds kept whole (web only – the PDFs and meta
  tags read `getDictionary(locale, "plain")`). Lines joined by " · " use `components/ui/Segments`; headings, list items
  and `.eyebrow` balance. Check new text at 320–1920 px in both languages.
- **Anti-AI-look**: no purple/blue gradients, no glassmorphism, no emoji in headings, no icons in circles as decoration,
  no percentage skill bars, no stock phrases, no invented references or numbers – only facts from `docs/PROMPT.md`.
  Every animation needs a reason. **No easter eggs** (no terminal, stamps, mascot, hidden games).

## Motion and performance rules

- Setup that measures text runs through `afterFonts()` (`lib/motion.ts`): one controller per task after the fonts, then
  one shared `ScrollTrigger.refresh()` – controllers call `requestRefresh()`, never `ScrollTrigger.refresh()` at load.
- Read layout before writing it (no getBoundingClientRect per letter after a style write); cache sizes with ResizeObserver.
- The hero's first paint must stay its largest one (LCP): the name letters (`.hero-char`) and the tagline masks are
  server-rendered, the marquee is a CSS loop on the compositor, the pin uses the server-rendered `[data-hero-spacer]`,
  and until the first wheel/touch/key/click (or a scroll away from the top) HeroMotion neither changes the loop's
  rate nor creates the pin. The hero section has a definite height (`h-svh min-h-min`) – with only a min-height
  Chrome resolves the name's `cqh` font size against 0 while the HTML streams in.
- Targets (`npm run lighthouse`, mobile, median of 3): Performance ≥ 85, Accessibility ≥ 95, SEO 100, CLS < 0.05.
  Lighthouse counts every byte requested before the first paint into LCP – watch font and first-load JS sizes.

## Interactions (phase 4)

- Cursor states are declared in markup: `data-cursor="view"` (project covers), `data-cursor="drag"` (strips, pile
  tiles); links get the ring, `.btn` the magnetic pull. `data-surface="red"` marks red surfaces – the ring drops
  `mix-blend-mode: difference` there (it would turn cyan). Fine pointer + full motion only.
- Magnetic `.btn`: the pull goes through `--mag-x/--mag-y` and the CSS `translate` property – never GSAP `x/y` on `.btn`.
- Drifting strip (`DriftStrip`): `[data-strip]` scroller with three identical `[data-strip-copy]` blocks (clone,
  original, clone); clones are `aria-hidden` (+ `inert` when they hold no links) and `motion-only`.
- The stack pile box keeps the sorted grid's height – switching must never change the page height (anchors below).

## WebGL (phase 5)

- One shared fixed R3F canvas (`components/webgl/Scene.tsx`) with drei `<View>`s that track DOM elements. `WebglRoot`
  loads it via `next/dynamic` only with full motion, WebGL2 + float colour buffers, after the hero letters settled –
  three.js never enters the first load (check the build output).
- `WebglRoot` also refuses software renderers (SwiftShader, llvmpipe – by `failIfMajorPerformanceCaveat` and the unmasked
  renderer name): headless browsers and GPU-less devices keep the DOM versions.
- `frameloop="never"`: the Driver advances R3F from `gsap.ticker` (after Lenis/ScrollTrigger). Every effect registers a
  stage (`stage.ts`) that says whether it needs the frame; with none the canvas is cleared and hidden (`html[data-webgl-idle]`).
- Layering: canvas `z-40` over the content; while the hero reveal runs `html[data-webgl-layer="under"]` puts it at `z-5`,
  under the hero copy (`z-[6]`) and About (`z-10`). WebGL then draws the whole name and `html[data-hero-gl]` hides the
  DOM marquee; `HeroMotion` publishes `heroState` (`lib/webgl.ts`), the DOM name takes over as soon as letters scatter.
- DOM hooks: `[data-marquee-row|copy]` (hero), `[data-compass]` + `.compass-svg`, `[data-facts] [data-fact] [data-fact-icon]`,
  `[data-cover] [data-cover-frame] [data-cover-tags] [data-parallax]`, `[data-projects-clip]`.
- Textures come from the DOM (`rasterize.ts`: glyphs at their Range rects, backgrounds, images) – a screenshot in
  `public/projects/` is picked up by the ripples automatically.
- Shaders: `RawShaderMaterial` GLSL3 mixing in sRGB, colours from the CSS tokens (`colors.ts`). Inside loops and branches
  read textures with `textureLod(…, 0.0)` – derivatives there made Chrome on Windows lose the context on Intel GPUs.
  Precompile with `precompile.ts`, never three's `compileAsync` (it polls disposed programs forever), and draw an effect
  only after its `done` callback. The job must match how the material is drawn: `target` (render target – tone
  mapping and colour space are in the program key) and `passJob(…, { normals: false })` for three's own pass materials.
  The compass environment (PMREM, a 1 s GGX compile on Intel) is filtered only after its materials compiled this way.
- Fallbacks: `html[data-webgl="off"]` → DOM name, SVG compass (GSAP needle), CSS cover zoom + RGB split. Reduced motion
  loads nothing.
- Checking it: headless Chromium with `--enable-gpu --use-angle=d3d11 --ignore-gpu-blocklist` runs on the real GPU
  (`--force_low_power_gpu` = the Intel iGPU, the "ordinary laptop"). After a lost context Chrome blocks WebGL for the rest
  of that browser – one fresh browser per case.

## Images and PDF CVs (phase 6)

- Project images: `npm run screenshots` shoots every project with a `demo` (1600 × 1000 @2x → WebP via sharp) into
  `public/projects/<id>.webp`; per-project steps before the shot live in `PREPARE` (scripts/screenshots.ts). This site
  is shot from the local build with reduced motion (the hero name stands still). Projects without a screenshot keep the
  typographic DOM cover (`ProjectCover`) – no SVG covers (decision in docs/REFERENCES.md).
- Portrait: `public/photo.webp` (a trimmed cut-out with transparency, `links.photo`) in About and in the design CV.
  The source `photo.webp` in the repo root stays untracked, like `logo.jpg`. The plain CV has no photo.
- Print pages `app/cv/print/[locale]/[variant]` (design | plain) have their own root layout (`<html lang>`, light theme,
  fonts) and `app/cv/print/print.css` in mm/pt. They carry the phone number, so on Vercel they are static 404s.
- `npm run cv` (after `npm run build`) first flattens `public/photo.webp` onto the paper colour as `public/photo-cv.jpg`
  (the design CV uses it – a transparent image stays lossless in a PDF), then renders the 4 PDFs into `public/` and
  fails unless the design CV has exactly 2 pages and the plain one at most 2 – commit the PDFs. CV-only texts are in the `cv` block of `content/en.ts`/`cs.ts`,
  the picks in `content/cv.config.ts`, one-sentence project `summary` in `projects.config.ts`.
- Czech print text goes through `typeset()` (no-break space after v, k, s, z, a, i, o, u). Section numbers are a CSS
  counter and the visible name is not a heading: Chromium builds the PDF bookmarks from painted heading text without
  the spaces between nodes or lines ("01PROFILE", "JANŠVEHLA").
- Share images: `npm run og` (after a build) shoots `app/og/[locale]` (dark theme, 404 on Vercel like the print pages)
  into `public/og.png` and `public/og-cs.png` (1200 × 630) – rerun after changing the name, role, status or portrait.
- `scripts/*.ts` run on Node's type stripping (`.ts` import extensions, `allowImportingTsExtensions`); `scripts/serve.ts`
  starts `next start` on a free port (or uses `BASE_URL`) and kills the whole process tree afterwards.

## Language

- English is the main language on `/`, Czech on `/cs`. No redirect by browser language; the toggle stores `lang` cookie.
- **Every new text needs both translations**: `content/en.ts` defines the `Dictionary` type, `content/cs.ts` must match.
- No text hard-coded in JSX – components read `content/`. Course codes (KIV/…), companies and schools stay untranslated;
  schools get their English name in parentheses in the English version.

## Anchors (never rename – they are in sent applications)

`#top #about #stats #projects #stack #skills #journey #off-code #contact`
Legacy aliases (hidden anchors): `#education`, `#experience` → start of each stack in `#journey`, `#leadership` → `#skills`.
Old PDF paths `/cv.pdf` and `/cv-plain.pdf` must keep working.

## Structure

```
app/(en)/ app/cs/    the two languages: layout (html lang, metadata) + page, both from app/_site
app/_site/           SiteLayout (root markup, metadata) + HomePage (the single page)
app/og/              share image pages (npm run og)
app/not-found.tsx    global 404 (both languages)
app/cv/print/        print pages of the PDF CVs (own root layout, print.css)
components/cv/       DesignCv, PlainCv, shared helpers of the print pages
components/layout/   Nav, MenuOverlay, Footer, Cursor, Intro, Clock, ThemeToggle, LangToggle, Providers, SmoothScroll
components/motion/   client "controllers" that animate server-rendered markup (GSAP, physics, strips)
components/sections/ Hero, About, Stats, Projects, ProjectArchive, Stack, Skills, Journey, OffCode, Contact
components/ui/       small building blocks (SectionHeading, Marquee, ButtonContent, TechPill, SkillCard, …)
components/webgl/    WebglRoot (lazy loader), Scene (shared Canvas + Driver), HeroReveal, Compass, Ripples, simulations, shaders
content/             en.ts, cs.ts, projects.config.ts, stack.config.ts, stats.config.ts, links.config.ts, cv.config.ts, github-snapshot.json
fonts/               subset woff2 + charset.txt (npm run fonts); source/ = Google Fonts originals (SIL OFL)
public/              projects/<id>.webp screenshots, photo.webp, the 4 PDF CVs (generated, committed)
lib/                 gsap, lenis, github, i18n, typography, sections, fonts, analytics, hooks
scripts/             next.mjs + windows-preload.cjs (see below), generate-cv.ts, screenshots.ts, og.ts, fonts.ts, lighthouse.ts, serve.ts
tests/               Playwright smoke tests
docs/PROMPT.md       the brief
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server (Turbopack) on :3000 |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Playwright smoke tests against `next start` (build first) |
| `npm run cv` | render the 4 PDF CVs into `public/` from the production build – commit them |
| `npm run screenshots` | screenshots of projects with a live demo into `public/projects/` (`-- <id>` for one) |
| `npm run og` | share images `public/og.png` + `og-cs.png` from the production build – commit them |
| `npm run fonts` | subset the fonts in `fonts/` to the characters of the sources – commit them |
| `npm run lighthouse` | Lighthouse mobile on `/` and `/cs` against the build (`-- cs` one language, `LH_RUNS=1`); reports in `test-results/lighthouse/` |

The repo lives on an exFAT drive locally (D:). There `fs.readlink()` throws EISDIR instead of EINVAL and breaks
webpack/Next.js, and Next's font manifest stays empty on Windows (no font preloads) – `scripts/next.mjs` preloads
`scripts/windows-preload.cjs` (exfat-readlink.cjs + win-font-manifest.cjs) on Windows. Keep using the npm scripts.
`npm run dev` and `npm run build` share `.next` – never build while a dev server runs.

## Workflow

- Work in the phases of `docs/PROMPT.md` §9; after each phase stop and show the result.
- Conventional commits in English (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`, `test:`, `ci:`),
  small and logical – one commit = one change. **No `Co-Authored-By` trailers.**
- CI (`.github/workflows/ci.yml`): lint → typecheck → build → Playwright smoke tests on every push and PR.
- Accessibility: one `h1` (the name), sections with `aria-labelledby`, visible gold focus ring, animated text keeps a
  readable copy for screen readers, contrast >= 4.5 : 1 in both themes, everything keyboard-operable.
- Reduced motion: no pin/horizontal scroll, no Lenis, no marquee, no letter explosions, no WebGL ripples, no physics,
  no scramble – only fades <= 200 ms.
