# Prompt pro novou konverzaci – fáze 5 (WebGL)

> Zkopíruj celý tento soubor jako první zprávu do nové konverzace s Claude Code
> (pracovní složka `D:\My-Projects\cv-oldjas`). Obsahuje minulost, současný stav a plán projektu.

---

Pokračuješ na mém osobním CV/portfolio webu. Jsi senior creative developer (úroveň Awwwards SOTD).
Hotové jsou fáze 1–4, teď je na řadě **fáze 5 – WebGL**. Komunikuj se mnou česky.

## 1. Než začneš – povinné čtení

1. `CLAUDE.md` – pravidla projektu (stack, tokeny 60/30/10, písma, kotvy, příkazy, commity, konvence interakcí).
2. `docs/PROMPT.md` – původní kompletní zadání (sekce 0–10); pro fázi 5 hlavně §1, §4.1, §4.2, §4.4, §6, §9.
3. `docs/REFERENCES.md` – technický rozbor referencí (noth.in, griflan.com, juncastudio.com, leome-and-partners.com)
   s **parametry fluid simulace a vodní hladiny** a tabulka **Rozhodnutí**, která má přednost před `docs/PROMPT.md`.
4. `git log --oneline` – historie po malých konvenčních commitech (60+ commitů).
5. Tvoje paměť projektu (memory) – mé preference a záludnosti nástrojů z minulých sezení.

## 2. Projekt v kostce

- Lokálně `D:\My-Projects\cv-oldjas` (Windows, disk D: je externí SSD s **exFAT**), GitHub **ADCCZ/cv-oldjas** (veřejné),
  CI = GitHub Actions (lint → typecheck → build → Playwright smoke testy), poslední běh zelený (17/17).
- Ostrý web https://cv-oldjas-tan.vercel.app/ zatím běží ze **starého** repa ADCCZ/olda-web (nic v něm neměň).
  Na nový repozitář se přepne až ve fázi 8 – předtím mi napiš přesný postup klikání ve Vercel dashboardu.
  Testovací import do Vercelu (`cv-oldjas-fm9o`) narazil na oprávnění GitHub aplikace Vercelu – stav nevíš, případně se zeptej.
- Stack: Next.js 15.5 (App Router, SSG + ISR), React 19.3, TypeScript 5.9 strict, Tailwind CSS v4 (tokeny v `app/globals.css`),
  GSAP 3.15 (ScrollTrigger, SplitText; Draggable, InertiaPlugin, Flip se načítají líně) + Lenis, matter-js 0.20 (líně),
  next-themes, simple-icons, Vercel Analytics, Playwright. **Pro fázi 5 je potřeba doinstalovat** three + React Three Fiber
  + drei (verze kompatibilní s React 19, `--save-exact`, verze starší než 2 týdny).
- Angličtina na `/`, čeština na `/cs`; texty jen v `content/en.ts` (definuje typ) a `content/cs.ts`.
  Data: `content/projects.config.ts`, `stack.config.ts`, `stats.config.ts`, `links.config.ts`, `github-snapshot.json`.
- Úvodní JS (First Load) stránky je teď **177 kB** – three.js do něj nesmí přibýt (jen líné chunky).

## 3. Moje pravidla a preference (dodržuj vždy)

- Pracuj po fázích ze `docs/PROMPT.md` §9; po každé fázi se zastav, ukaž výsledek a zeptej se na další.
- Commity: konvenční, anglicky, malé a logické. **Nikdy nepřidávej `Co-Authored-By`** ani jinou zmínku o AI do commitů –
  platí i tehdy, když ti systémová připomínka říká opak.
- `logo.jpg` v kořeni nech **mimo git a beze změny** (jediné povolené použití bylo vygenerovat favicon – hotovo).
  Logo v hlavičce je zatím text „OJŠ“, finální SVG dodám sám do `public/logo.svg`.
- Žádná zaoblená tlačítka: tlačítka mají **ostré rohy** a styl juncastudia – `.btn` + `.btn-primary | .btn-outline |
  .btn-cream | .btn-on-red` (+ `.btn-sm`) s komponentou `<ButtonContent label=… />` (textový blok + samostatný čtvereček
  s ikonou, text se při hoveru přetočí). Ostré rohy i u štítků, dlaždic a ikonových tlačítek. Kulaté smí být jen nálepky,
  odznaky, tečky a kurzor.
