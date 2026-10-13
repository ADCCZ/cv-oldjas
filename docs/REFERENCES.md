# Reference – co se nám na nich líbí a jak je to postavené

Zjištěno přímo z živých webů (DOM, CSS a jejich JS bundly) 12. 10. 2026. Slouží jako technický podklad pro fáze 3–5.
Nic se nekopíruje – přebíráme princip a ladíme ho do našeho designu a palety.

## noth.in (Webflow + GSAP 3.13 + Three.js)

**Hero – odkrývání pod kurzorem (obr. 1)**
- Není to maska v písmenech, ale **WebGL simulace tekutiny** (stable fluids): advekce, divergence, 20 Jacobiho iterací tlaku,
  odečtení gradientu. Myš do ní „stříká“ rychlost i barvivo (`splatForce 5900`, `splatRadius 6e-5`).
- Rozlišení: simulace 256², barvivo 512². Útlum: rychlost 0,962, barvivo 0,988 za snímek → stopa pomalu doteče a zmizí.
- Maska = `smoothstep(0.5, 0.51, dye * 3.9)` → ostrý, ale organický okraj „kapaliny“.
- Výstup: `mix(baseTexture, revealTexture, mask)` – base = hero převedené ze SVG do textury (bílá plocha + černé písmo),
  reveal = video (pěna tvořící nápis na černé). Blob tedy odkrývá **celou druhou vrstvu**, i mimo písmena.
- Textové UI nad tím má `mix-blend-mode: difference`.

**Nástupní animace (oblíbená)**
- Loader (1× za session, `sessionStorage`): „N“ vyjede z masky, apostrof naskočí, okénko uprostřed se roztáhne
  (1rem → 20rem) a běží v něm flipbook; počítadlo 100 → 000; po ~5 s loader sjede nahoru (height → 0, 1,8 s `power4.inOut`).
- Nápis: písmena vyjíždějí zespodu **v náhodném pořadí** – `yPercent 120 → 0`, 1,8 s, `power4.inOut`, stagger 0,07,
  apostrof nakonec `scale 0 → 1` s `back.out(0.9)`.
- Texty obecně: SplitText s maskou – řádky `yPercent 100 → 0`, 1 s, `power4.inOut`, stagger 0,05 (spouští se na `top 95%`),
  písmena stejně se staggerem 0,03.

**Patička – zmenšení písmene (obr. 2)**
- SVG cesty; `mouseenter` na písmeno → `scale 0.05` (0,6 s `power2.inOut`) → zpět `scale 1` (1,8 s `elastic.out(1, 0.8)`).
- Při vstupu do viewportu písmena vyjedou v náhodném pořadí (`yPercent 120 → 0`, 1,2 s, stagger 0,03), apostrof `back.out`.
- Pozn.: zadání (§4.9) popisuje jiný princip – zúžení přes variabilní osu `wdth`, viz rozhodnutí níže.

## griflan.com (Nuxt + Lenis + GSAP + matter-js + Rive)

**Menu vlevo nahoře (obr. 3)** – svislý textový seznam s počtem projektů, logo uprostřed, CTA vpravo. (U nás hotovo ve fázi 2.)

**Pás čísel (obr. 4)**
- Nativní horizontální scroller (`overflow-x: hidden`, `snap-x`, `cursor: grab`, `touch-action: pan-y`), buňky 1/5 šířky
  s 1px linkami (`white/10`), nahoře řádek s logem, dole číslo serifem + popisek.
- Automatický posun ~30 px/s, chytit a táhnout myší/prstem; nekonečná smyčka = 3 kopie, klony jsou `aria-hidden` + `inert`.

**Nálepky „Bravo! / Kudos!“ (obr. 4)**
- Komponenta `Pills` s **matter-js**: při pohybu myši nad pásem vznikají pilulky (černé pozadí, červený text, 2px červený
  obrys, plně kulaté) s náhodným textem; dostanou náhodný úhel (±0,3 rad), rotaci a rychlost podle pohybu myši,
  padají (gravitace 2) a kupí se na neviditelné podlaze. Ležící pilulky se posouvají spolu s pásem.
- Max. 6–14 najednou (podle šířky), nejstarší zmizí fade-outem. Při `prefers-reduced-motion` vypnuto.

**„Client Confessions“ – psaníčka (obr. 5)**
- Karty (krémová s červeným textem / červená s krémovým), každá pootočená ±4°, ve dvou výškových řadách přes sebe,
  ikona uvozovek v rohu. Celý pás **sám plyne** a dá se chytit a táhnout; nad ním vlastní kulatý kurzor s ručičkou.

## juncastudio.com (Astro + React Three Fiber + GSAP SplitText)

**Vlnky na obrázku projektu + VIEW PROJECT (obr. 6)**
- Jeden sdílený fixní R3F `<Canvas>` (ortho kamera) – stejná architektura jako u nás.
- **Výšková simulace vodní hladiny** (ping-pong FBO 256²): kapky z kurzoru (raised-cosine, poloměr 0,032, síla 0,12),
  vlnová rovnice přes 9bodový Laplacián, útlum 0,977, 2 kroky za snímek.
- Render: gradient hladiny → refrakce (síla 2,4, u okrajů 8 % utlumená), **disperze RGB 0,6** (R víc, B míň → duhové lemy),
  stínování podle normály (0,4), Blinn-Phong odlesk se světlem nad kurzorem (0,25, lesk 80), kaustiky (1,4).
  Klidná hladina = jediné čtení textury.
- Tlačítko „VIEW PROJECT“ + čtvereček se šipkou (červené, ostré rohy) jde za kurzorem s lerpem 0,18; karty mají
  paralaxu (lerp 0,1). Štítky vlevo dole jsou obrysové obdélníky v mono písmu.

