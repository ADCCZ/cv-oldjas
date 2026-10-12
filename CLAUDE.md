# CLAUDE.md – cv-oldjas

Personal CV / portfolio of Oldřich Jan Švehla (junior full-stack developer, Pilsen).
Live: https://cv-oldjas-tan.vercel.app/ – that URL is already in sent internship applications.
The full brief is in `docs/PROMPT.md`; effect decisions from the reference research in `docs/REFERENCES.md`
(they override the brief where they differ). These are the rules that must hold in every session.

## Stack and versions

- Next.js 15 (App Router, SSG + ISR) · React 19 · TypeScript 5.9 (strict, `noUncheckedIndexedAccess`)
- Tailwind CSS v4 – design tokens are CSS variables in `app/globals.css`, the default palette is removed
- GSAP 3 (ScrollTrigger, SplitText; Draggable, InertiaPlugin, Flip loaded on demand via `loadDraggable()` / `loadFlip()`) –
  register plugins only in `lib/gsap.ts`
- Lenis smooth scroll driven by `gsap.ticker` (`lib/lenis.ts`); off with reduced motion
- matter-js (stats stickers, stack pile) – always a dynamic `import("matter-js")`, never in the first load
- React Three Fiber + drei (one shared fixed `<Canvas>` + drei `<View>`) – phase 5
- next-themes (dark default, follows `prefers-color-scheme`), simple-icons, Vercel Analytics + Speed Insights
- Playwright for smoke tests, PDF CV generation and screenshots
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
- Fonts (all with latin-ext, test "ŘŠČŽĚŮ"): Archivo variable (wght 100–900, wdth 62–125) for display, text **and
  labels** (`.eyebrow`, `font-label`: caps, wdth 112 %, tabular numbers), Instrument Serif italic for accent words,
  Caveat only on stickers. **No monospace font** – the user rejected JetBrains Mono as "AI-looking".
- Logo: placeholder text "OJŠ" (`components/ui/Logo.tsx`) until the SVG lands in `public/logo.svg` (`fill="currentColor"`).
- **Anti-AI-look**: no purple/blue gradients, no glassmorphism, no emoji in headings, no icons in circles as decoration,
  no percentage skill bars, no stock phrases, no invented references or numbers – only facts from `docs/PROMPT.md`.
  Every animation needs a reason. **No easter eggs** (no terminal, stamps, mascot, hidden games).

## Interactions (phase 4)

- Cursor states are declared in markup: `data-cursor="view"` (project covers), `data-cursor="drag"` (strips, pile
  tiles); links get the ring, `.btn` the magnetic pull. `data-surface="red"` marks red surfaces – the ring drops
  `mix-blend-mode: difference` there (it would turn cyan). Fine pointer + full motion only.
- Magnetic `.btn`: the pull goes through `--mag-x/--mag-y` and the CSS `translate` property – never GSAP `x/y` on `.btn`.
- Drifting strip (`DriftStrip`): `[data-strip]` scroller with three identical `[data-strip-copy]` blocks (clone,
  original, clone); clones are `aria-hidden` (+ `inert` when they hold no links) and `motion-only`.
- The stack pile box keeps the sorted grid's height – switching must never change the page height (anchors below).

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
app/[locale]/        layout (html lang, metadata) + the single page
app/not-found.tsx    global 404 (both languages)
components/layout/   Nav, MenuOverlay, Footer, Cursor, Intro, Clock, ThemeToggle, LangToggle, Providers, SmoothScroll
components/motion/   client "controllers" that animate server-rendered markup (GSAP, physics, strips)
components/sections/ Hero, About, Stats, Projects, ProjectArchive, Stack, Skills, Journey, OffCode, Contact
components/ui/       small building blocks (SectionHeading, Marquee, ButtonContent, TechPill, SkillCard, …)
components/webgl/    shared Canvas, shaders (later)
content/             en.ts, cs.ts, projects.config.ts, stack.config.ts, stats.config.ts, links.config.ts, github-snapshot.json
lib/                 gsap, lenis, github, i18n, sections, fonts, analytics, hooks
scripts/             next.mjs + exfat-readlink.cjs (see below), later generate-cv.ts, screenshots.ts
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
| `npm run cv` | (phase 6) render the 4 PDF CVs into `public/` – commit them |
| `npm run screenshots` | (phase 6) screenshots of projects with a live demo |

The repo lives on an exFAT drive locally (D:). There `fs.readlink()` throws EISDIR instead of EINVAL and breaks
webpack/Next.js – `scripts/next.mjs` preloads `scripts/exfat-readlink.cjs` on Windows. Keep using the npm scripts.

## Workflow

- Work in the phases of `docs/PROMPT.md` §9; after each phase stop and show the result.
- Conventional commits in English (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`, `test:`, `ci:`),
  small and logical – one commit = one change. **No `Co-Authored-By` trailers.**
- CI (`.github/workflows/ci.yml`): lint → typecheck → build → Playwright smoke tests on every push and PR.
- Accessibility: one `h1` (the name), sections with `aria-labelledby`, visible gold focus ring, animated text keeps a
  readable copy for screen readers, contrast >= 4.5 : 1 in both themes, everything keyboard-operable.
- Reduced motion: no pin/horizontal scroll, no Lenis, no marquee, no letter explosions, no WebGL ripples, no physics,
  no scramble – only fades <= 200 ms.