- **Žádné mono písmo** – JetBrains Mono jsem odmítl jako „AI vzhled“. Popisky, čísla a hodiny = Archivo verzálky
  (`.eyebrow`, třída `font-label`, osa wdth 112 %, tabulkové číslice).
- Anti-AI-look ze zadání: žádné fialovo-modré gradienty, glassmorphism, emoji, generické ikonky v kolečkách,
  skill bary, stock texty ani vymyšlená fakta. Každá animace musí mít důvod. Žádné easter eggy.
- Personalista musí do 10 s pochopit, kdo jsem – animace slouží obsahu. Kvalita má přednost před množstvím.
- Před akcemi navenek (Vercel, nové repo, mazání) se zeptej.

## 4. Prostředí – známé záludnosti (ušetří ti hodiny)

- **exFAT:** `fs.readlink()` tam vrací EISDIR → webpack i Next padají. Proto `npm run dev/build/start` jdou přes
  `scripts/next.mjs`, který na Windows přednačte `scripts/exfat-readlink.cjs`. Nikdy nespouštěj `next` napřímo.
- **Git:** globální `safe.directory` pro repo už je nastavené, `git` i `git push` fungují napřímo. Stage soubory explicitně,
  ne `git add -A` (kvůli `logo.jpg`).
- **Bash nástroj:** jeden příkaz nad ~8 KB padá na „unexpected EOF while looking for matching `''“ → piš soubory po částech
  (`cat > f <<\__END__`, pak `cat >> f <<\__END__`). Nástroj Write občas v auto režimu nedostane verdikt – pak Bash.
  `npm run typecheck` je na exFAT pomalý (občas přes 2 min) – pouštěj s delším timeoutem.
- **Servery:** `.claude/launch.json` má `cv-dev` (dev, port 3001) a `cv-prod` (`npm run start`, port 3000) – spouštěj je
  přes `preview_start`, zastavuj `preview_stop`. `npm run dev` a `npm run build` sdílí `.next` – před buildem zastav dev server.
- **Ověřování animací:** vestavěný prohlížeč při skrytém okně nekreslí (rAF stojí). Používej headless Playwright: skript ve
  scratchpadu, `createRequire("D:/My-Projects/cv-oldjas/package.json")` → `@playwright/test`, `sessionStorage["cv:intro"]="1"`
  přes `addInitScript`, screenshoty si prohlédni. Proti dev serveru čekej na `load`, ne na `networkidle` (HMR websocket).
- **WebGL a headless:** headless Chromium kreslí WebGL softwarově (SwiftShader) – fps z něj nejsou reprezentativní.
  Vizuál ověřuj headless screenshoty, výkon v reálném prohlížeči (případně mě požádej o kontrolu na mém notebooku).
- **Testy:** lokálně max. 4 workery (`playwright.config.ts`), víc soupeří o CPU a padá na timeout. Smoke testy přeskakují intro
  přes `sessionStorage`; intro má vlastní test. Komponenty, které se mountují až po hydrataci (kurzor), testuj přes `toPass()`.
- Lokální buildy často narazí na limit GitHub API bez tokenu → web ukáže „GitHub teď neodpovídá…“ (správný fallback).

## 5. Co je hotové

- **Fáze 1:** projekt, tokeny, fonty, témata (dark výchozí, respektuje systém), i18n (cookie `lang`, `/en` → `/`,
  žádný redirect podle prohlížeče), všechny sekce s finálním obsahem EN/CS, GitHub data přes server fetch s ISR 1 h
  a snapshotem, SEO (canonical, hreflang, sitemap, robots, JSON-LD), dvojjazyčná 404, analytika (jen na Vercelu), CI.
  Kotvy `#top #about #stats #projects #stack #skills #journey #off-code #contact` + skryté aliasy
  `#education #experience #leadership` (nikdy nepřejmenovávat – odkazy jsou v odeslaných žádostech).
- **Fáze 2:** kompaktní hlavička (seznam vlevo se po hero sbalí do MENU ::), fullscreen menu (focus trap, Esc, zámek scrollu,
  `inert`), linkovaná mřížka nadpisů (`SectionHeading`), responzivní Cesta, favicon z loga.