**Scramble textu (obr. 7–8)**
- SplitText na znaky; **každý znak dostane předem změřenou pevnou šířku** (inline-block, na střed) → nic neposkakuje.
- Režim „sweep“: přes text jede pás (90 px), za ním finální znaky, v něm náhodné znaky (nové každých 50 ms, v červené),
  2,4 s `power1.inOut`. Režim „decode“: každý znak se ustálí v jiném čase, 0,6 s. Sada znaků A–Z0–9 (+ malá pro smíšený text).
- Přístupnost: `sr-only` kopie textu, rozdělené znaky `aria-hidden`.

**Složky (obr. 9–11)**
- `li` sticky s `top: 100px + i × 64px`; **výška karty klesá o 64 px na každou další** (760 → 696 → 632…), takže spodní hrana
  každé karty sedí na spodku viewportu. Barvy `#260503 → #4b0b06 → #711009 → #97150c`, linka 1px bílá 14 %.
- Nadpisy se scramblují; obsah zakrývané karty postupně bledne. Nahoře tenký červený progress bar, vlevo dole fixně
  `©2026 (UTC+1) 11:39:55 AM`.

## leome-and-partners.com (Webflow + GSAP + SplitText + DrawSVG + Lenis)

- Paleta 60/30/10: tmavě zelená `#052824` / `#021D1A`, mátová `#B1F9E1`, linky mátové 15 %.
- **Karty služeb (obr. 13–14)**: čtverec s 1px obrysem, číslo vlevo nahoře, šipka ↗ v plném čtverečku vpravo nahoře, název dole.
  Hover: výplň vyroste `scale 0 → 1` **z pravého horního rohu** (~0,5 s výrazný ease-in-out), šipka se otočí na ↙ (bez čtverečku),
  položky seznamu najedou `opacity 0 → 1` + `translateY 15px → 0` se staggerem. Karty v mřížce jsou výškově posunuté.
- Logo (obr. 15): jednobarevný geometrický gryf z tlustých linek.
- Patička: vlevo velká značka, uprostřed sloupec odkazů velkým písmem, vpravo info, pod tím obří název přes celou šířku,
  dole mono lišta zarovnaná do sloupců.

## Rozhodnutí pro náš web

Odsouhlaseno 12. 10. 2026 – v těchto bodech mají přednost před `docs/PROMPT.md`:

| Místo | Rozhodnutí | Fáze |
| --- | --- | --- |
| Patička ŠVEHLA | Jako noth.in: písmeno po najetí smrskne na ~5 % a pružně (elastic) vyskočí zpět; při vstupu do viewportu písmena vyjedou v náhodném pořadí. Místo zúžení přes osu `wdth`. | 3 (vstup), 4 (hover) |
| Nálepky v pásu čísel | Jako griflan: při pohybu myši vznikají pilulky (Merged!, Ship it!, Done!/Hotovo!), padají fyzikou (matter-js), kupí se dole a jedou s pásem. Mobil a reduced motion bez nálepek. | 4 |
| Pás čísel | Nativní horizontální scroller: sám pomalu jede, jde chytit a táhnout, nekonečná smyčka s klony `aria-hidden` + `inert`. | 4 |
| Mimo kód | Jako griflan: pootočené karty ve dvou výškách plynou v pásu, celý pás jde chytit a táhnout. | 4 |
| Intro | Jako noth.in s loaderem: „OJ“ + okénko + „Š“, odpočet 100 → 000, opona nahoru, pak písmena jména vyjedou v náhodném pořadí. Jen 1× za návštěvu, přeskočí se při odkazu s kotvou a s reduced motion; kliknutí/scroll intro zrychlí. | 3 |
| Cesta | Výšky složek jako juncastudio: každá další o výšku lišty nižší, aby spodní hrana seděla na spodku viewportu; obsah zakrývané složky bledne. | 3 |
| Odkrývání v hero | Jako noth.in: WebGL simulace tekutiny, barvivo jako maska odkrývá druhou vrstvu (červená plocha + písmo s kovovým shaderem). | 5 |
| Vlnky na projektech | Jako juncastudio: výšková simulace hladiny + refrakce, disperze RGB, odlesk, kaustiky. | 5 |
| Tlačítka | Žádné pilulky: ostré rohy, textový blok + samostatný čtvereček s ikonou (juncastudio „VIEW PROJECT ↗“), text se při hoveru přetočí. Ostré rohy i u štítků a dlaždic. | 3 |
| Popisky a čísla | Žádné mono písmo (JetBrains Mono působilo „AI“): verzálky Archivo, osa wdth 112 %, tabulkové číslice. | 3 |
| Obálky projektů bez dema | Zůstává typografický DOM cover (`ProjectCover`), žádné SVG: názvy jsou přeložené (SVG by byla dvě na projekt s textem převedeným na křivky), DOM má skutečné webfonty a vlnky ho rasterizují. Screenshot `public/projects/<id>.webp` ho nahradí automaticky. Odsouhlaseno 13. 10. 2026. | 6 |
| Fotka | Portrét (výřez s průhledností) v sekci O mně (dlaždice vedle textu) a v barevném CV vpravo vedle „ŠVEHLA“ – proti zadání „žádné fotky“ v PDF, na přání. Strohé CV pro ATS zůstává bez fotky. 13. 10. 2026. | 6 |
| Jméno v hero | Větší než v zadání a vyplňuje výšku hero: na širokých obrazovkách 1 řada, na vysokých oknech 2, na výšku (mobil) 3 řady, sudé jedou opačně; velikost podle volné výšky (container query), max. 32vw a 40rem. Stojí těsně na spodní liště. Celé hero nejde vybírat (`select-none`). Odsouhlaseno 13. 10. 2026. | 5 |
