Pokračuješ na mém CV/portfolio webu (Oldřich Jan Švehla, junior full-stack vývojář, Plzeň). Jsi senior creative
developer. Fáze 1–7 jsou hotové, teď je **fáze 8 – nasazení na Vercel + README**. Komunikuj česky.

## Přečti (nic dalšího)
1. `CLAUDE.md` – pravidla, stack, příkazy, struktura (je aktuální).
2. Paměť projektu, hlavně `tooling-quirks`.

## Stav
- Next.js 15 SSG/ISR, EN na `/` (`app/(en)`), CS na `/cs` (`app/cs`), sdílené v `app/_site`. Repo GitHub `ADCCZ/cv-oldjas`,
  větev `main`, CI zelené, 26 smoke testů. Lighthouse mobil lokálně: výkon 90–92, a11y/BP/SEO 100, LCP ~3,0–3,3 s
  (laboratorně; na Vercelu s brotli čekám ~2,7 s).
- Ostrý web **https://cv-oldjas-tan.vercel.app** zatím běží ze starého repa **ADCCZ/olda-web** (needitovat!). Adresa
  je v odeslaných přihláškách → musí zůstat, stejně jako kotvy (`CLAUDE.md`) a `/cv.pdf`, `/cv-plain.pdf`.
- Kód hlídá `process.env.VERCEL`: zapne `<Analytics/>` + `<SpeedInsights/>`, tiskové stránky `/cv/print/*` a `/og/*`
  vrátí 404. `lib/github.ts` čte volitelné `GITHUB_TOKEN` (jinak `content/github-snapshot.json`), ISR 1 h.

## Pravidla
- Před akcemi navenek (Vercel, push, nastavení) se zeptej. Po fázi se zastav, krátce shrň.
- Konvenční commity anglicky, malé, **nikdy `Co-Authored-By` ani zmínka o AI**. Stage explicitně – `logo.jpg`
  a `photo.webp` v kořeni nesmí do gitu. Commit s `git -c maintenance.auto=false -c gc.auto=0`.
- Každý nový text EN + CS. Změna obsahu v PDF → `npm run build && npm run cv`, commitnout PDF.
- Prostředí: soubory heredocem / malým Node patch skriptem; servery přes `preview_start` (`cv-prod` :3000);
  dev a build sdílí `.next` – před buildem ověř, že neběží dev (uživatel ho občas pouští na :3001).

## Fáze 8 – úkoly
1. Nejdřív mi **popiš klikání ve Vercelu** (nic nedělej sám): napojit `ADCCZ/cv-oldjas` na stávající projekt
   (Settings → Git, aby zůstala adresa), Node 24, nastavit `GITHUB_TOKEN` (fine-grained, jen čtení public repos),
   zapnout Web Analytics a Speed Insights. Počkej, až to udělám.
2. **README** (anglicky, rozšířit stávající): přidání projektu (`projects.config.ts`) a technologie
   (`stack.config.ts`), výměna coveru za screenshot (`npm run screenshots -- <id>`), `npm run cv`, `npm run og`,
   `npm run fonts` (nové znaky), `npm run lighthouse`, kde ve Vercelu zapnout analytiku, badge CI už tam je.
3. `content/stack.config.ts`: z „V plánu“ přesunout **Next.js (úroveň 2)** a **GitHub Actions (1)** do správných
   kategorií, přidat **Playwright (1)** (ikona ze simple-icons, pokud je); `usedIn: ["cv-oldjas"]` kde dává smysl.
   Pak `npm run build && npm run cv` a commit PDF.
4. Po přepnutí ověřit ostrý web: `/`, `/cs`, staré kotvy (`/#education` …), `/cv.pdf`, `/cv-plain.pdf`, 404 na
   `/cv/print/en/design` a `/og/en`, OG náhled (`/og.png`), PageSpeed Insights mobil na ostré adrese.

Konec fáze: lint, typecheck, build, `npm run test`, push (po souhlasu), CI zelené, krátké shrnutí.
