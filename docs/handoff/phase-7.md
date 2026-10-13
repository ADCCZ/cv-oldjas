# Prompt pro novou konverzaci – fáze 7 (doladění)

> Zkopíruj jako první zprávu do nové konverzace s Claude Code (pracovní složka `D:\My-Projects\cv-oldjas`).

Pokračuješ na mém CV/portfolio webu (Oldřich Jan Švehla, junior full-stack vývojář, Plzeň). Jsi senior creative
developer. Fáze 1–6 jsou hotové, teď je **fáze 7 – doladění: výkon, přístupnost, SEO, mobil**. Komunikuj česky.

## Přečti (nic dalšího)
1. `CLAUDE.md` – pravidla, stack, konvence.
2. `docs/PROMPT.md` – jen §6 (responzivita, výkon, a11y) a §7 (SEO a meta).
3. `docs/REFERENCES.md` – jen tabulka **Rozhodnutí** (má přednost před PROMPT.md).
4. Paměť projektu, hlavně `tooling-quirks`.

## Stav
- Jednostránkové portfolio, EN na `/`, CS na `/cs`: hero (WebGL tekutina + marquee jména), O mně (fotka, 3D kompas),
  čísla, projekty (horizontální pás, WebGL vlnky, screenshoty), stack (matter-js), co umím, cesta, mimo kód, kontakt.
  Next.js 15.5 SSG, React 19, Tailwind v4, GSAP + Lenis, R3F jen líně. First Load JS 181 kB.
- Fáze 6: `npm run screenshots`, tiskové stránky `/cv/print/{en,cs}/{design,plain}` (na Vercelu 404 kvůli telefonu),
  `npm run cv` → 4 PDF v `public/` (2 strany), fotka v O mně a v barevném CV. CI zelené, 25 testů.
- Ostrý web cv-oldjas-tan.vercel.app zatím běží ze starého repa ADCCZ/olda-web (neměnit), přepne se ve fázi 8.

## Pravidla
- Po fázi se zastav, krátce shrň a zeptej se na další. Před akcemi navenek se zeptej.
- Konvenční commity anglicky, malé. **Nikdy `Co-Authored-By` ani zmínku o AI.** Stage explicitně – `logo.jpg`
  a `photo.webp` v kořeni nesmí do gitu.
- 60/30/10, žádné mono písmo, ostré rohy, žádné vymyšlené údaje, anti-AI-look, hovery 0,2–0,4 s.
- Každý nový text EN + CS. Změna obsahu, který je v PDF → po buildu `npm run cv` a commitnout PDF.

## Prostředí (podrobně v paměti `tooling-quirks`)
- Soubory piš Bash heredocem (max. ~8 KB na příkaz), úpravy malým Node patch skriptem; Python není.
- Servery přes `preview_start` (`cv-dev` :3001, `cv-prod` :3000); dev a build sdílí `.next`, před buildem dev zastav.
  Před `npm run test` ověř, že na :3000 neběží starý server; po zkoušce jiného buildu smaž `.next/server/route-cache`.
- Commituj s `git -c maintenance.auto=false -c gc.auto=0`. Typecheck trvá přes 2 min.
- Headless: intro přeskoč `sessionStorage["cv:intro"]="1"`; skutečná GPU `--enable-gpu --use-angle=d3d11
  --ignore-gpu-blocklist` (+ `--force_low_power_gpu` = Intel iGPU, „běžný notebook“).

## Fáze 7 – úkoly
1. Lighthouse mobil proti `npm run start`: Performance ≥ 85, Accessibility ≥ 95, SEO 100, LCP < 2,5 s, CLS < 0,05.
   Lighthouse v projektu není – navrhni, jak ho spustit.
2. `/og.png` 1200×630 v designu webu a ověřit zbytek §7 (JSON-LD Person, hreflang, sitemap, robots, theme-color).
3. A11y audit: kontrast 4,5 : 1 v obou tématech, focus, klávesnice, čitelné kopie animovaného textu, jeden `h1`.
4. Mobil a breakpointy podle §6, reduced motion.
5. Známé věci: neexistující URL logují `NoFallbackError` (routa `[locale]` s `dynamicParams = false`); tekutina v hero
   má na dotykovém zařízení bez GPU ~19 fps (pod otevřeným menu se už WebGL uspí); výkon WebGL v Chromu na mém
   notebooku ještě není ověřený.
6. Volitelně (zeptej se): barevná PDF mají 733/818 kB, fotka s průhledností je v nich bezeztrátově – JPG verze
   podložená krémovou by ušetřila ~200 kB.

Konec fáze: lint, typecheck, build, `npm run test`, malé commity, push, CI zelené, krátké shrnutí, otázka na fázi 8.

## Potom – fáze 8
Nejdřív mi popsat klikání ve Vercelu (napojit ADCCZ/cv-oldjas na stávající projekt kvůli adrese), `GITHUB_TOKEN`,
Analytics + Speed Insights, README (přidání projektu a technologie, výměna coveru za screenshot, `npm run cv`,
`npm run screenshots`), ve `stack.config.ts` přesunout z „V plánu“ Next.js (úroveň 2), GitHub Actions (1) a přidat
Playwright (1) – a pak přegenerovat PDF.
