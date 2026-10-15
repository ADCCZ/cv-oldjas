/**
 * English dictionary – the main language of the site (served on `/`).
 * Its shape defines the `Dictionary` type, so every key must also exist in `cs.ts`.
 * Names of courses (KIV/UUR…), companies and schools stay untranslated.
 */
export const en = {
  meta: {
    title: "Oldřich Švehla, junior full-stack developer",
    description:
      "Junior full-stack developer from Pilsen, master’s student of Software and Information Systems at the University of West Bohemia, regional leader in Klub Pathfinder. Projects, tech stack, contact.",
    ogLocale: "en_US",
    jobTitle: "Junior full-stack developer",
  },

  a11y: {
    skipLink: "Skip to content",
    mainNav: "Main navigation",
    language: "Language",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    home: "OJŠ – Oldřich Jan Švehla, back to top",
    openInNewTab: "opens in a new tab",
    siteMenu: "Site menu",
  },

  /** Labels of the custom cursor (fine pointers only). */
  cursor: {
    view: "View project ↗",
    drag: "Drag ↔",
  },

  nav: {
    about: "About",
    projects: "Projects",
    stack: "Stack",
    journey: "Journey",
    contact: "Contact",
    cta: "Get in touch",
    menu: "Menu",
    close: "Close",
    downloadCv: "Download CV (PDF)",
    /** The header monogram unfolds through these on hover (Logo). */
    logo: ["OJŠ", "OlďJaŠ", "Oldřich Jan Švehla"],
  },

  hero: {
    role: "Junior full-stack developer, Pilsen.",
    nickname: "Friends call me Olda.",
    ctaWork: "See my work →",
    ctaContact: "or get in touch",
    degree: "Bc. · Master’s student, SWIS @ FAV ZČU",
    status: "Open to internships & part-time",
    statusShort: "Open to work",
    github: "GitHub",
    clockLabel: "Local time in Pilsen",
  },

  /** Used wherever the availability line is composed: "20 h/week · Pilsen or remote". */
  availability: {
    hoursUnit: "h/week",
  },

  about: {
    title: "About",
    paragraphs: [
      "Junior full-stack developer who sees things through to the last detail. I’m originally from Strakonice. This year I finished my bachelor’s in Computer Science at FAV ZČU – mostly courses on web application development and software engineering – and I’m now in the first year of the master’s in Software and Information Systems.",
      "I enjoy the whole journey, from designing the architecture through the backend and databases to the last detail of the interface. I mostly write PHP (Nette), JavaScript (React, Vue) and Python, with MySQL, Git and Linux around it. I only call something done once it’s tested and actually works.",
      "I like learning new things – school projects got me to try NFC, parallel computing with OpenMP and 3D graphics in OpenGL, and now I’m getting into TypeScript. I work with the AI assistant Claude (Claude Code), which I also built this website with.",
    ],
    photoAlt: "Portrait of Oldřich Jan Švehla",
    factsLabel: "Quick facts",
    facts: [
      { icon: "degree", text: "Bc. in Computer Science – FAV ZČU (2026)" },
      { icon: "book", text: "Ing. (master’s) in SWIS – FAV ZČU, 1st year" },
      { icon: "compass", text: "Regional leader – Klub Pathfinder, Jižní kříž" },
      { icon: "pin", text: "Pilsen · originally from Strakonice" },
      { icon: "speech", text: "English B2 · German basics · Spanish beginner" },
    ],
  },

  stats: {
    title: "In numbers",
    labels: {
      projects: "projects in the register",
      technologies: "technologies I’ve worked with",
      camps: "camps I’ve led (1× programme leader, 2× head leader)",
      pathfinder: "the year I joined Klub Pathfinder",
      tests: "pytest tests in my bachelor’s project",
      charts: "animated charts from spa-town open data",
      ferrata: "the hardest via ferrata grade I’ve climbed so far",
      guitar: "playing guitar since",
    },
    /** Stickers thrown out by the mouse over each number (StatsPills). */
    stickers: {
      projects: ["Shipped!", "Merged!", "Deployed!", "It works!"],
      technologies: ["New tool!", "Learned!", "Compiled!", "Hello, world!"],
      camps: ["Campfire!", "Lights out!", "Wake-up call!", "Tents up!"],
      pathfinder: ["Expedition!", "On the trail!", "Compass check!", "Badge earned!"],
      tests: ["All green!", "Passed!", "No regressions!", "Green build!"],
      charts: ["Plotted!", "Animated!", "Data cleaned!", "Trend found!"],
      ferrata: ["Summit!", "Clipped in!", "Topped out!", "What a view!"],
      guitar: ["Encore!", "One more song!", "In tune!", "Campfire song!"],
    },
  },

  projects: {
    title: "Projects",
    repo: "Repository ↗",
    live: "Live demo ↗",
    allOnGithub: "Everything on GitHub ↗",
    privateOwn: "private repo, access on request",
    githubOffline: "GitHub isn’t responding right now – the data is from the last backup.",
    updated: "updated",
    stars: "stars",
    language: "main language",
    dateLocale: "en-GB",
    archiveTitle: "More projects",
    archiveNote: "Semester projects in private repos, access on request.",
  },

  stack: {
    title: "What I build with",
    subtitle: "A scale from first try to expert level.",
    legendTitle: "Scale",
    levels: ["tried it", "basics, school projects", "independently on projects", "advanced, long-term", "expert"],
    planned: "planned",
    usedIn: "Used in",
    sort: "Sort",
    scatter: "Scatter",
  },

  skills: {
    title: "What I can do",
    showDetails: "Show details",
    cards: [
      { title: "Frontend", items: ["React and Vue.js", "Tailwind CSS", "UX/UI and interface design", "NFC sign-in in a kiosk"] },
      { title: "Backend", items: ["PHP / Nette and custom MVC", "MySQL and PDO", "REST APIs", "TCP servers in C"] },
      { title: "Data & testing", items: ["Python, pandas, matplotlib", "Power BI", "pytest, Robot Framework, BDD", "Open data"] },
      {
        title: "Leadership & organisation",
        items: ["Leading teams and mentoring", "Project management and logistics", "Responsibility and calm under pressure"],
      },
    ],
    softTitle: "Soft skills",
    soft: [
      {
        title: "Leading teams and mentoring",
        text: "I’ve been leading children and young people since 2018 and the whole Jižní kříž region since 2024 – I coordinate leaders, help them with their programmes and pass on what I’ve learned.",
      },
      {
        title: "Project management and logistics",
        text: "A camp is a project in every sense – budget, schedule, team and risks. I’ve run three, plus weekend events for dozens of participants and the region’s accounts.",
      },
      {
        title: "Responsibility and calm under pressure",
        text: "At camp or on a rock face, nothing can be put off until tomorrow. When something unexpected happens, I stay calm, decide quickly and see it through.",
      },
    ],
  },

  journey: {
    title: "Journey",
    education: {
      title: "Education",
      items: [
        {
          title: "Computer Graphics and CNC Technology",
          period: "2019 – 2023",
          place: "VOŠ, SPŠ a SOŠ řemesel a služeb Strakonice (Secondary Technical School, Strakonice)",
          text: [] as string[],
        },
        {
          title: "Bc. Computer Science",
          period: "2023 – 2026",
          place: "Fakulta aplikovaných věd, ZČU v Plzni (Faculty of Applied Sciences, University of West Bohemia)",
          text: [
            "Bachelor’s project: Open data and its analysis in spa towns for demography/education and tourism.",
          ],
        },
        {
          title: "Ing. Software and Information Systems (SWIS)",
          period: "2026 –",
          place: "Fakulta aplikovaných věd, ZČU v Plzni (Faculty of Applied Sciences, University of West Bohemia)",
          text: ["Master’s programme, 1st year."],
        },
      ],
    },
    experience: {
      title: "Experience",
      lead: "I’m still looking for my first paid IT role. This is what I have behind me.",
      items: [
        {
          title: "Patrol leader and leader, regional leader since 2024",
          period: "since 2018",
          place: "Klub Pathfinder, Jižní kříž region · member since 2012",
          text: [
            "Leading the region: coordinating units and their leaders, keeping the regional accounts, running weekend events.",
            "Camps are my passion: I ran one as programme leader and two as head leader. Budget, programme, team, safety and logistics for dozens of participants.",
            "Working with children and teenagers, handling unexpected situations in the field.",
            "Courses: Patrol Leader Course (2020), Unit Leader Course (2024), Master Guide – the highest level of training in Pathfinder (in progress, until early 2027).",
          ],
        },
        {
          title: "Frontend of a self-service kiosk",
          period: "spring 2025",
          place: "Eurosoftware, now GK Software Czech Republic s.r.o. · team project, KIV/ZSW-E",
          text: [
            "A kiosk where employees pick up products at company events. My part: the Vue.js frontend, NFC card sign-in, design and UX/UI.",
          ],
        },
        {
          title: "Volunteer, security",
          period: "since 2023",
          place: "United – Christian multi-genre festival",
          text: [
            "Security at the United festival in 2023 and 2025; since 2023 I’ve also volunteered regularly at the smaller United City events.",
          ],
        },
        {
          title: "Mechanical engineering placement",
          period: "2021, 2022",
          place: "Automa CZ s.r.o., Strakonice – industrial automation, special-purpose machines",
          text: [
            "Twice for 14 days: assembling a climate chamber for testing Audi car displays and a fixture for inspecting Renault displays from drawings and an Inventor model; hand-finishing machined parts; warehouse and documentation.",
          ],
        },
      ],
    },
    next: {
      title: "Next step: your team?",
      cta: "Get in touch",
    },
  },

  offCode: {
    titleStart: "Beyond",
    titleAccent: "code",
    cards: [
      { id: "guitar", icon: "guitar", title: "Guitar", text: "Acoustic, playing since 2011, mostly by the campfire." },
      {
        id: "pathfinder",
        icon: "tent",
        title: "Klub Pathfinder",
        text: "Since 2012, regional leader – camps are my passion.",
        link: { href: "https://www.pathfinder.cz/", label: "pathfinder.cz ↗" },
      },
      {
        id: "films",
        icon: "film",
        title: "Films & series",
        text: "I’ve seen just about every Marvel film; my favourite is the Loki series. Currently watching Zrádci (The Traitors) on Prima+.",
        link: { href: "https://seriesgraph.com/user/d3854d39-022b-4c98-ab7e-9d17de583a78", label: "My SeriesGraph ↗" },
      },
      { id: "games", icon: "gamepad", title: "Video games", text: "Playing since 2012." },
      { id: "climbing", icon: "mountain", title: "Climbing & outdoors", text: "Rocks and via ferratas – the hardest grade so far is D." },
    ],
  },

  contact: {
    /** The big ask: one line each (never "an" at a line end), the accent in the serif italic.
        [Brackets] mark the words with the hand-drawn underline. */
    titleLines: ["Looking for an [internship]", "or a [part-time] role."],
    titleAccent: "Let’s talk.",
    emailButton: "Email me @",
    cvButton: "Download CV ↓",
    cvPlain: "plain version for applicant tracking systems",
    contactTitle: "Contact",
    linksTitle: "Links",
    navTitle: "Navigation",
    location: "Location",
    email: "E-mail",
    github: "GitHub",
    linkedin: "LinkedIn",
    copy: "Copy e-mail address",
    copied: "Copied",
    writeEmail: "Write an e-mail",
    linkCv: "CV PDF",
  },

  /** The PDF CVs (app/cv/print, rendered by `npm run cv`). Condensed from the sections above – no new facts. */
  cv: {
    documentTitle: "Oldřich Jan Švehla – CV",
    label: "CV",
    status: "Open to internships",
    profile:
      "Junior full-stack developer who sees things through to the last detail. Bachelor’s in Computer Science from FAV ZČU (2026), now in the first year of the master’s in Software and Information Systems. I enjoy the whole journey from the architecture through the backend and databases to the last detail of the interface – mostly in PHP (Nette), JavaScript (React, Vue) and Python, with MySQL, Git and Linux around it. I only call something done once it’s tested and actually works.",
    sections: {
      profile: "Profile",
      experience: "Experience",
      technologies: "Technologies",
      planned: "Planned",
      languages: "Languages",
      languageSkills: "Language skills",
      education: "Education",
      projects: "Selected projects",
      projectsPlain: "Projects",
      softSkills: "Soft skills",
      courses: "Courses",
      offCode: "Beyond code",
      availability: "Availability",
    },
    contact: { email: "E-mail", phone: "Phone", github: "GitHub", web: "Web" },
    scale: "Scale",
    also: "Also",
    otherProjects: "Other projects",
    languages: [
      { name: "Czech", level: "native" },
      { name: "English", level: "B2" },
      { name: "German", level: "basics" },
      { name: "Spanish", level: "beginner" },
    ],
    courses: [
      { name: "Patrol Leader Course", period: "2020" },
      { name: "Unit Leader Course", period: "2024" },
      { name: "Master Guide – the highest level of training in Pathfinder", period: "in progress, until early 2027" },
    ],
    offCode: [
      "Guitar – acoustic, since 2011, mostly by the campfire",
      "Climbing and via ferratas – the hardest grade so far is\u00a0D",
      "Video games since 2012 · Marvel films, favourite series Loki",
    ],
  },

  footer: {
    place: "Pilsen, CZ",
    built: "Built with Next.js, GSAP and Three.js",
    source: "The code of this site is on GitHub",
    top: "Back to top ↑",
  },
};

export type Dictionary = typeof en;
