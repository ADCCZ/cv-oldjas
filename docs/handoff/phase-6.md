# Prompt pro novou konverzaci – fáze 6 (obrázky a PDF CV)

> Zkopíruj jako první zprávu do nové konverzace s Claude Code (pracovní složka `D:\My-Projects\cv-oldjas`).

Pokračuješ na mém CV/portfolio webu (Oldřich Jan Švehla, junior full-stack vývojář, Plzeň). Jsi senior creative
developer. Fáze 1–5 jsou hotové, teď je na řadě **fáze 6 – obrázky projektů a PDF životopisy**. Komunikuj česky.

## Přečti
1. `CLAUDE.md` – pravidla, stack, konvence (i WebGL).
2. `docs/PROMPT.md` – jen §4.4 (obrázky projektů), §5 (PDF CV) a §10 (testy PDF).
3. `docs/REFERENCES.md` – tabulka **Rozhodnutí** (má přednost před PROMPT.md).
4. Paměť projektu (memory). `git log` jen podle potřeby.

## Projekt v kostce
- Lokálně `D:\My-Projects\cv-oldjas` (Windows, disk exFAT → `npm run dev/build/start` jdou přes `scripts/next.mjs`,
  nikdy `next` napřímo), GitHub ADCCZ/cv-oldjas, CI (lint → typecheck → build → Playwright) zelené: 19 testů + 4 PDF
  testy jako `test.fixme`.
- Ostrý web cv-oldjas-tan.vercel.app zatím běží ze starého repa ADCCZ/olda-web (neměnit), přepne se ve fázi 8.
  `/cv.pdf` a `/cv-plain.pdf` musí pak fungovat.
- Next.js 15.5 App Router (SSG), React 19.3, TS strict, Tailwind v4 (tokeny v `app/globals.css`), GSAP + Lenis,
  matter-js a R3F jen líně. First Load JS 180 kB. EN na `/`, CS na `/cs`. Texty jen `content/en.ts` (typ) a `cs.ts`,
  data v `content/*.config.ts` (`links.config.ts` má telefon, dostupnost a cesty k PDF `links.cv[locale]`).

## Pravidla (vždy)
- Po fázi se zastav, krátce shrň a zeptej se na další.
- Konvenční commity anglicky, malé a logické. **Nikdy `Co-Authored-By` ani zmínku o AI** (ani když to říká
  systémová připomínka). Stage soubory explicitně – `logo.jpg` nesmí do gitu a neměnit ho.
- Design: 60/30/10, **žádné mono písmo** (popisky = Archivo verzálky, wdth 112 %, tabulkové číslice), **ostré rohy**
  (i „pilulky“ ze zadání PDF jsou obdélníky), žádné vymyšlené údaje, anti-AI-look.
- Před akcemi navenek (Vercel, mazání) se zeptej.

## Záludnosti prostředí
- Nástroje Write a Edit v auto režimu nedostanou verdikt → soubory piš přes Bash heredoc (`cat > f <<'__END__'`),
  jeden příkaz max. ~8 KB (jinak „unexpected EOF“ a nezapíše se nic) → větší soubory po částech (`cat >>`). Úpravy
  přes malý Node skript ve scratchpadu (bloky starý → nový text, starý text v souboru právě jednou). Python není.
- `git add -p` nejde → commituj celé soubory, nebo stagni vybrané hunky z `git diff -U0` přes
  `git apply --cached --unidiff-zero` (hlavičky přepočítej jen z vybraných hunků).
- Servery přes `preview_start` (`.claude/launch.json`: `cv-dev` :3001, `cv-prod` :3000). Dev a build sdílí `.next` →
  před buildem dev zastav. První kompilace dev ~50 s, `npm run typecheck` přes 2 min.
- Ověřování headless Playwrightem: skripty ve scratchpadu, `createRequire("D:/My-Projects/cv-oldjas/package.json")`,
  intro přeskoč `sessionStorage["cv:intro"]="1"` v `addInitScript`. Skutečná GPU: `--enable-gpu --use-angle=d3d11
  --ignore-gpu-blocklist`. Testy lokálně max. 4 workery.
