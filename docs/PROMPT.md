# Zadání – osobní CV / portfolio web

> Původní brief projektu. Obsah je beze změn; opravené je jen formátování tabulek a ukázka `projects.config.ts` je převedená do tabulky – kompletní data žijí v `content/projects.config.ts`.

## 0. Role a cíl

Jsi senior creative developer (úroveň Awwwards „Site of the Day“). Postav mi osobní CV/portfolio web, který mi má pomoct získat stáž nebo částečný úvazek jako junior full-stack vývojář. Web má působit draze, čistě a sebevědomě – minimalistický layout, velká typografie, hodně prázdného místa – a zároveň být hravý v detailech (animace a interakce). Žádné easter eggy – žádný terminál, sběr razítek, maskot ani skryté minihry. Míra hravosti: 7/10 – personalista musí do 10 sekund pochopit, kdo jsem a co umím; animace slouží obsahu, nikdy ho neschovávají.

**Repozitář a deploy:**

- Nový projekt zakládej v lokální složce `D:\My-Projects\cv-oldjas` (Windows) jako nový git repozitář, na GitHubu `ADCCZ/cv-oldjas`.
- Deploy na Vercel. Nový repozitář napoj na stávající Vercel projekt, aby zůstala adresa https://cv-oldjas-tan.vercel.app/ (ta je v mých žádostech o stáž). Před přepnutím mi řekni, co přesně kliknout ve Vercel dashboardu.
- Starý repozitář `ADCCZ/olda-web` slouží jen jako zdroj dat a inspirace, nic v něm neměň.

**Co web NESMÍ dělat (anti-AI-look)**

- žádné fialovo-modré gradienty, glassmorphism karty, emoji v nadpisech, „Hi, I'm … 👋“
- žádné generické ikonky v kolečkách, žádné procentuální „skill bary“
- žádný stock text typu „passionate developer who loves clean code“
- žádné vymyšlené reference, citace ani čísla – jen obsah z této specifikace
- každá animace musí mít důvod; když nevíš proč tam je, vyhoď ji

### 0.1 Jazyk webu

- Hlavní jazyk je angličtina – běží na `/`, čeština na `/cs`. Žádné automatické přesměrování podle prohlížeče; jazyk volí návštěvník.
- Přepínač jazyka EN / CS je vždy viditelný v navigaci vpravo nahoře (i po sbalení menu do MENU ::) a ve fullscreen menu. Aktivní jazyk je zvýrazněný zlatě. Přepnutí zachová aktuální sekci (kotvu) a volbu si pamatuje v cookie `lang`.
- Texty v této specifikaci jsou česky – ber je jako zdroj a do angličtiny je přelož přirozeně (jak by to napsal rodilý mluvčí do CV, ne doslovně). Názvy předmětů (KIV/UUR…), firem a škol nepřekládej, jen u škol doplň anglický název v závorce (např. „Faculty of Applied Sciences, University of West Bohemia“).
- Klíčové anglické texty:
  - Hero: „Junior full-stack developer, Pilsen.“ / „Friends call me Olda.“
  - Status: „Open to internships & part-time · 20 h/week · Pilsen or remote“
  - CTA: „See my work →“, „or get in touch“, „Get in touch“, „Download CV ↓“
  - Kontakt: „Looking for an internship or a part-time role. Let's talk.“

## 1. Tech stack

| Oblast | Volba |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript, static/ISR, deploy na Vercel (Next.js mám v sekci „V plánu“ – web je zároveň důkaz, že se ho učím) |
| Styly | Tailwind CSS v4, design tokeny jako CSS proměnné |
| Scroll & animace | GSAP 3 (ScrollTrigger, SplitText, Flip, Observer, Draggable, InertiaPlugin – vše je zdarma) + Lenis pro plynulý scroll (napojit na `gsap.ticker`) |
| 3D / WebGL | React Three Fiber + drei, vlastní GLSL shadery. Jeden sdílený fixní `<Canvas>` přes celou stránku a drei `<View>` navázané na DOM elementy (ne víc canvasů) |
| Fyzika | matter-js (sekce technologií), DOM elementy synchronizované s tělesy |
| i18n | angličtina je hlavní (`/`) + čeština (`/cs`), slovníky v `content/en.ts` a `content/cs.ts` (viz 0.1) |
| Témata | dark (výchozí) / light, next-themes, respektuje `prefers-color-scheme` |
| Data | GitHub REST API přes server-side fetch (`revalidate: 3600`), volitelný `GITHUB_TOKEN` v env, statický fallback (jako současný web: „GitHub teď neodpovídá, seznam je z poslední zálohy“) |
| Ikony technologií | simple-icons (monochromatické SVG) |

WebGL komponenty načítej přes `next/dynamic` se `ssr: false` a až po prvním vykreslení (LCP musí být HTML text, ne canvas).

Ze starého repa `ADCCZ/olda-web` můžeš převzít Vercel funkci pro GitHub data, pokud je použitelná. PDF životopisy nepřebírej – vznikají nově podle sekce 5.

## 2. Design systém

### 2.1 Barvy – pravidlo 60 / 30 / 10

**Dark mode (výchozí)**

| Role | Podíl | Token | Hodnota |
| --- | --- | --- | --- |
| Základ (pozadí) | 60 % | `--bg` / `--surface` | `#0A0A0A` / `#141414` |
| Text | – | `--fg` / `--fg-muted` | `#F2EEE6` (teplá krémová) / `#8C877E` |
| Dominantní akcent | 30 % | `--red-950…500` | `#2A0306`, `#5C0A10`, `#9E0F1C`, `#D2162A` |
| Detail | 10 % | `--gold` / `--gold-soft` | `#D4A63A` / `#E8C770` |

**Light mode**

| Role | Token | Hodnota |
| --- | --- | --- |
| Základ 60 % | `--bg` / `--surface` | `#F6F3EE` / `#ECE7DF` |
| Text | `--fg` / `--fg-muted` | `#0E0E0E` / `#6B665E` |
| Akcent 30 % | `--red-*` | stejná škála, pro text použij `#9E0F1C` |
| Detail 10 % | `--gold-text` / `--gold` | `#8A6A12` (text, kvůli kontrastu) / `#D4A63A` (dekorace) |