- **Fáze 3 (GSAP):** intro loader (`Intro.tsx`, `html[data-intro]` = play | replay | skip), hero (`HeroMotion`: marquee řízené
  rychlostí scrollu, písmena vyjedou v náhodném pořadí, pin + 3D rozpad písmen, About najede přes pinnuté hero),
  About (`AboutMotion`: nadpis z rozházených písmen, text se zabarvuje po slovech), `MotionRoot` (odhalení nadpisů po řádcích,
  zkosení podle rychlosti, progress bar), projekty (`ProjectsMotion`: pin + horizontální posun, počítadlo, paralaxa obálek
  `data-parallax`), Cesta (`JourneyMotion` + `ScrambleText`), count-up čísel, vstup písmen ŠVEHLA, scramble kontaktů.
  Po fázi 3: ostrá tlačítka `.btn` + `ButtonContent`, žádné mono písmo, šedý grain.
- **Fáze 4 (interakce)** – efekty vázané na myš běží jen s jemným ukazatelem, všechno jen s plným pohybem
  (reduced motion = statický, plně čitelný stav):
  - **Kurzor** (`components/layout/Cursor.tsx`): zlatá tečka + kruh s lerpem (`difference`), nad odkazy větší, nad `.btn`
    ustoupí, nad obálkami projektů červený blok „VIEW PROJECT ↗“, nad taženými prvky „DRAG ↔“ (texty v `t.cursor`).
    Stavy se deklarují v markupu: `data-cursor="view|drag"`, červené plochy `data-surface="red"` (tam je kruh krémový bez blendu,
    jinak by se zbarvil do azurova). Při scrollu pod klidnou myší kurzor sám přetestuje, co je pod ním.
  - **Magnetická tlačítka** (`components/motion/MagneticButtons.tsx`): všechna `.btn`, přes CSS proměnné `--mag-x/--mag-y`
    a vlastnost `translate` (nikdy GSAP `x/y` na `.btn`), text o polovinu víc, návrat `elastic.out`.
  - **Driftující pásy** (`components/motion/DriftStrip.tsx`): nativní scroller `[data-strip]` se třemi kopiemi
    `[data-strip-copy]` (klon, originál, klon), sám jede, myší jde chytit a hodit (Draggable + rychlost z InertiaPlugin,
    hod plynule doběhne do driftu), dotyk/trackpad/klávesnice scrollují nativně, nad pásem zpomalí na 35 %.
    Pás čísel (`#stats`, klony `aria-hidden` + `inert`) a Mimo kód (`#off-code`, karty ve dvou řadách, v každé kopii
    dvakrát s prohozenými barvami, odkazy v klonech `aria-hidden` + `tabIndex=-1`, `dragClickables: false`).
  - **Nálepky** (`components/motion/StatsPills.tsx`, matter-js líně): pilulky Ship it!/Merged!/Done! padají při pohybu myši,
    kupí se na podlaze a jedou s pásem (`STRIP_MOVE_EVENT`), max 6–14.
  - **Fyzikální hromádka Stacku** (`components/motion/StackPhysics.tsx`): dlaždice (skutečné `TechPill`) spadnou do krabice
    nejmenší první, myší se dají hodit, „Sort / Seřadit“ je GSAP Flipem srovná do mřížky, „Scatter / Rozházet“ je vyhodí zpět.
    **Krabice má přesně výšku seřazené mřížky** → přepnutí nikdy nemění výšku stránky (kotvy pod ní zůstávají).
  - Patička: písmeno ŠVEHLA se smrskne na 5 % a pružně vrátí. Karty Co umím: výplň roste jako čtverec z pravého horního rohu,
    šipka bez čtverečku ↗ → ↙. Archiv: červená výplň zleva, rozbalení na hover (intent 90 ms), klik/Enter připne,
    nativní `<details>` zůstal. Ikonka tématu: morph přes GSAP (next-themes při přepnutí vypíná CSS transitions).
  - Testy doplněné o kurzor, klony pásu, Sort/Scatter bez změny výšky, archiv z klávesnice, dotyk a reduced motion.

**Vzor pro animační kód:** klientské „controller“ komponenty v `components/motion/` renderují skrytý `<span ref>` nebo
`return null`, najdou si sekci přes `closest()`, vše běží v `gsap.matchMedia()` pod `MOTION_OK` / `FINE_POINTER` / `MD_UP`
(`lib/motion.ts`), SplitText až po `afterFonts()`, cleanup je ruční. Pluginy jen v `lib/gsap.ts` (líně přes `loadDraggable()`
/ `loadFlip()`), těžké knihovny dynamickým `import()`. Media query v Reactu: `lib/useMediaQuery.ts` (server snapshot `false`).
Vše jede na `gsap.ticker` (Lenis i ScrollTrigger jsou na něm) – nezakládej vlastní rAF smyčky.

