import type { Dictionary } from "./en";

/** Czech dictionary (served on `/cs`). Every new text on the site needs its translation here. */
export const cs: Dictionary = {
  meta: {
    title: "Oldřich Švehla, junior full-stack vývojář",
    description:
      "Junior full-stack vývojář z Plzně, student navazujícího SWIS na FAV ZČU, vedoucí v Klubu Pathfinder. Projekty, technologie, kontakt.",
    ogLocale: "cs_CZ",
    jobTitle: "Junior full-stack vývojář",
  },

  a11y: {
    skipLink: "Přeskočit na obsah",
    mainNav: "Hlavní navigace",
    language: "Jazyk",
    themeToLight: "Přepnout na světlé téma",
    themeToDark: "Přepnout na tmavé téma",
    home: "OJŠ – Oldřich Jan Švehla, zpět nahoru",
    openInNewTab: "otevře se v nové záložce",
    siteMenu: "Menu webu",
  },

  cursor: {
    view: "Zobrazit projekt ↗",
    drag: "Táhni ↔",
  },

  nav: {
    about: "O mně",
    projects: "Projekty",
    stack: "Stack",
    journey: "Cesta",
    contact: "Kontakt",
    cta: "Napiš mi",
    menu: "Menu",
    close: "Zavřít",
    downloadCv: "Stáhnout CV (PDF)",
    logo: ["OJŠ", "OlďJaŠ", "Oldřich Jan Švehla"],
  },

  hero: {
    role: "Junior full-stack vývojář, Plzeň.",
    nickname: "Pro přátele Olda.",
    ctaWork: "Ukaž projekty →",
    ctaContact: "nebo mi napiš",
    degree: "Bc. · student Ing. SWIS @ FAV ZČU",
    status: "Hledám stáž / částečný úvazek",
    statusShort: "Hledám stáž",
    github: "GitHub",
    clockLabel: "Místní čas v Plzni",
  },

  availability: {
    hoursUnit: "h týdně",
  },

  about: {
    title: "O mně",
    paragraphs: [
      "Junior full-stack vývojář, který věci dotahuje do posledního puntíku. Pocházím ze Strakonic, letos jsem dokončil bakaláře z počítačových věd na FAV ZČU – hlavně z předmětů o vývoji webových aplikací a softwarovém inženýrství – a teď jsem v 1. ročníku navazujícího studia Softwarové a informační systémy.",
      "Baví mě celá cesta od návrhu architektury přes backend a databáze až po poslední detail v rozhraní. Nejčastěji píšu v PHP (Nette), JavaScriptu (React, Vue) a Pythonu, k tomu MySQL, Git a Linux. Za hotové považuju až to, co je otestované a opravdu funguje.",
      "Nové věci se učím rád – díky školním projektům jsem si vyzkoušel NFC, paralelní výpočty v OpenMP i 3D grafiku v OpenGL, teď se pouštím do TypeScriptu. Při vývoji pracuju s AI asistentem Claude (Claude Code), se kterým vznikl i tenhle web.",
    ],
    photoAlt: "Portrét Oldřicha Jana Švehly",
    factsLabel: "Ve zkratce",
    facts: [
      { icon: "degree", text: "Bc. Počítačové vědy – FAV ZČU (2026)" },
      { icon: "book", text: "Ing. SWIS – FAV ZČU, 1. ročník" },
      { icon: "compass", text: "Oblastní vedoucí – Klub Pathfinder, Jižní kříž" },
      { icon: "pin", text: "Plzeň · původem Strakonice" },
      { icon: "speech", text: "Angličtina B2 · němčina základy · španělština začínám" },
    ],
  },

  stats: {
    title: "V číslech",
    labels: {
      projects: "projektů v rejstříku",
      technologies: "technologií, se kterými jsem pracoval",
      camps: "tábory, které jsem vedl (1× programový, 2× hlavní vedoucí)",
      pathfinder: "rok, kdy jsem vstoupil do Klubu Pathfinder",
      tests: "testů v pytest v bakalářském projektu",
      charts: "grafů s animací z otevřených dat lázeňských měst",
      ferrata: "nejtěžší obtížnost ferraty, kterou jsem zatím vylezl",
      guitar: "od kdy hraju na kytaru",
    },
    stickers: {
      projects: ["Hotovo!", "Mergnuto!", "Nasazeno!", "Funguje!"],
      technologies: ["Nový nástroj!", "Naučeno!", "Zkompilováno!", "Hello, world!"],
      camps: ["Táborák!", "Večerka!", "Budíček!", "Stany stojí!"],
      pathfinder: ["Výprava!", "Na stezce!", "Podle kompasu!", "Odborka splněna!"],
      tests: ["Všechno zelené!", "Prošlo!", "Bez regresí!", "Build zelený!"],
      charts: ["Vykresleno!", "Graf hotov!", "Data vyčištěna!", "Trend nalezen!"],
      ferrata: ["Vrchol!", "Zacvaknuto!", "Nahoře!", "Ten výhled!"],
      guitar: ["Přídavek!", "Ještě jednu!", "Naladěno!", "U ohně!"],
    },
  },

  projects: {
    title: "Projekty",
    repo: "Repozitář ↗",
    live: "Živá ukázka ↗",
    allOnGithub: "Všechno na GitHubu ↗",
    privateOwn: "soukromé repo, přístup na vyžádání",
    githubOffline: "GitHub teď neodpovídá, data jsou z poslední zálohy.",
    updated: "aktualizováno",
    stars: "hvězdiček",
    language: "hlavní jazyk",
    dateLocale: "cs-CZ",
    archiveTitle: "Další projekty",
    archiveNote: "Semestrálky v soukromých repech, přístup na vyžádání.",
  },

  stack: {
    title: "Čím stavím",
    subtitle: "Stupnice od prvního vyzkoušení po expertní úroveň.",
    legendTitle: "Stupnice",
    levels: ["zkoušel jsem", "základy, školní projekty", "samostatně na projektech", "pokročile, dlouhodobě", "expert"],
    planned: "v plánu",
    usedIn: "Použito v",
    sort: "Seřadit",
    scatter: "Rozházet",
  },

  skills: {
    title: "Co umím",
    showDetails: "Zobrazit podrobnosti",
    cards: [
      { title: "Frontend", items: ["React a Vue.js", "Tailwind CSS", "UX/UI a design rozhraní", "NFC přihlašování v kiosku"] },
      { title: "Backend", items: ["PHP / Nette a vlastní MVC", "MySQL a PDO", "REST API", "TCP servery v C"] },
      { title: "Data a testování", items: ["Python, pandas, matplotlib", "Power BI", "pytest, Robot Framework, BDD", "otevřená data"] },
      {
        title: "Vedení a organizace",
        items: ["vedení týmů a mentorství", "projektový management a logistika", "zodpovědnost a klid pod tlakem"],
      },
    ],
    softTitle: "Měkké dovednosti",
    soft: [
      {
        title: "Vedení týmů a mentorství",
        text: "Od roku 2018 vedu děti a mladé, od 2024 celou oblast Jižní kříž – koordinuju vedoucí, pomáhám jim s programem a předávám zkušenosti.",
      },
      {
        title: "Projektový management a logistika",
        text: "Tábor je projekt se vším všudy – rozpočet, harmonogram, tým i rizika. Tři jsem vedl, k tomu víkendové akce pro desítky účastníků a účetnictví oblasti.",
      },
      {
        title: "Zodpovědnost a klid pod tlakem",
        text: "Na táboře ani na skalách se nedá nic odložit na zítřek. V nečekané situaci zachovám klid, rychle se rozhodnu a věc dotáhnu.",
      },
    ],
  },

  journey: {
    title: "Cesta",
    education: {
      title: "Vzdělání",
      items: [
        {
          title: "Počítačová grafika a CNC technika",
          period: "2019 – 2023",
          place: "Střední průmyslová škola Strakonice (VOŠ, SPŠ a SOŠ řemesel a služeb)",
          text: [],
        },
        {
          title: "Bc. Počítačové vědy",
          period: "2023 – 2026",
          place: "Fakulta aplikovaných věd, ZČU v Plzni",
          text: [
            "Bakalářský projekt: Otevřená data a jejich analýzy v lázeňských místech pro demografii/školství a turismus.",
          ],
        },
        {
          title: "Ing. Softwarové a informační systémy (SWIS)",
          period: "2026 –",
          place: "Fakulta aplikovaných věd, ZČU v Plzni",
          text: ["Navazující studium, 1. ročník."],
        },
      ],
    },
    experience: {
      title: "Praxe",
      lead: "Placenou praxi v IT teprve hledám. Tohle je to, co mám za sebou.",
      items: [
        {
          title: "Rádce a vedoucí, od 2024 oblastní vedoucí",
          period: "od 2018",
          place: "Klub Pathfinder, oblast Jižní kříž · v klubu od 2012",
          text: [
            "Vedení oblasti: koordinace oddílů a vedoucích, účetnictví oblasti, víkendové akce.",
            "Tábory jsou moje srdcovka: jeden jsem vedl jako programový vedoucí, dva jako hlavní vedoucí. Rozpočet, program, tým, bezpečnost a zázemí pro desítky účastníků.",
            "Práce s dětmi a dospívajícími, řešení nečekaných situací v terénu.",
            "Kurzy: Rádcovský kurz (2020), Vůdcovský kurz (2024), MasterGuide – nejvyšší stupeň vzdělání v Pathfinderu (probíhá, do začátku 2027).",
          ],
        },
        {
          title: "Frontend samoobslužného kiosku",
          period: "LS 2025",
          place: "Eurosoftware, dnes GK Software Czech Republic s.r.o. · týmový projekt KIV/ZSW-E",
          text: [
            "Kiosek, ze kterého si zaměstnanci na firemních akcích berou produkty. Moje část: frontend ve Vue.js, přihlašování NFC kartou, design a UX/UI.",
          ],
        },
        {
          title: "Dobrovolník, security",
          period: "od 2023",
          place: "United – křesťanský multižánrový festival",
          text: [
            "Security na festivalu United v letech 2023 a 2025, od 2023 pravidelně dobrovolničím i na menších akcích United City.",
          ],
        },
        {
          title: "Strojírenská praxe",
          period: "2021, 2022",
          place: "Automa CZ s.r.o., Strakonice – průmyslová automatizace, jednoúčelové stroje",
          text: [
            "Dvakrát 14 dní: montáž klimakomory pro testování displejů do aut Audi a přípravku pro kontrolu displejů Renault podle výkresů a modelu v Inventoru; ruční dokončování strojních dílů; sklad a dokumentace.",
          ],
        },
      ],
    },
    next: {
      title: "Další krok: tvůj tým?",
      cta: "Napiš mi",
    },
  },

  offCode: {
    titleStart: "Mimo",
    titleAccent: "kód",
    cards: [
      { id: "guitar", icon: "guitar", title: "Kytara", text: "Akustická, hraju od roku 2011, hlavně u ohně." },
      {
        id: "pathfinder",
        icon: "tent",
        title: "Klub Pathfinder",
        text: "Od roku 2012, oblastní vedoucí, tábory jsou srdcovka.",
        link: { href: "https://www.pathfinder.cz/", label: "pathfinder.cz ↗" },
      },
      {
        id: "films",
        icon: "film",
        title: "Filmy a seriály",
        text: "Viděl jsem snad každou marvelovku, nejradši mám seriál Loki. Teď sleduju Zrádce na Prima+.",
        link: { href: "https://seriesgraph.com/user/d3854d39-022b-4c98-ab7e-9d17de583a78", label: "Můj SeriesGraph ↗" },
      },
      { id: "games", icon: "gamepad", title: "Videohry", text: "Hraju od roku 2012." },
      { id: "climbing", icon: "mountain", title: "Lezení a outdoor", text: "Po skalách a po ferratách, na nich zatím nejtěžší obtížnost D." },
    ],
  },

  contact: {
    titleLines: ["Hledám [stáž]", "nebo [částečný úvazek]."],
    titleAccent: "Ozvi se.",
    emailButton: "Napsat e-mail @",
    cvButton: "Stáhnout CV ↓",
    cvPlain: "strohá verze pro personální systémy",
    contactTitle: "Kontakt",
    linksTitle: "Odkazy",
    navTitle: "Navigace",
    location: "Lokalita",
    email: "E-mail",
    github: "GitHub",
    linkedin: "LinkedIn",
    copy: "Zkopírovat e-mail",
    copied: "Zkopírováno",
    writeEmail: "Napsat e-mail",
    linkCv: "CV PDF",
  },

  cv: {
    documentTitle: "Oldřich Jan Švehla – životopis",
    label: "Životopis",
    status: "Hledám stáž",
    profile:
      "Junior full-stack vývojář, který věci dotahuje do posledního puntíku. Bakaláře z počítačových věd jsem dokončil na FAV ZČU (2026), teď jsem v 1. ročníku navazujícího studia Softwarové a informační systémy. Baví mě celá cesta od návrhu architektury přes backend a databáze až po poslední detail v rozhraní – nejčastěji v PHP (Nette), JavaScriptu (React, Vue) a Pythonu, k tomu MySQL, Git a Linux. Za hotové považuju až to, co je otestované a opravdu funguje.",
    sections: {
      profile: "Profil",
      experience: "Praxe",
      technologies: "Technologie",
      planned: "V plánu",
      languages: "Jazyky",
      languageSkills: "Jazykové znalosti",
      education: "Vzdělání",
      projects: "Vybrané projekty",
      projectsPlain: "Projekty",
      softSkills: "Měkké dovednosti",
      courses: "Kurzy",
      offCode: "Mimo kód",
      availability: "Dostupnost",
    },
    contact: { email: "E-mail", phone: "Telefon", github: "GitHub", web: "Web" },
    scale: "Stupnice",
    also: "Dále",
    otherProjects: "Další projekty",
    languages: [
      { name: "Čeština", level: "rodilý mluvčí" },
      { name: "Angličtina", level: "B2" },
      { name: "Němčina", level: "základy" },
      { name: "Španělština", level: "začínám" },
    ],
    courses: [
      { name: "Rádcovský kurz", period: "2020" },
      { name: "Vůdcovský kurz", period: "2024" },
      { name: "MasterGuide – nejvyšší stupeň vzdělání v Pathfinderu", period: "probíhá, do začátku 2027" },
    ],
    offCode: [
      "Kytara – akustická, od roku 2011, hlavně u ohně",
      "Lezení a ferraty – zatím nejtěžší obtížnost\u00a0D",
      "Videohry od roku 2012 · marvelovky, nejradši seriál Loki",
    ],
  },

  footer: {
    place: "Plzeň, CZ",
    built: "Postaveno s Next.js, GSAP a Three.js",
    source: "Kód tohoto webu je na GitHubu",
    top: "Nahoru ↑",
  },
};
