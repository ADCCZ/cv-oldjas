# Prompt pro novou konverzaci – fáze 4 (interakce)

> Zkopíruj celý tento soubor jako první zprávu do nové konverzace s Claude Code
> (pracovní složka `D:\My-Projects\cv-oldjas`). Obsahuje minulost, současný stav a plán projektu.

---

Pokračuješ na mém osobním CV/portfolio webu. Jsi senior creative developer (úroveň Awwwards SOTD).
Hotové jsou fáze 1–3, teď je na řadě **fáze 4 – interakce**. Komunikuj se mnou česky.

## 1. Než začneš – povinné čtení

1. `CLAUDE.md` – pravidla projektu (stack, tokeny 60/30/10, písma, kotvy, příkazy, commity).
2. `docs/PROMPT.md` – původní kompletní zadání (sekce 0–10).
3. `docs/REFERENCES.md` – technický rozbor referencí (noth.in, griflan.com, juncastudio.com,
   leome-and-partners.com) a tabulka **Rozhodnutí**, která má přednost před `docs/PROMPT.md`.
4. `git log --oneline` – historie po malých konvenčních commitech.
5. Tvoje paměť projektu (memory) – mé preference z minulých sezení.

## 2. Projekt v kostce

- Lokálně `D:\My-Projects\cv-oldjas` (Windows, disk D: je externí SSD s **exFAT**), GitHub **ADCCZ/cv-oldjas** (veřejné),
  CI = GitHub Actions (lint → typecheck → build → Playwright smoke testy), zatím vše zelené.
- Ostrý web https://cv-oldjas-tan.vercel.app/ zatím běží ze **starého** repa ADCCZ/olda-web (nic v něm neměň).
  Na nový repozitář se přepne až ve fázi 8 – předtím mi napiš přesný postup klikání ve Vercel dashboardu.
  Zkoušel jsem nové repo naimportovat do Vercelu jako samostatný testovací projekt (`cv-oldjas-fm9o`);
  bránila tomu oprávnění GitHub aplikace Vercelu – stav nevíš, případně se zeptej.
- Stack: Next.js 15.5 (App Router, SSG + ISR), React 19, TypeScript 5.9 strict, Tailwind CSS v4 (tokeny v `app/globals.css`),
  GSAP 3.15 (ScrollTrigger, SplitText) + Lenis, next-themes, simple-icons, Vercel Analytics, Playwright.
  Připravené/plánované: matter-js (fáze 4), React Three Fiber + drei (fáze 5).
- Angličtina na `/`, čeština na `/cs`; texty jen v `content/en.ts` (definuje typ) a `content/cs.ts`.
  Data: `content/projects.config.ts`, `stack.config.ts`, `stats.config.ts`, `links.config.ts`, `github-snapshot.json`.

## 3. Moje pravidla a preference (dodržuj vždy)

- Pracuj po fázích ze `docs/PROMPT.md` §9; po každé fázi se zastav, ukaž výsledek a zeptej se na další.
- Commity: konvenční, anglicky, malé a logické. **Nikdy nepřidávej `Co-Authored-By`** ani jinou zmínku o AI do commitů.
- `logo.jpg` v kořeni nech **mimo git a beze změny** (jediné povolené použití bylo vygenerovat favicon – hotovo).
  Logo v hlavičce je zatím text „OJŠ“, finální SVG dodám sám do `public/logo.svg`.
- Žádná zaoblená tlačítka: tlačítka mají **ostré rohy** a styl juncastudia – `.btn` + `.btn-primary | .btn-outline |
  .btn-cream | .btn-on-red` (+ `.btn-sm`) s komponentou `<ButtonContent label=… />` (textový blok + samostatný čtvereček
  s ikonou, text se při hoveru přetočí). Ostré rohy i u štítků, dlaždic a ikonových tlačítek. Kulaté smí být jen nálepky,
  odznaky a tečky.
- **Žádné mono písmo** – JetBrains Mono jsem odmítl jako „AI vzhled“. Popisky, čísla a hodiny = Archivo verzálky
  (`.eyebrow`, třída `font-label`, osa wdth 112 %, tabulkové číslice). Totéž platí pro všechny podobné drobné popisky.