Kde je která barva:

- **Červená (30 %):** celé sekce „Cesta“ (stupňované odstíny), CTA tlačítka, nálepky, hover výplně karet, překryv projektů, progress bar scrollu.
- **Zlatá (10 %):** čísla sekcí (01, 02), tenké linky, aktivní položka menu, kurzor, podtržení odkazů, malé highlighty. Nikdy jako velká plocha.
- Červený text jen ve velkých velikostech (≥ 24 px) – kontrast na černé je ~3,7 : 1.

### 2.2 Typografie (všechny fonty musí podporovat českou diakritiku – otestuj „ŘŠČŽĚŮ“)

- **Display:** Archivo (variabilní, osy `wght` 100–900 a `wdth` 62–125) – obří nadpisy, hero, patička. Osa `wdth` se používá pro hover efekt v patičce.
- **Akcent:** Instrument Serif (italic) – jednotlivá slova v nadpisech pro eleganci (např. „Mimo *kód*“).
- **Text:** Archivo 400/500, 16–18 px, řádkování 1,5.
- **Mono:** JetBrains Mono – čísla sekcí, štítky, hodiny.
- **Škála:** hero `clamp(6rem, 22vw, 26rem)`, H2 `clamp(2.5rem, 6vw, 6rem)`, tight tracking (−0,04 em) na display velikostech.

### 2.3 Layout a detaily

- 12sloupcový grid, okraje 24 px (mobil 16 px), web jde od kraje ke kraji.
- Tenké 1px linky (`--fg` na 12 % opacity) jako mřížka sekcí (styl Griflan stats).
- Jemná grain/noise textura přes celou stránku (SVG filter nebo malý PNG, opacity 4–6 %).
- Rohy: buď 0, nebo plně kulaté (pill tlačítka). Nic mezi tím.
- Easing: `cubic-bezier(0.65, 0, 0.35, 1)` pro přechody, `expo.out` pro reveal, trvání 0,6–1,2 s.

### 2.4 Logo

Jednobarevný monogram (styl gryfa z leome-and-partners.com): geometrické, z několika tlustých linek, čitelné v 24 px. Motiv: spojení iniciál O/Š s kompasem/šipkou (odkaz na Pathfinder a „navigaci“). Dodám jako SVG do `public/logo.svg`; do té doby použij textový placeholder „OŠ“ *(upřesnění: „OJŠ“)*.

- SVG používá `fill="currentColor"`.
- Navigace: barva `--fg` (krémová v dark, černá v light); hover a aktivní stav `--gold` (v light `--gold-text`).
- Favicon a apple-touch-icon: krémové logo na červeném čtverci `#D2162A`.

## 3. Globální prvky

### 3.1 Navigace (inspirace griflan.com)

- Vlevo nahoře svislý minimalistický textový seznam: O mně, Projekty (12), Stack, Cesta, Kontakt. Počet projektů se počítá automaticky z configu. Aktivní sekce má zlatou tečku vlevo. Klik → `lenis.scrollTo()` s offsetem.
- Uprostřed logo.
- Vpravo přepínač jazyka EN / CS, přepínač tématu (ikonka slunce/měsíc s morph animací) a červené CTA „Get in touch“ / „Napiš mi“ (magnetické, odkaz na `#contact`).
- Po odscrollování za hero se levý seznam sbalí (stagger fade) do tlačítka MENU :: (styl noth.in) → fullscreen overlay menu s obřími odkazy, které se odhalují po řádcích (clip-path reveal), dole v overlayi odkaz „Stáhnout CV (PDF)“. Esc zavírá, focus trap.
- Skip-link „Přeskočit na obsah“.

### 3.2 Kotvy sekcí (kompatibilita se starým webem)

Odkaz na web už je v odeslaných žádostech o stáž, staré odkazy proto musí fungovat dál.

- ID sekcí jsou anglicky a stejné v obou jazycích: `#top` (hero), `#about`, `#stats`, `#projects`, `#stack`, `#skills`, `#journey`, `#off-code`, `#contact`.
- Aliasy ze starého webu: `#education` a `#experience` → `#journey` (na začátek příslušného stohu), `#leadership` → `#skills`. Řeš to skrytými kotvami na správném místě a při načtení stránky s hashem doscrolluj přes Lenis až po inicializaci ScrollTriggerů.
- Zachovat i cesty k PDF ze starého webu: `/cv.pdf` a `/cv-plain.pdf` (viz sekce 5).

### 3.3 Kurzor

- Malá zlatá tečka + kruh, který ji s lerpem následuje. `mix-blend-mode: difference`.
- Nad odkazy se kruh zvětší; nad projekty se změní na pilulku „ZOBRAZIT ↗“; nad fyzikálními prvky na „TÁHNI“.
- Na dotykových zařízeních vypnuto (`(pointer: coarse)`).

### 3.4 Magnetická tlačítka

Všechna pill tlačítka: přitahování k kurzoru v okruhu ~80 px (max posun 12 px), text uvnitř se posouvá o polovinu víc (parallax). Návrat `elastic.out`.

### 3.5 Další

- Tenký červený progress bar scrollu nahoře.
- Lokální čas Plzně (Europe/Prague, živé hodiny, mono font) – styl juncastudio.com.
- Velocity-based skew: při rychlém scrollu se velké nadpisy lehce zkosí (max 4°).

## 4. Sekce stránky (v tomto pořadí)

### 4.1 HERO – „nekonečné jméno“ (inspirace noth.in)

**Obsah:**