## 6. Otevřené otázky z fáze 4 (zeptej se mě hned na začátku, krátce)

Na shrnutí fáze 4 jsem zatím neodpověděl. Tato rozhodnutí udělal Claude sám:
1. Na tabletu padá všech 44 dlaždic (místo „méně těles“ ze zadání) – vejdou se a jsou čitelné. Ponechat, nebo zredukovat?
2. Nad červenými plochami je kruh kurzoru krémový bez `difference`; karty Co umím mají čtvercovou výplň (leome) místo kruhové;
   driftující pásy nad myší zpomalí na 35 %. Jsou OK?

## 7. Fáze 5 – co udělat (zadání + odsouhlasená rozhodnutí)

Všechny tři efekty jsou podle `docs/PROMPT.md` §9 **bonus**: když nedosáhnou kvality (pod 50 fps na běžném notebooku,
vizuálně nedotažené), použij fallback a napiš mi proč. Reduced motion = žádné WebGL efekty. Nové texty do `en.ts` i `cs.ts`.

**Architektura**
- Jeden sdílený fixní R3F `<Canvas>` přes celou stránku (`components/webgl/Scene.tsx`, `pointer-events: none`) + drei `<View>`
  navázané na DOM prvky (hero, obálky projektů, kompas) – žádné další canvasy.
- Načíst přes `next/dynamic` se `ssr: false` až po LCP (hero nadpis je HTML text a LCP musí zůstat textem), jen s plným
  pohybem a dostupným WebGL; bez WebGL tiše fallback. three.js nesmí do First Load JS (teď 177 kB) – zkontroluj výstup buildu.
- Synchronizace: Lenis a ScrollTrigger běží na `gsap.ticker` – zvaž `frameloop="never"` a `advance()` z tickeru, ať je WebGL ve
  stejném snímku jako scroll. Pauza, když žádný View není ve viewportu nebo je záložka skrytá. `dpr` max 2, na mobilu `[1, 1.5]`.
- **Pozor na překryvy:** jeden fixní canvas leží nad obsahem, ale About najíždí přes pinnuté hero (`z-10`) – WebGL hero vrstva
  nesmí kreslit přes About (zeslab/vypni ji s rozpadem písmen, případně ořízni scissor po horní hranu About). Header (z-50),
  menu (z-60), grain (z-100) a kurzor (z-300) musí zůstat nad canvasem.

**1. Odkrývání v hero jako noth.in** (§4.1, rozhodnutí v REFERENCES)
- WebGL simulace tekutiny (stable fluids): advekce, divergence, 20 Jacobiho iterací tlaku, odečtení gradientu; myš stříká
  rychlost i barvivo (`splatForce 5900`, `splatRadius 6e-5`); simulace 256², barvivo 512²; útlum rychlosti 0,962, barviva 0,988
  za snímek; maska `smoothstep(0.5, 0.51, dye * 3.9)` → ostrý, ale organický okraj.
- Barvivo odkrývá **druhou vrstvu**: červená plocha + jméno s červeno-zlatým kovovým shaderem (pomalu se hýbe). Spodní vrstva
  = dnešní DOM hero; WebGL kreslí jen odkrytou vrstvu (alfa = maska), mimo blob nic.
- Jméno v odkryté vrstvě musí pixelově sedět na DOM marquee, které `HeroMotion` posouvá každý snímek podle rychlosti scrollu –
  sdílej pozici marquee (např. malý store v `lib/`, který HeroMotion zapisuje) a text vykresli do textury až po načtení fontů
  (Archivo 900, verzálky, latin-ext „ŘŠČŽĚŮ“). Při scrollovém rozpadu písmen vrstvu plynule zhasni.
- Mobil: blob se pohybuje sám po Lissajousově křivce. Fallback: SVG maska nebo jen čistý text.

**2. Vlnky na obálkách projektů jako juncastudio** (§4.4)
- Výšková simulace hladiny (ping-pong FBO 256²): kapky z kurzoru (raised-cosine, poloměr 0,032, síla 0,12), vlnová rovnice
  přes 9bodový Laplacián, útlum 0,977, 2 kroky za snímek. Render: refrakce 2,4 (u okrajů 8 % utlumená), disperze RGB 0,6,
  stínování podle normály 0,4, Blinn-Phong odlesk se světlem nad kurzorem (0,25, lesk 80), kaustiky 1,4. Klidná hladina =
  jediné čtení textury.