- Anti-AI-look ze zadání: žádné fialovo-modré gradienty, glassmorphism, emoji, generické ikonky v kolečkách,
  skill bary, stock texty ani vymyšlená fakta. Každá animace musí mít důvod. Žádné easter eggy.
- Personalista musí do 10 s pochopit, kdo jsem – animace slouží obsahu.
- Před akcemi navenek (Vercel, nové repo, mazání) se zeptej.

## 4. Prostředí – známé záludnosti (ušetří ti hodiny)

- **exFAT:** `fs.readlink()` tam vrací EISDIR → webpack i Next padají. Proto `npm run dev/build/start` jdou přes
  `scripts/next.mjs`, který na Windows přednačte `scripts/exfat-readlink.cjs`. Nikdy nespouštěj `next` napřímo.
- **Git „dubious ownership“** (exFAT neukládá vlastníka): používej `git -c safe.directory=D:/My-Projects/cv-oldjas …`,
  pro push `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=D:/My-Projects/cv-oldjas git push`
  (pokud jsem mezitím nenastavil globální `safe.directory`). Stage soubory explicitně, ne `git add -A`.
- **Bash nástroj:** dlouhé heredocy (zhruba nad 8 KB) padají na „unexpected EOF“ → piš soubory po částech přes
  `cat > soubor <<\__END__` a `cat >> soubor <<\__END__`. Nástroj Write občas v auto režimu nedostane verdikt – pak Bash.
- **Vestavěný prohlížeč:** když je okno aplikace skryté, stránka nekreslí a `requestAnimationFrame` stojí → GSAP vypadá
  „zamrzle“. Animace ověřuj headless Playwrightem: skript ve scratchpadu, `createRequire("D:/My-Projects/cv-oldjas/package.json")`
  → `@playwright/test`, produkční build na :3000, screenshoty si pak prohlédni. Konzole v panelu prohlížeče se sčítá přes reloady.
- `npm run dev` a `npm run build` sdílí `.next` – před buildem zastav dev server. Testy znovu použijí server na :3000
  (případný starý ukonči: `netstat -ano | grep :3000` → `taskkill //PID … //T //F`).
- Lokální buildy často narazí na limit GitHub API bez tokenu → web ukáže „GitHub teď neodpovídá…“ (to je správný fallback).
  Na Vercelu nastavíme `GITHUB_TOKEN`.
- Smoke testy přeskakují intro přes `sessionStorage["cv:intro"] = "1"` (`addInitScript`); intro má vlastní test.

## 5. Co je hotové (fáze 1–3 + úpravy)

- **Fáze 1:** projekt, tokeny, fonty, témata (dark výchozí, respektuje systém), i18n (cookie `lang`, `/en` → `/`,
  žádný redirect podle prohlížeče), všechny sekce s finálním obsahem EN/CS, GitHub data přes server fetch s ISR 1 h
  a snapshotem, SEO (canonical, hreflang, sitemap, robots, JSON-LD), dvojjazyčná 404, analytika (jen na Vercelu),
  CI + smoke testy. Kotvy `#top #about #stats #projects #stack #skills #journey #off-code #contact` + skryté aliasy
  `#education #experience #leadership` (nikdy nepřejmenovávat – odkazy jsou v odeslaných žádostech).
- **Fáze 2:** kompaktní hlavička (seznam vlevo se po hero sbalí do MENU ::), fullscreen menu (focus trap, Esc, zámek scrollu,
  `inert`), linkovaná mřížka nadpisů (`SectionHeading`), responzivní Cesta, favicon z loga.
- **Fáze 3 (GSAP):**
  - Intro loader (`components/layout/Intro.tsx`) – „OJ ▢ Š“, flipbook log technologií, odpočet 100→000, opona;
    inline skript v `app/[locale]/layout.tsx` nastaví `html[data-intro]` = play | replay | skip ještě před vykreslením
    (skip pro deep link a reduced motion); jakýkoli vstup intro 3× zrychlí.
  - Hero (`components/motion/HeroMotion.tsx`): marquee řízené rychlostí scrollu (Lenis velocity), písmena po intru vyjedou
    v náhodném pořadí, při scrollu pin + 3D rozpad písmen, přes hero najede About (`pinSpacing: false`, About má `z-10 bg-bg`).
  - About (`AboutMotion`): nadpis se poskládá z rozházených písmen, text se zabarvuje po slovech (`--reveal` + color-mix).
  - `MotionRoot`: odhalení nadpisů po řádcích (`data-reveal="lines"`), zkosení nadpisů podle rychlosti (`data-skew`),
    červený progress bar.
  - Projekty (`ProjectsMotion`): od md pin + horizontální posun, počítadlo `01 / 07`, paralaxa obálek (`data-parallax`);
    mobil = swipe, reduced motion = svislý seznam.
  - Cesta (`JourneyMotion` + `ScrambleText`): sticky složky (výšky klesají o lištu, max 34rem), scramble nadpisů,
    blednutí zakryté složky.
  - Count-up čísel (`StatsMotion`), vstup písmen ŠVEHLA v patičce (`FooterMotion`), scramble kontaktů.