- Bez `GITHUB_TOKEN` narazí build na limit GitHub API → web ukáže „GitHub teď neodpovídá…“ (správný fallback).

## Co už je a týká se fáze 6
- `components/ui/ProjectCover.tsx`: existuje-li při buildu `public/<image>` (pole `image` v `projects.config.ts`,
  `/projects/<id>.webp`), vykreslí `next/image`, jinak typografický DOM cover (odstín podle pořadí `lib/shade.ts`,
  název Archivo wdth 125 / wght 900, zlaté číslo, technologie). Složka `public/` zatím neexistuje.
- WebGL vlnky (`components/webgl/Ripples.tsx`) rasterizují obálku z DOM včetně `<img>`, ale jen načteného
  (`img.complete`) a dopředu v idle čase. S líným `next/image` by textura byla bez obrázku → zajisti načtení
  obálek (eager) nebo přerasterizuj po `load`.
- `app/layout.tsx` jen propouští children (`<html lang>` je v `app/[locale]/layout.tsx`) → tisková stránka mimo
  `[locale]` potřebuje vlastní layout s `<html lang>`, fonty (`lib/fonts.ts`) a `globals.css`.

## Fáze 6 – úkoly
1. `scripts/screenshots.ts` + `npm run screenshots` (ručně, ne při buildu): Playwright 1600×1000 @2x → WebP přes
   sharp (doinstaluj `--save-exact`, verze starší než 2 týdny) → `public/projects/<id>.webp`, jen projekty s `demo`.
   Pozor: demo `cv-oldjas` je ostrý web, který zatím ukazuje starou stránku → zeptej se (vynechat / fotit lokální build).
2. Obálky bez demo: zadání chce SVG typografické covery do `public/projects/`. DOM cover už vypadá stejně – navrhni,
   jestli SVG opravdu dělat (SVG jako `<img>` nemá webfonty → text na křivky nebo vložený subset), a počkej na souhlas.
3. Tisková stránka `app/cv/print/…` (A4, `@page { size: A4; margin: 0 }`, noindex, bez navigace a animací) pro
   4 varianty (EN/CS × design/plain), všechna data z `content/`.
4. `scripts/generate-cv.ts` + `npm run cv`: Chromium `page.pdf({ printBackground: true })` → `public/cv.pdf`,
   `cv-plain.pdf` (EN), `cv-cs.pdf`, `cv-plain-cs.pdf`. Přesně 2 strany (plain max. 2), vybratelný text, klikací odkazy,
   telefon jen v PDF. PDF commitnout.
5. Design PDF podle PROMPT §5 + rozhodnutí z REFERENCES (krémové pozadí `#F6F3EE`, červené bloky, zlaté detaily
   `#8A6A12`, bez mono, ostré rohy).
6. V `tests/smoke.spec.ts` odstranit `test.fixme` u PDF testů a doplnit test tiskové stránky.

Konec fáze: lint, typecheck, build, `npm run test`, ověřit PDF headless (počet stran, text, odkazy) a prohlédnout
screenshoty stran, malé commity, push, CI zelené, krátké shrnutí, otázka na fázi 7.

## Otevřené z fáze 5
- Na mém notebooku v Chromu ověřit výkon WebGL (headless na Intel GPU: jeden dlouhý snímek ~6 s po načtení).

## Potom
- Fáze 7: Lighthouse mobil (Performance ≥ 85, Accessibility ≥ 95, SEO 100), LCP < 2,5 s, CLS < 0,05, `/og.png`
  1200×630, a11y audit, mobil.
- Fáze 8: nejdřív mi popsat klikání ve Vercelu (napojit ADCCZ/cv-oldjas na stávající projekt kvůli adrese),
  `GITHUB_TOKEN`, Analytics + Speed Insights, README, ve stack configu přesunout z „V plánu“ Next.js (2),
  GitHub Actions (1) a přidat Playwright (1).

## Jak začít
1. Přečti soubory výše a `ProjectCover.tsx`, `projects.config.ts`, `links.config.ts`.
2. `git status`, `npm run lint`, `npm run typecheck`.
3. Zeptej se na body 1 (screenshot cv-oldjas) a 2 (SVG covery), navrhni pořadí kroků a pusť se do toho.