- Vlevo nahoře (pod menu na mobilu): „Junior full-stack vývojář, Plzeň.“ a pod tím „Pro přátele Olda.“ (Instrument Serif italic).
- Tlačítka: „See my work →“ / „Ukaž projekty →“ (plné, červené, `#projects`) a „or get in touch“ / „nebo mi napiš“ (outline, `#contact`).
- Přes celou šířku obří nadpis **OLDŘICH JAN ŠVEHLA** — jako nekonečný horizontální marquee (bezešvá smyčka, 2 kopie). Rychlost a směr reagují na scroll velocity (scroll dolů = rychleji doleva, scroll nahoru = doprava).
- Dole lišta: vlevo „Bc. · student Ing. SWIS @ FAV ZČU“, uprostřed status ● Open to internships & part-time · 20 h/week · Pilsen or remote / ● Hledám stáž / částečný úvazek · 20 h týdně · Plzeň nebo remote (na mobilu zkrácené na ● Open to work · 20 h/week) (zelená pulzující tečka je jediná výjimka z palety), vpravo GITHUB a živé hodiny Plzně.

**Interakce – odkrývání pod kurzorem:**

- Nadpis existuje ve dvou vrstvách: horní = plná barva `--fg`; spodní = stejný text vyplněný WebGL texturou (shader: tekutý kov / šum v červeno-zlatých tónech, pomalu se pohybující).
- Kolem kurzoru se spodní vrstva odkrývá organickým „blob“ tvarem (metaball/goo efekt, ne kruh) – tvar má setrvačnost, při pohybu se protahuje za kurzorem a pomalu se smršťuje, když myš stojí.
- Implementace: preferuj přímo shader (maska spočítaná ve fragment shaderu z pozic kurzoru s lerpem), fallback SVG `mask-image` řízená z `requestAnimationFrame`.
- Na mobilu: blob se pomalu pohybuje sám po Lissajousově křivce.

**Scroll animace (pin ~120 vh, scrub):**

1. Marquee zpomalí a zastaví.
2. Písmena (SplitText chars) se rozpadnou – každé letí jiným směrem s náhodnou rotací a lehkým z (perspective), vybledne.
3. Ze stejných směrů se poskládají písmena nadpisu další sekce („O mně“), takže to působí, jako by se jméno přeskládalo do nového slova.
4. Ostatní prvky hero (tlačítka, lišta) odjedou nahoru s mírným stagger.

### 4.2 O MNĚ – sticky split se 3D kompasem

- **Levá polovina:** text, který se při scrollu zabarvuje slovo po slovu z `--fg-muted` na `--fg` (scrub). Použij můj text ze současného webu (mírně zkrácený):

  > „Junior full-stack vývojář, který věci dotahuje do posledního puntíku. Pocházím ze Strakonic, letos jsem dokončil bakaláře z počítačových věd na FAV ZČU – hlavně z předmětů o vývoji webových aplikací a softwarovém inženýrství – a teď jsem v 1. ročníku navazujícího studia Softwarové a informační systémy. Baví mě celá cesta od návrhu architektury přes backend a databáze až po poslední detail v rozhraní. Nejčastěji píšu v PHP (Nette), JavaScriptu (React, Vue) a Pythonu, k tomu MySQL, Git a Linux. Za hotové považuju až to, co je otestované a opravdu funguje. Nové věci se učím rád – díky školním projektům jsem si vyzkoušel NFC, paralelní výpočty v OpenMP i 3D grafiku v OpenGL, teď se pouštím do TypeScriptu. Při vývoji pracuju s AI asistentem Claude (Claude Code), se kterým vznikl i tenhle web.“

- **Pravá polovina (sticky):** 3D kompas (R3F, low-poly, černý kov se zlatými detaily a červenou střelkou). Rotuje podle scrollu; střelka se pokaždé otočí k jednomu z faktů, které se vedle objevují (každý s malou jednobarevnou SVG ikonou):
  - Bc. Počítačové vědy – FAV ZČU (2026)
  - Ing. SWIS – FAV ZČU, 1. ročník
  - Oblastní vedoucí – Klub Pathfinder, Jižní kříž
  - Plzeň · původem Strakonice
  - Angličtina B2 · němčina základy · španělština začínám
- Kompas reaguje i na pozici myši (lehký tilt).

### 4.3 V ČÍSLECH – pás statistik (inspirace griflan.com)

- Vodorovný pás buněk oddělených tenkými linkami. Jede automaticky (pomalý marquee), ale dá se chytit a táhnout myší/prstem (Draggable + inertia); po puštění pokračuje v automatickém pohybu.
- Čísla v Instrument Serif, obří, při vstupu do viewportu se načtou od 0 (count-up). Popisky malým písmem pod číslem.
- Obsah (vše ověřené z mého CV):
  - **12** – projektů v rejstříku
  - **35+** – technologií, se kterými jsem pracoval
  - **3** – tábory, které jsem vedl (1× programový, 2× hlavní vedoucí)
  - **2012** – rok, kdy jsem vstoupil do Klubu Pathfinder
  - **24** – testů v pytest v bakalářském projektu
  - **15** – grafů s animací z otevřených dat lázeňských měst
  - **D** – nejtěžší obtížnost ferraty, kterou jsem zatím vylezl
  - **2011** – od kdy hraju na kytaru
- Přes některé buňky jsou „nalepené“ kulaté nálepky s rukou psaným textem v červeném obrysu, lehce pootočené (styl „Bravo! / Kudos!“): Merged!, Ship it!, Hotovo!. Při hoveru se zahoupou (rotace ±8°, spring).

### 4.4 PROJEKTY – horizontální scroll (inspirace juncastudio.com)