- **Úpravy po fázi 3:** ostrá tlačítka `.btn` + `ButtonContent`, žádné mono písmo, šedý grain.

**Vzor pro animační kód:** klientské „controller“ komponenty v `components/motion/` renderují skrytý `<span ref>`, najdou si
sekci přes `closest()`, vše běží v `gsap.matchMedia()` pod `MOTION_OK` (`lib/motion.ts`), SplitText až po `afterFonts()`
a cleanup je ruční (kill tweenů, `split.revert()`). Pluginy registruj jen v `lib/gsap.ts`. Scroll zámek: `lockScroll/unlockScroll`
v `lib/lenis.ts`. Hooky pro reduced motion: `lib/useReducedMotion.ts`.

## 6. Fáze 4 – co udělat (zadání + odsouhlasená rozhodnutí)

Kvalita má přednost před množstvím. Vše vypnout při `prefers-reduced-motion` a na dotyku tam, kde to dává smysl.
Nové texty (např. popisky kurzoru) vždy do `en.ts` i `cs.ts`.

1. **Kurzor** (`components/layout/Cursor.tsx`, §3.3): malá zlatá tečka + kruh s lerpem, `mix-blend-mode: difference`.
   Nad odkazy se kruh zvětší. Nad obálkami projektů se změní na tlačítko ve stylu juncastudia – červený blok
   „VIEW PROJECT“ / „ZOBRAZIT PROJEKT“ + čtvereček „↗“, jde za kurzorem s lerpem ~0,18. Nad taženými prvky „DRAG“ / „TÁHNI“.
   Vypnout na `(pointer: coarse)` a s reduced motion.
2. **Magnetická tlačítka** (§3.4): všechna `.btn` – přitahování v okruhu ~80 px, max posun 12 px, text uvnitř o polovinu víc,
   návrat `elastic.out`. Pozor, ať to nerozbije hover „přetočení“ textu.
3. **Pás čísel jako griflan** (`#stats`): nativní horizontální scroller, sám pomalu jede (~30 px/s), dá se chytit a táhnout
   myší (na dotyku nativně), nekonečná smyčka z klonů (`aria-hidden` + `inert`). Count-up musí fungovat i s klony.
   **Nálepky jako griflan** (matter-js): při pohybu myši nad pásem vznikají pilulky s texty ze `stats.stickers`
   (Ship it!, Merged!, Done!/Hotovo!), červený text, 2px červený obrys, náhodný úhel a rychlost podle pohybu myši, padají
   (gravitace ~2) a kupí se na neviditelné podlaze, ležící jedou s pásem, max 6–14, nejstarší mizí. Mobil a reduced motion
   bez nálepek. Současné statické kulaté nálepky (`components/ui/Sticker.tsx`) tím nahraď.
4. **Mimo kód jako griflan** (`#off-code`): pootočené karty (±4–6°) ve dvou výškových řadách přes sebe plynou samy v pásu,
   celý pás jde chytit a táhnout (kurzor „DRAG“), smyčka z klonů; hover = zvednutí (stín + scale 1,03). Krémové/červené
   střídání, kulatý odznak s ikonou a odkazy zůstávají.
5. **Patička jako noth.in:** `mouseenter` na písmeno ŠVEHLA → `scale 0.05` (0,6 s `power2.inOut`) → `scale 1`
   (1,8 s `elastic.out(1, 0.8)`), během animace se znovu nespouští. Vstupní animace už existuje (`FooterMotion`).
