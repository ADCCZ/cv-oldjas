import type { Localized, Text } from "./types";

export type Project = {
  /** Stable id: anchor `#project-<id>`, image `/projects/<id>.webp`, analytics. */
  id: string;
  /** `true` = card in the horizontal strip, `false` = row in the archive below it. */
  featured: boolean;
  /** `owner/name` on GitHub; `null` for private repositories. */
  repo: string | null;
  /** Shown instead of the repo link when `repo` is null. Default: "private repo, access on request". */
  privateNote?: Localized;
  /** Live demo URL – also used by `npm run screenshots`. */
  demo?: string;
  title: Text;
  description: Localized;
  /** One sentence for the PDF CVs (two lines in the design grid, one line in the plain list). */
  summary?: Localized;
  stack: Text[];
  /** Labels on the bottom-left of the cover (featured projects only). */
  tags?: Text[];
  /** Real screenshot; when the file is missing, a typographic cover is rendered instead. */
  image?: string;
};

// featured = horizontal strip, archive = list below it
export const projects: Project[] = [
  {
    id: "campmaster",
    featured: true,
    repo: "ADCCZ/campmaster-3000",
    demo: "https://campmaster-3000.vercel.app",
    title: "CampMaster 3000",
    description: {
      cs: "Interaktivní dashboard pro řízení táborové hry: editace tras na mapě, správa týmů, pravidla a bodování v reálném čase. Semestrální projekt KIV/UUR.",
      en: "Interactive dashboard for running a camp game: route editing on a map, team management, rules and real-time scoring. Semester project for KIV/UUR.",
    },
    summary: {
      cs: "Interaktivní dashboard pro řízení táborové hry – editace tras na mapě, správa týmů a bodování v reálném čase.",
      en: "Interactive dashboard for running a camp game – route editing on a map, team management and real-time scoring.",
    },
    stack: ["React", "Tailwind CSS", "Recharts", "Leaflet"],
    tags: ["WEBAPP", "KIV/UUR"],
    image: "/projects/campmaster.webp",
  },
  {
    id: "kiosek",
    featured: true,
    repo: null,
    privateNote: { cs: "soukromé repo týmu", en: "private team repo" },
    title: { cs: "Samoobslužný kiosek", en: "Self-service kiosk" },
    description: {
      cs: "Kiosek pro firemní akce na zakázku Eurosoftware (dnes GK Software Czech Republic): přihlášení NFC kartou, výběr produktů s hlídáním limitů, administrace a statistiky. Moje část: frontend ve Vue.js, NFC, design a UX/UI. Týmový projekt KIV/ZSW-E, LS 2025.",
      en: "Self-service kiosk for company events, built for Eurosoftware (now GK Software Czech Republic): NFC card login, product selection with limits, admin and statistics. My part: Vue.js frontend, NFC, design and UX/UI. Team project, KIV/ZSW-E, spring 2025.",
    },
    summary: {
      cs: "Kiosek pro firemní akce na zakázku Eurosoftware – moje část: frontend ve Vue.js, přihlášení NFC kartou a UX/UI.",
      en: "Kiosk for company events built for Eurosoftware – my part: the Vue.js frontend, NFC card login and UX/UI.",
    },
    stack: ["Vue.js", "JavaScript", "NFC", "UX/UI"],
    tags: [{ cs: "ZAKÁZKA FIRMY", en: "CLIENT PROJECT" }, { cs: "TÝM", en: "TEAM" }],
    image: "/projects/kiosek.webp",
  },
  {
    id: "portal-jk",
    featured: true,
    repo: "ADCCZ/web_oblastni-stranky_jk",
    title: { cs: "Informační a komunitní portál", en: "Information & community portal" },
    description: {
      cs: "Web pro oblast Jižní kříž Klubu Pathfinder, momentálně ve vývoji. Full-stack řešení na míru: autentizace uživatelů, registrace na akce, správa multimediálního obsahu.",
      en: "Website for the Jižní kříž region of Klub Pathfinder, currently in development. Custom full-stack solution: user authentication, event registration, media management.",
    },
    summary: {
      cs: "Full-stack web na míru pro oblast Jižní kříž Klubu Pathfinder: přihlašování, registrace na akce, správa médií.",
      en: "Custom full-stack website for the Jižní kříž region of Klub Pathfinder: user login, event registration, media.",
    },
    stack: ["PHP", "Nette", "Latte", "Tailwind CSS", "MySQL"],
    tags: ["FULL-STACK", { cs: "VE VÝVOJI", en: "IN PROGRESS" }],
    image: "/projects/portal-jk.webp",
  },
  {
    id: "bakalarka",
    featured: true,
    repo: "ADCCZ/bkp-tmwmf",
    title: { cs: "Otevřená data v lázeňských místech", en: "Open data in spa towns" },
    description: {
      cs: "Bakalářský projekt: devět lázeňských a dvě turistická města. Pipeline v Pythonu stahuje data z ČSÚ, MŠMT, MF, MPSV a registru lázní, čistí je, počítá metriky a kreslí 15 grafů s animací a report v Power BI. 24 testů v pytest.",
      en: "Bachelor’s project: nine spa towns and two tourist towns. A Python pipeline downloads data from the Czech Statistical Office, ministries and the spa registry, cleans it, computes metrics and renders 15 animated charts plus a Power BI report. 24 pytest tests.",
    },
    summary: {
      cs: "Pipeline v Pythonu nad otevřenými daty devíti lázeňských měst: čištění, metriky, 15 animovaných grafů, 24 testů.",
      en: "Python pipeline over open data of nine spa towns: cleaning, metrics, 15 animated charts and 24 pytest tests.",
    },
    stack: ["Python", "pandas", "matplotlib", "Power BI", "pytest", { cs: "Otevřená data", en: "Open data" }],
    tags: [{ cs: "BAKALÁŘKA", en: "BACHELOR’S PROJECT" }, "OPEN DATA"],
    image: "/projects/bakalarka.webp",
  },
  {
    id: "pexeso",
    featured: true,
    repo: "ADCCZ/tmwmf_sem_UPS",
    title: { cs: "Síťové pexeso", en: "Networked memory game" },
    description: {
      cs: "Server v čistém C s TCP a select() multiplexingem, klient v JavaFX, vlastní textový protokol. Semestrální projekt KIV/UPS pro 2–4 hráče.",
      en: "Pure C server with TCP and select() multiplexing, JavaFX client, custom text protocol. Semester project for KIV/UPS, 2–4 players.",
    },
    summary: {
      cs: "Hra pro 2–4 hráče: server v čistém C (TCP, select()), klient v JavaFX a vlastní textový protokol.",
      en: "Game for 2–4 players: a pure C server (TCP, select()), a JavaFX client and a custom text protocol.",
    },
    stack: ["C", "TCP/IP", "JavaFX", "Maven", { cs: "Síťové protokoly", en: "Network protocols" }],
    tags: [{ cs: "SÍŤOVÁ HRA", en: "NETWORK GAME" }, "KIV/UPS"],
    image: "/projects/pexeso.webp",
  },
  {
    id: "foodapp",
    featured: true,
    repo: "ADCCZ/web-foodapp",
    title: { cs: "FoodApp „Délicious“", en: "FoodApp “Délicious”" },
    description: {
      cs: "Objednávkový systém rozvozu jídla: košík přes AJAX, správa produktů dodavatelů, schvalování a administrace. Vlastní MVC v PHP 8 bez frameworku, Twig, MySQL přes PDO, Bcrypt, ochrana proti SQL injection a XSS. Semestrální práce KIV/WEB.",
      en: "Food delivery ordering system: AJAX cart, supplier product management, approval and admin. Custom MVC in PHP 8 without a framework, Twig, MySQL via PDO, Bcrypt, SQL injection and XSS protection. Semester project for KIV/WEB.",
    },
    summary: {
      cs: "Objednávky jídla na vlastním MVC v PHP 8 bez frameworku – košík přes AJAX, administrace, ochrana proti SQLi a XSS.",
      en: "Food ordering on a custom PHP 8 MVC without a framework – AJAX cart, admin, SQL injection and XSS protection.",
    },
    stack: ["PHP", "Twig", "MySQL", "JavaScript (AJAX)", "Bootstrap 5"],
    tags: ["WEBAPP", "KIV/WEB"],
    image: "/projects/foodapp.webp",
  },
  {
    id: "cv-oldjas",
    featured: true,
    repo: "ADCCZ/cv-oldjas",
    demo: "https://cv-oldrich-jan-svehla.vercel.app/",
    title: { cs: "Tenhle web", en: "This website" },
    description: {
      cs: "Portfolio, na které se právě díváš: statické stránky v Next.js, animace v GSAP, WebGL shadery v React Three Fiber, PDF životopisy generované Playwrightem a CI se smoke a unit testy.",
      en: "The portfolio you’re looking at: static pages in Next.js, GSAP animations, WebGL shaders in React Three Fiber, PDF CVs generated with Playwright and CI with smoke and unit tests.",
    },
    summary: {
      cs: "Tohle portfolio – Next.js, GSAP a WebGL shadery, PDF životopisy generované Playwrightem.",
      en: "This portfolio – Next.js, GSAP and WebGL shaders, PDF CVs generated with Playwright.",
    },
    stack: ["Next.js", "TypeScript", "GSAP", "Three.js", "Tailwind CSS"],
    tags: ["PORTFOLIO"],
    image: "/projects/cv-oldjas.webp",
  },

  // ---- Archive below the strip: the previous website and the semester projects (private repos) ----
  {
    id: "olda-web",
    featured: false,
    repo: "ADCCZ/olda-web",
    // Still live on its own Vercel project – the address in the applications sent before this website.
    demo: "https://cv-oldjas-tan.vercel.app/",
    title: { cs: "Předchozí web s CV", en: "Previous CV website" },
    description: {
      cs: "Můj předchozí web s CV, stylizovaný jako úřad ze 70. let, který spravuje čas: spisy s razítky, větvící se časová osa, fosforové obrazovky a průvodkyně Složka. Data z GitHubu přes Vercel funkci, kytara syntetizovaná algoritmem Karplus–Strong, pexeso a terminál.",
      en: "My previous CV website, styled as a 1970s office that manages time: case files with stamps, a branching timeline, phosphor screens and Složka, the archive guide. GitHub data through a Vercel function, a guitar synthesised with the Karplus–Strong algorithm, a memory game and a terminal.",
    },
    summary: {
      cs: "Můj předchozí web s CV – hravý úřad ze 70. let v Reactu a TypeScriptu.",
      en: "My previous CV website – a playful 1970s office in React and TypeScript.",
    },
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Motion"],
    image: "/projects/olda-web.webp",
  },
  {
    id: "kmx",
    featured: false,
    repo: null,
    title: { cs: "Emulátor počítače KMX", en: "KMX computer emulator" },
    description: {
      cs: "Emulátor počítače s procesorem architektury MISC v čistém C, testovací programy v assembleru, dokumentace v LaTeXu. KIV/PC.",
      en: "Emulator of a MISC-architecture computer in pure C, assembler test programs, LaTeX docs. KIV/PC.",
    },
    stack: ["C", "Make", "LaTeX"],
  },
  {
    id: "vfs",
    featured: false,
    repo: null,
    title: { cs: "Virtuální souborový systém", en: "Virtual file system" },
    description: {
      cs: "Souborový systém v jediném binárním souboru: i-uzly, adresáře, symbolické linky, import/export souborů, dávkové skripty. KIV/ZOS.",
      en: "File system stored in a single binary file: inodes, directories, symlinks, file import/export, batch scripts. KIV/ZOS.",
    },
    stack: ["C", "CMake"],
  },
  {
    id: "meteo",
    featured: false,
    repo: null,
    title: { cs: "Paralelní zpracování meteodat", en: "Parallel weather data processing" },
    description: {
      cs: "Historická měření meteostanic ČR sériově i paralelně, mapy průměrných teplot v SVG, detekce meziročních výkyvů, měření zrychlení (Amdahl, Gustafson). KIV/UPP.",
      en: "Historical Czech weather-station data processed serially and in parallel, SVG temperature maps, year-on-year anomaly detection, speedup measurement (Amdahl, Gustafson). KIV/UPP.",
    },
    stack: ["C++", "OpenMP", "SVG"],
  },
  {
    id: "opengl-hra",
    featured: false,
    repo: "ADCCZ/zpg-semestral",
    title: { cs: "3D hra v OpenGL", en: "3D game in OpenGL" },
    description: {
      cs: "C# (.NET 8) nad OpenTK: svět z textových map, kolize, kamera, teleporty, baterka jako dynamické světlo, minimapa a vlastní GLSL shadery. KIV/ZPG.",
      en: "C# (.NET 8) on OpenTK: world generated from text maps, collisions, camera, teleports, flashlight as a dynamic light, minimap and custom GLSL shaders. KIV/ZPG.",
    },
    stack: ["C#", ".NET 8", "OpenTK", "GLSL"],
  },
  {
    id: "oks",
    featured: false,
    repo: null,
    title: { cs: "Testování softwaru (10 úloh KIV/OKS)", en: "Software testing (10 KIV/OKS assignments)" },
    description: {
      cs: "Jednotkové testy, mocky, 100% pokrytí příkazů a větví, testovací kampaně ve Squash TM, automatizované testy webu v Robot Frameworku (Page Object Model), BDD v Gherkinu, testy SQLite.",
      en: "Unit tests, mocks, 100% statement and branch coverage, Squash TM test campaigns, automated web tests in Robot Framework (Page Object Model), BDD in Gherkin, SQLite tests.",
    },
    stack: ["pytest", "mock", "coverage", "Squash TM", "Robot Framework", "BDD / Gherkin", "SQLite"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const archiveProjects = projects.filter((p) => !p.featured);

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