- Sekce se pinne a vertikální scroll posouvá řadu projektových karet doleva. Nadpis „Projekty“ zůstává vlevo, vedle počítadlo `01 / 07`.
- Karty: velký screenshot (16:10), pod ním název, jednořádkový popis a štítky technologií (outline pill, mono font). Vlevo dole na obrázku štítky typu WEBAPP, KIV/UUR.
- Hover efekt na obrázku: WebGL vlnky na vodě – soustředné kruhy vznikají v místě kurzoru a šíří se, obraz se v nich láme + jemná RGB separace (chromatic aberration). Současně se nad kurzorem objeví červené tlačítko „ZOBRAZIT PROJEKT ↗“, které ho s lerpem následuje.
- Pod popisem karty odkazy: Repozitář ↗ a Živá ukázka ↗ (jen pokud existují). U soukromých repozitářů místo odkazu text „soukromé repo týmu“ / „soukromé repo, přístup na vyžádání“.
- Klik na obrázek → živá ukázka, jinak repozitář.
- Paralaxa: obrázek uvnitř karty se posouvá pomaleji než karta.
- Poslední „karta“ je odkaz: „Všechno na GitHubu ↗“ (https://github.com/adccz).

**Pod horizontálním pásem – „Archiv semestrálek“:** kompaktní seznam zbývajících projektů jako řádky přes celou šířku (číslo, název, technologie vpravo). Hover na řádek → řádek se zaplní červenou zleva (clip-path) a rozbalí se popis (inspirace leome-and-partners.com).

**Obrázky projektů (screenshoty zatím nemám):**

- Napiš skript `scripts/screenshots.ts` (Playwright), který vyfotí projekty s živou ukázkou (`demo` v configu) v rozlišení 1600×1000 při `deviceScaleFactor: 2`, převede je na WebP (sharp) a uloží do `public/projects/<id>.webp`. Spouští se ručně (`npm run screenshots`), ne při buildu.
- Projekty bez živé ukázky dostanou typografický cover v designu webu: pozadí v odstínu červené podle pořadí (`--red-950` → `--red-500`), název obřím Archivem (wdth 125, wght 900) v krémové, zlaté číslo 01 v mono fontu, seznam technologií malým mono písmem dole. Generuj je jako SVG (nebo přes `next/og`) do stejné složky.
- Když do `public/projects/` později nahraju skutečný screenshot se stejným názvem, má automaticky nahradit cover.

**Data:** `content/projects.config.ts`. Z GitHub API dotahuj u veřejných repozitářů jazyk, hvězdičky, datum poslední aktualizace a topics; když API selže, použij data z configu a zobraz malou poznámku „GitHub teď neodpovídá, data jsou z poslední zálohy“.

Výchozí obsah configu (featured = horizontální pás, archive = seznam pod ním) – projekty a texty jsou 1:1 převzaté do `content/projects.config.ts`:

| id | featured | repo | demo | název | stack | štítky |
| --- | --- | --- | --- | --- | --- | --- |
| campmaster | ano | ADCCZ/campmaster-3000 | https://campmaster-3000.vercel.app | CampMaster 3000 | React, Tailwind CSS, Recharts, Leaflet | WEBAPP, KIV/UUR |
| kiosek | ano | – (soukromé repo týmu) | – | Samoobslužný kiosek | Vue.js, JavaScript, NFC, UX/UI | ZAKÁZKA FIRMY, TÝM |
| portal-jk | ano | ADCCZ/web_oblastni-stranky_jk | – | Informační a komunitní portál | PHP, Nette, Latte, Tailwind CSS, MySQL | FULL-STACK, VE VÝVOJI |
| bakalarka | ano | ADCCZ/bkp-tmwmf | – | Otevřená data v lázeňských místech | Python, pandas, matplotlib, Power BI, pytest, Otevřená data | BAKALÁŘKA, OPEN DATA |
| pexeso | ano | ADCCZ/tmwmf_sem_UPS | – | Síťové pexeso | C, TCP/IP, JavaFX, Maven, Síťové protokoly | SÍŤOVÁ HRA, KIV/UPS |
| foodapp | ano | ADCCZ/web-foodapp | – | FoodApp „Délicious“ | PHP, Twig, MySQL, JavaScript (AJAX), Bootstrap 5 | WEBAPP, KIV/WEB |
| cv-oldjas | ano | ADCCZ/cv-oldjas | https://cv-oldjas-tan.vercel.app/ | Tenhle web | Next.js, TypeScript, GSAP, Three.js, Tailwind CSS | PORTFOLIO |
| kmx | ne | – | – | Emulátor počítače KMX | C, Make, LaTeX | – |
| vfs | ne | – | – | Virtuální souborový systém | C, CMake | – |
| meteo | ne | – | – | Paralelní zpracování meteodat | C++, OpenMP, SVG | – |
| opengl-hra | ne | – | – | 3D hra v OpenGL | C#, .NET 8, OpenTK, GLSL | – |
| oks | ne | – | – | Testování softwaru (10 úloh KIV/OKS) | pytest, mock, coverage, Squash TM, Robot Framework, BDD / Gherkin, SQLite | – |

Popisy (CS i EN) jsou v `content/projects.config.ts` přesně podle zadání.

### 4.5 STACK – fyzikální hromádka technologií

- Nadpis: „Čím stavím“, podnadpis „Stupnice od prvního vyzkoušení po expertní úroveň.“
- Když sekce vstoupí do viewportu, shora spadnou dlaždice/pilulky s logy technologií (matter-js) a nakupí se na dně sekce. Dají se chytit, táhnout a hodit myší; odráží se od stěn sekce.
- Velikost dlaždice odpovídá úrovni (5 velikostí). Dlaždice úrovně 4 mají zlatý obrys. Technologie „V plánu“ jsou průhledné s čárkovaným obrysem.
- Hover na dlaždici (klepnutí na mobilu) → tooltip: úroveň slovy (např. „3/5 – samostatně na projektech“) + kde jsem ji použil (odkaz na projekt z configu, pokud existuje).
- Pod hromádkou tlačítko „Seřadit“ – dlaždice se z hromádky animovaně (GSAP Flip) srovnají do mřížky podle kategorií, s legendou stupnice. Opětovný klik je zase rozhází.
- Mobil a `prefers-reduced-motion`: rovnou mřížka, bez fyziky.

**Stupnice:** 1 zkoušel jsem · 2 základy, školní projekty · 3 samostatně na projektech · 4 pokročile, dlouhodobě · 5 expert

**Data (`content/stack.config.ts`):**

| Kategorie | Technologie (úroveň) |
| --- | --- |
| Jazyky | Python (4), PHP (3), C (3), JavaScript (3), SQL (3), Java (2), C# (2), C++ (2), TypeScript (1) |
| Web a frameworky | HTML5 / CSS3 (4), Nette (3), Latte (3), Tailwind CSS (3), React (3), Vue.js (3), Twig (2), UX/UI design (2), Node.js – Express, Socket.IO (2) |
| Architektura a sítě | MVC / MVP architektura (4), TCP/IP sokety, vlastní protokol (3), REST API (2), WebSockety – Socket.IO (2), Paralelizace – OpenMP (2), OAuth 2.0 (1), NFC (1) |
| Databáze a nástroje | Git a GitHub (4), LaTeX (4), MySQL (3), Linux WSL (3), Vite (3), Make / CMake / Maven (3), Docker (1) |
| Grafika a data | pandas / matplotlib (3), Otevřená data (3), Power BI (2), OpenGL / OpenTK, GLSL (2), JavaFX (2) |
| V plánu | Next.js, PostgreSQL, Spring Boot, GitHub Actions (CI/CD), Testování (JUnit, Jest), Kubernetes, AWS / cloud |

Až bude web hotový, posuň z „V plánu“ do příslušných kategorií: Next.js (2), GitHub Actions (1) a nově Playwright (1) – všechno se na tomhle webu reálně použije (viz sekce 10).

### 4.6 CO UMÍM – karty s hover odhalením (inspirace leome-and-partners.com)

- 4 čtvercové karty v mřížce, tenký obrys. V klidu: číslo 01 vlevo nahoře (zlaté, mono), ikonka šipky ↗ vpravo nahoře v plném čtverečku, název dole.
- Hover: karta se zaplní červenou (clip-path z rohu), šipka se otočí na ↙, nahoře se po řádcích (stagger) objeví seznam, název zůstane dole. Na dotyku se karta otevře klepnutím.
  - **Frontend** – React a Vue.js · Tailwind CSS · UX/UI a design rozhraní · NFC přihlašování v kiosku
  - **Backend** – PHP / Nette a vlastní MVC · MySQL a PDO · REST API · TCP servery v C
  - **Data a testování** – Python, pandas, matplotlib · Power BI · pytest, Robot Framework, BDD · otevřená data
  - **Vedení a organizace** – vedení týmů a mentorství · projektový management a logistika · zodpovědnost a klid pod tlakem
- Pod kartou 4 (nebo jako rozbalitelný text) krátké odstavce o měkkých dovednostech:
  - **Vedení týmů a mentorství:** od roku 2018 vedu děti a mladé, od 2024 celou oblast Jižní kříž – koordinuju vedoucí, pomáhám jim s programem a předávám zkušenosti.
  - **Projektový management a logistika:** tábor je projekt se vším všudy – rozpočet, harmonogram, tým i rizika. Tři jsem vedl, k tomu víkendové akce pro desítky účastníků a účetnictví oblasti.
  - **Zodpovědnost a klid pod tlakem:** na táboře ani na skalách se nedá nic odložit na zítřek. V nečekané situaci zachovám klid, rychle se rozhodnu a věc dotáhnu.

### 4.7 CESTA – stohující se „složky“ (inspirace juncastudio.com)

Dva stohy za sebou, každý s vlastním malým nadpisem („Vzdělání“, „Praxe“), aby sbalené lišty nezabraly víc než výšku obrazovky.

- Řádky přes celou šířku, každý má tmavší → světlejší odstín červené (`--red-950` → `--red-500`). Vlevo zlaté číslo 01, vedle název velkým písmem, vpravo období (mono), podnadpis, popis a ilustrace/obrázek.
- Při scrollu se každý řádek přilepí (sticky) pod předchozí a sbalí se jen na lištu s číslem a názvem (výška ~64 px) – efekt stohu složek / kartotéky. Aktuální řádek je rozbalený.
- Nadpisy v řádcích mají scramble animaci při vstupu (náhodné znaky se během ~600 ms ustálí na finální text).

**Stoh 1 – Vzdělání**

1. **Počítačová grafika a CNC technika** · 2019 – 2023 · Střední průmyslová škola Strakonice (VOŠ, SPŠ a SOŠ řemesel a služeb)
2. **Bc. Počítačové vědy** · 2023 – 2026 · Fakulta aplikovaných věd, ZČU v Plzni. Bakalářský projekt: Otevřená data a jejich analýzy v lázeňských místech pro demografii/školství a turismus.
3. **Ing. Softwarové a informační systémy (SWIS)** · 2026 – · Fakulta aplikovaných věd, ZČU v Plzni. Navazující studium, 1. ročník.

**Stoh 2 – Praxe** (úvodní věta: „Placenou praxi v IT teprve hledám. Tohle je to, co mám za sebou.“)

1. **Rádce a vedoucí, od 2024 oblastní vedoucí** · od 2018 · Klub Pathfinder, oblast Jižní kříž · v klubu od 2012
   - Vedení oblasti: koordinace oddílů a vedoucích, účetnictví oblasti, víkendové akce.
   - Tábory jsou moje srdcovka: jeden jsem vedl jako programový vedoucí, dva jako hlavní vedoucí. Rozpočet, program, tým, bezpečnost a zázemí pro desítky účastníků.
   - Práce s dětmi a dospívajícími, řešení nečekaných situací v terénu.
   - Kurzy: Rádcovský kurz (2020), Vůdcovský kurz (2024), MasterGuide – nejvyšší stupeň vzdělání v Pathfinderu (probíhá, do začátku 2027).
2. **Frontend samoobslužného kiosku** · LS 2025 · Eurosoftware, dnes GK Software Czech Republic s.r.o. · týmový projekt KIV/ZSW-E
   - Kiosek, ze kterého si zaměstnanci na firemních akcích berou produkty. Moje část: frontend ve Vue.js, přihlašování NFC kartou, design a UX/UI.
3. **Dobrovolník, security** · od 2023 · United – křesťanský multižánrový festival
   - Security na festivalu United v letech 2023 a 2025, od 2023 pravidelně dobrovolničím i na menších akcích United City.
4. **Strojírenská praxe** · 2021, 2022 · Automa CZ s.r.o., Strakonice – průmyslová automatizace, jednoúčelové stroje
   - Dvakrát 14 dní: montáž klimakomory pro testování displejů do aut Audi a přípravku pro kontrolu displejů Renault podle výkresů a modelu v Inventoru; ruční dokončování strojních dílů; sklad a dokumentace.
5. **Další krok: tvůj tým?** – poslední řádek je výzva s CTA „Napiš mi“.

### 4.8 MIMO KÓD – rozházené karty (inspirace griflan.com)

- Nadpis „Mimo *kód*“ (Instrument Serif italic na druhém slově).
- 5 karet rozházených a pootočených (±6°) přes sebe, střídavě krémové s červeným textem a červené s krémovým textem. Dají se táhnout; při hoveru se karta zvedne (shadow + scale 1,03). Na každé kartě kulatý odznak s ikonou.
- Obsah (osobní fakta, žádné citace jiných lidí):
  - **Kytara** – akustická, hraju od roku 2011, hlavně u ohně.
  - **Klub Pathfinder** – od roku 2012, oblastní vedoucí, tábory jsou srdcovka. (odkaz https://www.pathfinder.cz/)
  - **Filmy a seriály** – viděl jsem snad každou marvelovku, nejradši mám seriál Loki. Teď sleduju Zrádce na Prima+. (odkaz https://seriesgraph.com/user/d3854d39-022b-4c98-ab7e-9d17de583a78)
  - **Videohry** – hraju od roku 2012.
  - **Lezení a outdoor** – po skalách a po ferratách, na nich zatím nejtěžší obtížnost D.

### 4.9 KONTAKT + PATIČKA (inspirace noth.in a leome-and-partners.com)

- Nahoře velký nadpis „Looking for an internship or a part-time role. Let's talk.“ / „Hledám stáž nebo částečný úvazek. Ozvi se.“ a pod ním řádek dostupnosti v mono fontu: 20 h/week · Pilsen or remote / 20 h týdně · Plzeň nebo remote.
- Dvě pill tlačítka: „Email me @“ / „Napsat e-mail @“ (`mailto:oldasvehla@seznam.cz`), „Download CV ↓“ / „Stáhnout CV ↓“ (PDF v jazyce stránky, viz sekce 5). Pod tlačítkem malý odkaz „plain version for applicant tracking systems“ / „strohá verze pro personální systémy“.
- Kontaktní údaje se při vstupu do viewportu dešifrují (scramble efekt jako juncastudio.com): nejdřív náhodné znaky v červené, pak se ustálí na finální text.
  - Lokalita: Plzeň, Česko
  - E-mail: oldasvehla@seznam.cz (klik = kopírovat do schránky + toast „Zkopírováno“, vedle ikonka mailto)
  - GitHub: https://github.com/adccz
  - LinkedIn: zatím nemám – v `links.config.ts` připrav pole `linkedin: null`; dokud je null, položka se nikde (web ani PDF) nezobrazuje.
  - Telefon na webu není (je jen v PDF CV).
- Vpravo sloupec odkazů velkým písmem (GitHub / E-mail / CV PDF) – hover: podtržení se vykreslí zleva doprava zlatou linkou.
- Obří nápis přes celou šířku dole: **ŠVEHLA** (Archivo, plná šířka viewportu). Každé písmeno je samostatný span; při najetí myší se písmeno zúží/zmenší (animace variabilní osy `wdth` 125 → 62 a `wght` 900 → 300, spring), sousední písmena reagují slaběji (falloff podle vzdálenosti). Ostatní písmena se tím roztáhnou, takže nápis stále vyplňuje šířku.
- Spodní lišta (mono, malé): © 2026 Oldřich Jan Švehla · Plzeň, CZ · živé hodiny (UTC+2) 11:39:55 · Postaveno s Next.js, GSAP a Three.js ve spolupráci s Claude Code · odkaz „Kód tohoto webu je na GitHubu“ · vpravo NAHORU ↑.
- Struktura patičky: 3 sloupce nahoře (kontakt / odkazy / navigace), obří nápis, lišta – čisté zarovnání do gridu.

## 5. Životopis v PDF (nový, v designu webu)

Vytvoř dvě PDF verze životopisu, které se generují ze stejných dat v `content/` jako web – CV a web se tak nikdy nerozejdou.

**Generování:**

- Tisková stránka `app/cv/print/page.tsx` (A4, `@page { size: A4; margin: 0 }`, mimo navigaci a animace, noindex).
- Skript `scripts/generate-cv.ts` (Playwright, Chromium `page.pdf()` s `printBackground: true`) vyrenderuje 4 soubory: `public/cv.pdf` a `public/cv-plain.pdf` anglicky (hlavní, zachovávají cesty ze starého webu) a `public/cv-cs.pdf` a `public/cv-plain-cs.pdf` česky. Popisky v ukázkách níže jsou česky jen pro představu – v anglické verzi je přelož. Spouští se ručně `npm run cv`, PDF se commitují (Chromium nepatří do Vercel buildu).
- Po vygenerování zkontroluj, že každá verze má přesně 2 strany (plain max. 2), text je v PDF vybratelný a odkazy jsou klikací.

**`cv.pdf` – designová verze (světlá, ne černé pozadí):**

- Pozadí krémové `#F6F3EE`, text `#0E0E0E`, stejné fonty a tokeny jako web. Rozložení 60/30/10: krémová plocha / červené bloky / zlaté detaily (na krémové `#8A6A12`).
- **Strana 1:**
  - Nahoře tenká mono lišta: ● ŽIVOTOPIS · 2026 · cv-oldjas-tan.vercel.app · 01 / 02.
  - Obří jméno ve dvou řádcích: OLDŘICH JAN (černě) / ŠVEHLA (červeně `#D2162A`), Archivo wdth 125, wght 900, ~50 pt, těsné řádkování.
  - Pod ním „Junior full-stack vývojář, Plzeň.“ + „Pro přátele Olda.“ (Instrument Serif italic) a vpravo pill ● OPEN TO INTERNSHIPS · 20 H/WEEK · PILSEN OR REMOTE (česky ● HLEDÁM STÁŽ · 20 H TÝDNĚ · PLZEŇ NEBO REMOTE).
  - Kontaktní řádek rozdělený tenkými linkami do 4 buněk (zlatý mono popisek + hodnota): e-mail, telefon +420 730 961 437 (jen v PDF, na webu ne), GitHub, web.
  - Pod tím dva sloupce: vlevo **01 Profil** (zkrácený text z O mně) a **02 Praxe** (4 položky z Cesty, období v mono vlevo, firma červeně, odrážky se zlatou čárkou); vpravo červený sloupec `#9E0F1C` přes celou zbývající výšku s krémovým textem: **03 Technologie** (hlavní technologie po kategoriích, úroveň jako 5 malých obdélníčků, úroveň 4 zlatě, nahoře legenda stupnice), **V plánu** a **Jazyky** (čeština rodilý, angličtina B2, němčina základy, španělština začínám). Na dně sloupce velmi průhledný obří nápis OLDA.
- **Strana 2:**
  - **04 Vzdělání** jako tři „složky“ – plné pruhy v odstínech `--red-950`, `--red-800`, `--red-600` s krémovým textem, zlatým číslem a obdobím vpravo (stejný motiv jako sekce Cesta na webu).
  - **05 Vybrané projekty** – mřížka 2 × 3 (CampMaster, Bakalářka, Kiosek, Portál JK, Pexeso, FoodApp): zlaté číslo, štítek, název, 2 řádky popisu, technologie jako malé outline pilulky, odkaz červeně. Pod mřížkou jeden řádek „Další semestrální práce: …“ (archiv).
  - Tři sloupce: **06 Soft skills**, **07 Kurzy** (Rádcovský 2020, Vůdcovský 2024, MasterGuide do začátku 2027), **08 Mimo kód** (kytara, lezení a ferraty, videohry a Marvel/Loki).
  - Dole červený pás `#D2162A` (~42 mm) s krémovou lištou kontaktů a obřím, dole oříznutým nápisem ŠVEHLA – echo patičky webu.
- Žádné fotky, žádné ikony v kolečkách, žádné procentuální bary.

**`cv-plain.pdf` – strohá verze pro personální systémy (ATS):**

- Jeden sloupec, bílé pozadí, černý text, Archivo 10–11 pt, žádné tabulky, sloupce, ikony ani obrázky.
- Pořadí: jméno a kontakt (včetně telefonu) → dostupnost (20 h/week, Pilsen or remote) → Profil → Praxe → Vzdělání → Projekty (název, technologie, 1 věta, odkaz) → Technologie (prosté seznamy po kategoriích, bez úrovní) → Jazyky → Kurzy.
- Nadpisy sekcí obyčejným textem („Praxe“, „Vzdělání“…), aby je parser rozpoznal.

Na webu: tlačítko „Download CV“ vede na `cv.pdf`, v české verzi „Stáhnout CV“ na `cv-cs.pdf`; odkaz na strohou verzi analogicky na `cv-plain.pdf` / `cv-plain-cs.pdf`.

## 6. Responzivita, výkon, přístupnost

### Breakpointy

- **≥ 1024 px:** vše podle popisu.
- **768–1023 px:** horizontální scroll projektů zachovat, fyziku zjednodušit (méně těles), kompas menší.
- **< 768 px:** projekty jako nativní swipe carousel (scroll-snap), žádný pin; hero marquee ano, blob se pohybuje sám; Cesta jako vertikální seznam se sticky čísly; Stack jako mřížka; kurzor vypnutý; WebGL s `dpr={[1, 1.5]}`.

### `prefers-reduced-motion: reduce`

Vypnout: pin + horizontální scroll (→ vertikální seznam), Lenis, rozpad písmen, WebGL vlnky, fyziku, marquee (→ statický nadpis), scramble (→ rovnou finální text). Ponechat jen fade/opacity přechody do 200 ms.

### Výkon (cíle)

- Lighthouse mobil: Performance ≥ 85, Accessibility ≥ 95, SEO 100.
- LCP < 2,5 s, CLS < 0,05. Hero nadpis je HTML text, WebGL vrstva se dočte až po něm.
- Fonty přes `next/font` (subset latin + latin-ext), obrázky `next/image` ve WebP/AVIF.
- WebGL pauzovat, když sekce není ve viewportu nebo je tab neaktivní.
- Všechny ScrollTriggery v `useGSAP()` s cleanupem; `ScrollTrigger.refresh()` po načtení fontů a obrázků.

### Přístupnost

- Sémantické HTML (`header`, `nav`, `main`, `section` s `aria-labelledby`, `footer`), jeden `h1` (moje jméno).
- Viditelný focus (zlatý outline 2 px), celý web ovladatelný klávesnicí.
- Animovaný text má vždy čitelnou kopii pro screen readery (`aria-label` na rodiči, rozdělená písmena `aria-hidden`).
- Kontrast textu min. 4,5 : 1 v obou tématech.

## 7. SEO a meta

- `<title>`: „Oldřich Švehla, junior full-stack developer“ (EN, hlavní) / „Oldřich Švehla, junior full-stack vývojář“ (CS).
- Description EN: „Junior full-stack developer from Pilsen, master's student of Software and Information Systems at the University of West Bohemia, regional leader in Klub Pathfinder. Projects, tech stack, contact.“ CS: „Junior full-stack vývojář z Plzně, student navazujícího SWIS na FAV ZČU, vedoucí v Klubu Pathfinder. Projekty, technologie, kontakt.“
- `<html lang>` podle jazyka stránky (en / cs).
- meta author: Oldřich Jan Švehla. Canonical https://cv-oldjas-tan.vercel.app/.
- OG image 1200×630 (`/og.png`, přegenerovat v novém designu), Twitter `summary_large_image`, theme-color `#0A0A0A` / `#F6F3EE`.
- hreflang en (x-default) / cs, `sitemap.xml`, `robots.txt`, JSON-LD Person (name, jobTitle, address Plzeň, alumniOf FAV ZČU, sameAs GitHub).

## 8. Struktura projektu

```
app/
  [locale]/page.tsx        # jedna stránka se sekcemi
  [locale]/layout.tsx
  not-found.tsx            # vtipná 404 („Tahle stránka se ztratila v lese.“)
components/
  layout/  Nav, MenuOverlay, Footer, Cursor, ScrollProgress, ThemeToggle, LangToggle
  sections/ Hero, About, Stats, Projects, ProjectArchive, Stack, Skills, Journey, OffCode, Contact
  webgl/   Scene (sdílený Canvas), HeroRevealMaterial, RippleImage, Compass
  ui/      MagneticButton, ScrambleText, SplitReveal, Marquee, Sticker
  cv/      CvDesign, CvPlain (tiskové komponenty pro PDF)
lib/       gsap.ts (registrace pluginů), lenis.ts, github.ts, useReducedMotion.ts
content/   en.ts, cs.ts, projects.config.ts, stack.config.ts, links.config.ts
scripts/   generate-cv.ts, screenshots.ts
tests/     smoke.spec.ts (Playwright)
public/    logo.svg, cv.pdf, cv-plain.pdf, cv-cs.pdf, cv-plain-cs.pdf, og.png, projects/*.webp
docs/      PROMPT.md (tento dokument)
.github/   workflows/ci.yml
CLAUDE.md
```

`content/links.config.ts` obsahuje i dostupnost: `availability: { hoursPerWeek: 20, location: { en: "Pilsen or remote", cs: "Plzeň nebo remote" } }` – web i obě PDF ji berou odsud. Veškerý text bere komponenta z `content/`, nic nepiš natvrdo do JSX. Odkazy (e-mail, GitHub, LinkedIn, PDF) jsou na jednom místě v `links.config.ts`.

## 9. Priority a postup práce

### Povinné vs. bonus

Kvalita má přednost před množstvím efektů. Lepší méně animací perfektně než všechno napůl.

- **Povinné** (web bez nich nejde ven): veškerý obsah v EN i CS, přepínač jazyka, layout a typografie, navigace, hero s marquee a rozpadem písmen, horizontální projekty, stohy Cesty, karty Co umím, pás statistik, patička s variabilním písmem, kontakt, kotvy kompatibilní se starým webem, obě PDF, responzivita, reduced motion, CI.
- **Bonus** (jen pokud vypadá a běží skvěle): WebGL odkrývání v hero (fallback: SVG maska nebo jen čistý text), WebGL vlnky na projektech (fallback: jednoduchý scale + RGB posun v CSS), 3D kompas (fallback: velké SVG s rotací přes GSAP), fyzikální hromádka (fallback: mřížka s Flip animací).
- Když bonusový efekt nedosáhne kvality (sekání pod 50 fps na běžném notebooku, vizuálně nedotažený), použij fallback a napiš mi proč.

### Postup (dodržuj pořadí, po každé fázi se zastav a ukaž výsledek)

1. **Základ:** CLAUDE.md, docs/PROMPT.md, Next.js + Tailwind + tokeny + fonty + témata + i18n (EN hlavní, CS) + Lenis/GSAP setup + všechny sekce s finálním obsahem v obou jazycích (bez animací) + CI workflow se smoke testy. Web musí být čitelný a použitelný už v této fázi.
2. **Layout a typografie:** grid, navigace, patička, responzivita, light/dark.
3. **Scroll animace (GSAP):** hero rozpad, text reveal, horizontální projekty, stohy Cesty, scramble, statistiky.
4. **Interakce:** kurzor, magnetická tlačítka, draggable pás a karty, hover karty, patičkové písmo, fyzika.
5. **WebGL:** hero reveal shader, vlnky na projektech, 3D kompas.
6. **Obrázky a CV:** screenshoty a covery projektů, tisková stránka a vygenerování všech 4 PDF.
7. **Doladění:** reduced motion, mobil, Lighthouse, a11y, SEO.
8. **Deploy na Vercel + README** s popisem, jak přidat projekt do `projects.config.ts`, technologii do `stack.config.ts`, vyměnit cover za screenshot a přegenerovat CV (`npm run cv`).

Kód piš čistě a komentuj netriviální části (shadery, fyziku, ScrollTrigger timeline) – web je zároveň ukázka mého kódu pro zaměstnavatele.

## 10. Kvalita, CI a provoz

### CLAUDE.md

Hned na začátku vytvoř v kořeni repa `CLAUDE.md` s pravidly projektu, aby se držely napříč sezeními: stack a verze, design tokeny (60/30/10), fonty, angličtina jako hlavní jazyk a povinný český překlad každého nového textu, kotvy sekcí, struktura složek, „žádné easter eggy“, příkazy (dev, build, lint, test, cv, screenshots) a konvence commitů. Tento prompt ulož do `docs/PROMPT.md`.

### Commity

- Konvenční commity v angličtině (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`, `test:`, `ci:`), malé a logické – jeden commit = jedna změna. Historii uvidí technik, který bude repo procházet.
- Commituj po každé dokončené fázi z bodu 9 a uprostřed větších fází.

### CI – GitHub Actions

Workflow `.github/workflows/ci.yml` na každý push a pull request:

1. `npm ci`
2. `npm run lint` (ESLint) a `npm run typecheck` (`tsc --noEmit`)
3. `npm run build`
4. `npm run test` – Playwright smoke testy proti produkčnímu buildu (`next start`):
   - `/` i `/cs` se načtou bez chyb v konzoli a obsahují jméno v `h1`,
   - přepínač jazyka přepne mezi `/` a `/cs` a zachová kotvu,
   - kotvy `#projects`, `#contact` a staré aliasy `#education`, `#experience` existují,
   - `/cv.pdf`, `/cv-plain.pdf`, `/cv-cs.pdf`, `/cv-plain-cs.pdf` vrací 200 a `application/pdf`,
   - s `prefers-reduced-motion: reduce` je obsah všech sekcí viditelný bez scrollových animací.

V README badge stavu CI.

### Analytika

- Vercel Web Analytics (`@vercel/analytics`) a Speed Insights (`@vercel/speed-insights`) v root layoutu. Fungují bez cookies, takže žádná cookie lišta.
- Vlastní eventy: `cv_download` (s parametrem jazyk a verze design/plain), `email_click`, `github_click`, `project_open` (s id projektu), `lang_switch`.
- V README krátce popiš, kde ve Vercel dashboardu analytiku zapnout.