6. **Fyzikální hromádka technologií** (§4.5, matter-js): když `#stack` vjede do viewportu, dlaždice spadnou shora a nakupí se
   na dně sekce, dají se chytit, táhnout a hodit, odráží se od stěn. DOM dlaždice synchronizované s tělesy (velikost = úroveň,
   úroveň 4 zlatý obrys, „V plánu“ čárkovaně, tooltipy zůstávají). Tlačítko „Sort / Seřadit“ → GSAP Flip do mřížky podle
   kategorií s legendou; znovu → rozházet. Tablet = méně těles, mobil a reduced motion = jen mřížka (dnešní stav).
7. **Karty Co umím jako leome** (§4.6): výplň vyroste z pravého horního rohu (leome škáluje čtverec, my máme kruhový
   clip-path – sjednoť na lepší z obou), šipka ↗ → ↙, seznam najede po řádcích, na dotyku klepnutí (už existuje).
8. **Archiv semestrálek** (§4.4): hover na řádek → červená výplň zleva (clip-path) a rozbalení popisu; zachovej
   přístupnost dnešního `<details>`.
9. Zkontroluj morph ikonky tématu a celkový hover polish. GSAP pluginy (Draggable, InertiaPlugin, Flip) registruj
   v `lib/gsap.ts`.

Na konci fáze: lint, typecheck, build, `npm run test` (případně doplň testy), ověření headless screenshoty (desktop, mobil,
světlé/tmavé, reduced motion), malé commity, push, CI zelené, krátké shrnutí a otázka na fázi 5.

## 7. Co přijde potom

- **Fáze 5 – WebGL** (jeden sdílený fixní R3F `<Canvas>` + drei `<View>`, načítat přes `next/dynamic` se `ssr: false` až po LCP,
  pauza mimo viewport): odkrývání v hero jako noth.in (simulace tekutiny, barvivo jako maska odkrývá druhou vrstvu =
  červená plocha + písmo s červeno-zlatým kovovým shaderem, parametry v `docs/REFERENCES.md`; na mobilu blob po Lissajousově
  křivce), vlnky na obálkách projektů jako juncastudio (výšková simulace hladiny, refrakce, disperze RGB, odlesk, kaustiky),
  3D kompas v About (střelka míří na fakta, tilt podle myši). Bonusové efekty – když nedosáhnou kvality (pod 50 fps),
  fallback a vysvětlit proč.
- **Fáze 6 – obrázky a CV:** `scripts/screenshots.ts` (Playwright, 1600×1000 @2x → WebP přes sharp), SVG typografické obálky
  do `public/projects/` (screenshot se stejným jménem je automaticky nahradí), tisková stránka `app/cv/print/page.tsx`,
  `scripts/generate-cv.ts` → `public/cv.pdf`, `cv-plain.pdf`, `cv-cs.pdf`, `cv-plain-cs.pdf` (přesně 2 strany, vybratelný text,
  klikací odkazy, telefon jen v PDF), odstranit `test.fixme` u PDF testů. Design PDF podle `docs/PROMPT.md` §5 – bez mono písma.
- **Fáze 7 – doladění:** Lighthouse mobil Performance ≥ 85 / Accessibility ≥ 95 / SEO 100, LCP < 2,5 s, CLS < 0,05
  (úvodní JS je teď 172 kB kvůli GSAP + SplitText – zvážit odložení), OG obrázek `/og.png` 1200×630, a11y audit, mobil.
- **Fáze 8 – nasazení:** nejdřív mi popsat klikání ve Vercelu (napojit ADCCZ/cv-oldjas na stávající projekt, aby zůstala
  adresa cv-oldjas-tan.vercel.app; `/cv.pdf` a `/cv-plain.pdf` musí fungovat), `GITHUB_TOKEN`, zapnout Analytics a Speed Insights,
  kompletní README (přidání projektu/technologie, výměna obálky za screenshot, `npm run cv`), ve stack configu přesunout
  z „V plánu“: Next.js (2), GitHub Actions (1) a nově Playwright (1).

## 8. Jak začít

1. Přečti soubory z bodu 1 a projdi kód v `components/motion/`, `components/sections/` a `app/globals.css`.
2. Ověř stav: `git status`, `npm run lint`, `npm run typecheck`.
3. Navrhni mi krátce pořadí kroků fáze 4 a pusť se do toho – commituj průběžně po logických částech.
