import type { Localized, Text } from "./types";

/** 1 tried it · 2 basics, school projects · 3 independently on projects · 4 advanced, long-term · 5 expert */
export type Level = 1 | 2 | 3 | 4 | 5;

export type Tech = {
  id: string;
  name: Text;
  /** Missing for technologies in the "planned" category. */
  level?: Level;
  /** Shorter name for the narrow technology column of the design CV, when the full one would wrap. */
  cvName?: Text;
  /** simple-icons slug of the monochrome logo (see lib/techIcons.ts); omitted when the brand has none. */
  icon?: string;
  /** Project ids from projects.config.ts – the tooltip links to them. */
  usedIn?: string[];
};

export type StackCategory = {
  id: string;
  name: Localized;
  /** Technologies I want to learn next – rendered transparent with a dashed outline. */
  planned?: boolean;
  items: Tech[];
};

export const stack: StackCategory[] = [
  {
    id: "languages",
    name: { en: "Languages", cs: "Jazyky" },
    items: [
      { id: "python", name: "Python", level: 4, icon: "python", usedIn: ["bakalarka", "oks", "kmx", "olda-web"] },
      { id: "php", name: "PHP", level: 3, icon: "php", usedIn: ["portal-jk", "foodapp"] },
      { id: "c", name: "C", level: 3, icon: "c", usedIn: ["pexeso", "kmx", "vfs"] },
      { id: "javascript", name: "JavaScript", level: 3, icon: "javascript", usedIn: ["campmaster", "kiosek", "foodapp"] },
      { id: "sql", name: "SQL", level: 3, usedIn: ["portal-jk", "foodapp", "oks"] },
      { id: "java", name: "Java", level: 2, icon: "openjdk", usedIn: ["pexeso"] },
      { id: "csharp", name: "C#", level: 2, icon: "dotnet", usedIn: ["opengl-hra"] },
      { id: "cpp", name: "C++", level: 2, icon: "cplusplus", usedIn: ["meteo"] },
      { id: "typescript", name: "TypeScript", level: 2, icon: "typescript", usedIn: ["cv-oldjas", "olda-web"] },
    ],
  },
  {
    id: "web",
    name: { en: "Web & frameworks", cs: "Web a frameworky" },
    items: [
      { id: "html-css", name: "HTML5 / CSS3", level: 4, icon: "html5", usedIn: ["portal-jk", "foodapp", "campmaster", "kiosek", "olda-web", "cv-oldjas"] },
      { id: "nette", name: "Nette", level: 3, icon: "nette", usedIn: ["portal-jk"] },
      { id: "latte", name: "Latte", level: 3, usedIn: ["portal-jk"] },
      { id: "tailwind", name: "Tailwind CSS", level: 3, icon: "tailwindcss", usedIn: ["portal-jk", "campmaster", "cv-oldjas", "olda-web"] },
      { id: "react", name: "React", level: 3, icon: "react", usedIn: ["campmaster", "cv-oldjas", "olda-web"] },
      { id: "vue", name: "Vue.js", level: 3, icon: "vuedotjs", usedIn: ["kiosek"] },
      { id: "nextjs", name: "Next.js", level: 2, icon: "nextdotjs", usedIn: ["cv-oldjas"] },
      { id: "twig", name: "Twig", level: 2, usedIn: ["foodapp"] },
      { id: "bootstrap", name: "Bootstrap", level: 2, icon: "bootstrap", usedIn: ["foodapp"] },
      { id: "ux-ui", name: "UX/UI design", level: 2, usedIn: ["kiosek", "campmaster"] },
      { id: "node", name: "Node.js – Express, Socket.IO", level: 2, icon: "nodedotjs", usedIn: ["campmaster"] },
      { id: "gsap", name: "GSAP / Motion", level: 1, icon: "gsap", usedIn: ["cv-oldjas", "olda-web"] },
    ],
  },
  {
    id: "architecture",
    name: { en: "Architecture & networking", cs: "Architektura a sítě" },
    items: [
      { id: "mvc", name: { en: "MVC / MVP architecture", cs: "MVC / MVP architektura" }, level: 4, usedIn: ["portal-jk", "foodapp"] },
      { id: "tcp", name: { en: "TCP/IP sockets, custom protocol", cs: "TCP/IP sokety, vlastní protokol" }, level: 3, usedIn: ["pexeso"] },
      { id: "rest", name: "REST API", level: 2, usedIn: ["campmaster", "olda-web", "cv-oldjas"] },
      { id: "websockets", name: { en: "WebSockets – Socket.IO", cs: "WebSockety – Socket.IO" }, level: 2, icon: "socketdotio", usedIn: ["campmaster"] },
      { id: "openmp", name: { en: "Parallelism – OpenMP", cs: "Paralelizace – OpenMP" }, level: 2, usedIn: ["meteo"] },
      { id: "oauth", name: "OAuth 2.0", level: 2, usedIn: ["portal-jk"] },
      { id: "nfc", name: "NFC", level: 2, icon: "nfc", usedIn: ["kiosek"] },
    ],
  },
  {
    id: "tools",
    name: { en: "Databases & tools", cs: "Databáze a nástroje" },
    items: [
      { id: "git", name: { en: "Git & GitHub", cs: "Git a GitHub" }, level: 4, icon: "git" },
      { id: "latex", name: "LaTeX", level: 4, icon: "latex", usedIn: ["kmx", "vfs", "pexeso", "foodapp", "campmaster"] },
      { id: "mysql", name: "MySQL", level: 3, icon: "mysql", usedIn: ["portal-jk", "foodapp"] },
      { id: "linux", name: "Linux WSL", level: 3, icon: "linux", usedIn: ["kmx", "vfs", "pexeso"] },
      { id: "vite", name: "Vite", level: 3, icon: "vite", usedIn: ["portal-jk", "campmaster", "olda-web"] },
      { id: "build-tools", name: "Make / CMake / Maven", level: 3, icon: "cmake", usedIn: ["kmx", "vfs", "pexeso"] },
      {
        id: "testing",
        name: { en: "Testing – pytest, Robot Framework", cs: "Testování – pytest, Robot Framework" },
        cvName: "pytest / Robot Framework",
        level: 3,
        icon: "pytest",
        usedIn: ["oks", "bakalarka", "olda-web"],
      },
      { id: "vercel", name: "Vercel", level: 2, icon: "vercel", usedIn: ["campmaster", "olda-web", "cv-oldjas"] },
      { id: "docker", name: "Docker", level: 2, icon: "docker", usedIn: ["portal-jk"] },
      { id: "gh-actions", name: "GitHub Actions (CI/CD)", level: 1, icon: "githubactions", usedIn: ["cv-oldjas", "olda-web"] },
      { id: "playwright", name: "Playwright", level: 1, usedIn: ["cv-oldjas"] },
    ],
  },
  {
    id: "data",
    name: { en: "Graphics & data", cs: "Grafika a data" },
    items: [
      { id: "pandas", name: "pandas / matplotlib", level: 3, icon: "pandas", usedIn: ["bakalarka"] },
      { id: "open-data", name: { en: "Open data", cs: "Otevřená data" }, level: 3, usedIn: ["bakalarka"] },
      { id: "powerbi", name: "Power BI", level: 2, usedIn: ["bakalarka"] },
      { id: "opengl", name: "OpenGL / OpenTK, GLSL", level: 2, icon: "opengl", usedIn: ["opengl-hra"] },
      { id: "javafx", name: "JavaFX", level: 2, usedIn: ["pexeso"] },
      { id: "threejs", name: "Three.js", level: 1, icon: "threedotjs", usedIn: ["cv-oldjas"] },
    ],
  },
  {
    id: "planned",
    name: { en: "Planned", cs: "V plánu" },
    planned: true,
    items: [
      { id: "postgresql", name: "PostgreSQL", icon: "postgresql" },
      { id: "spring", name: "Spring Boot", icon: "springboot" },
      { id: "junit-jest", name: "JUnit / Jest", icon: "jest" },
      { id: "kubernetes", name: "Kubernetes", icon: "kubernetes" },
      { id: "aws", name: "AWS / cloud" },
    ],
  },
];