- Obálky jsou zatím typografické DOM komponenty (`components/ui/ProjectCover.tsx`, odstín podle pořadí přes `lib/shade.ts`);
  skutečné obrázky přijdou až ve fázi 6 (`public/projects/<id>.webp`, SVG obálky). **Navrhni mi, odkud vzít texturu**
  (např. vykreslit stejný typografický cover do 2D canvasu, nebo z fáze 6 předsunout SVG obálky) a počkej na souhlas.
- Zachovej paralaxu (`data-parallax`, pinnutý horizontální pás), klik na obálku = DOM odkaz, kurzor „VIEW PROJECT“ už existuje.
  Jen myš (na dotyku žádné vlnky). Fallback: jednoduchý scale + RGB posun v CSS.

**3. 3D kompas v About** (§4.2)
- R3F, low-poly, černý kov se zlatými detaily a červenou střelkou; rotuje podle scrollu, střelka se pokaždé otočí k jednomu
  z faktů (`t.about.facts`, dnes seznam pod kompasem – aktivní fakt zvýrazni), lehký tilt podle myši. Na tabletu menší.
- Dnešní `components/ui/CompassSvg.tsx` (má prop `needleRotation`) je fallback pro reduced motion / bez WebGL – i on může
  dostat otáčení střelky přes GSAP.

**Na konci fáze:** lint, typecheck, build (zkontroluj First Load JS), `npm run test` (doplň testy: canvas se s reduced motion
nevykreslí, stránka bez chyb v konzoli i bez WebGL), headless screenshoty (desktop, mobil, světlé/tmavé, reduced motion),
měření fps v reálném prohlížeči, malé commity, push, CI zelené, krátké shrnutí (včetně případných fallbacků a proč) a otázka
na fázi 6.

## 8. Co přijde potom

- **Fáze 6 – obrázky a CV:** `scripts/screenshots.ts` (Playwright, 1600×1000 @2x → WebP přes sharp), SVG typografické obálky
  do `public/projects/` (screenshot se stejným jménem je automaticky nahradí), tisková stránka `app/cv/print/page.tsx`,
  `scripts/generate-cv.ts` → `public/cv.pdf`, `cv-plain.pdf`, `cv-cs.pdf`, `cv-plain-cs.pdf` (přesně 2 strany, vybratelný text,
  klikací odkazy, telefon jen v PDF), odstranit `test.fixme` u PDF testů. Design PDF podle `docs/PROMPT.md` §5 – bez mono písma.
- **Fáze 7 – doladění:** Lighthouse mobil Performance ≥ 85 / Accessibility ≥ 95 / SEO 100, LCP < 2,5 s, CLS < 0,05
  (úvodní JS je 177 kB kvůli GSAP + SplitText – zvážit odložení), OG obrázek `/og.png` 1200×630, a11y audit, mobil.
- **Fáze 8 – nasazení:** nejdřív mi popsat klikání ve Vercelu (napojit ADCCZ/cv-oldjas na stávající projekt, aby zůstala
  adresa cv-oldjas-tan.vercel.app; `/cv.pdf` a `/cv-plain.pdf` musí fungovat), `GITHUB_TOKEN`, zapnout Analytics a Speed Insights,
  kompletní README (přidání projektu/technologie, výměna obálky za screenshot, `npm run cv`), ve stack configu přesunout
  z „V plánu“: Next.js (2), GitHub Actions (1) a nově Playwright (1).

## 9. Jak začít

1. Přečti soubory z bodu 1 a projdi `components/motion/` (hlavně `HeroMotion`, `AboutMotion`, `ProjectsMotion`),
   `components/sections/Hero.tsx`, `About.tsx`, `Projects.tsx`, `components/ui/ProjectCover.tsx`, `CompassSvg.tsx`
   a `app/globals.css`.
2. Ověř stav: `git status`, `npm run lint`, `npm run typecheck`.
3. Polož mi otázky z bodu 6 a návrh zdroje textur pro vlnky (bod 7.2).
4. Navrhni krátce pořadí kroků fáze 5 (doporučení: nejdřív sdílený Canvas + View a měření výkonu, pak hero, kompas, vlnky)
   a pusť se do toho – commituj průběžně po logických částech.
