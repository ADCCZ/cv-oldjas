import type { Localized, Text } from "./types";

/** 1 tried it · 2 basics, school projects · 3 independently on projects · 4 advanced, long-term · 5 expert */
export type Level = 1 | 2 | 3 | 4 | 5;

export type Tech = {
  id: string;
  name: Text;
  /** Missing for technologies in the "planned" category. */
  level?: Level;
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
      { id: "python", name: "Python", level: 4, icon: "python", usedIn: ["bakalarka", "oks"] },
      { id: "php", name: "PHP", level: 3, icon: "php", usedIn: ["portal-jk", "foodapp"] },
      { id: "c", name: "C", level: 3, icon: "c", usedIn: ["pexeso", "kmx", "vfs"] },
      { id: "javascript", name: "JavaScript", level: 3, icon: "javascript", usedIn: ["campmaster", "kiosek", "foodapp"] },
      { id: "sql", name: "SQL", level: 3, usedIn: ["portal-jk", "foodapp"] },
      { id: "java", name: "Java", level: 2, icon: "openjdk", usedIn: ["pexeso"] },
      { id: "csharp", name: "C#", level: 2, icon: "dotnet", usedIn: ["opengl-hra"] },
      { id: "cpp", name: "C++", level: 2, icon: "cplusplus", usedIn: ["meteo"] },
      { id: "typescript", name: "TypeScript", level: 1, icon: "typescript", usedIn: ["cv-oldjas"] },
    ],
  },
  {
    id: "web",
    name: { en: "Web & frameworks", cs: "Web a frameworky" },
    items: [
      { id: "html-css", name: "HTML5 / CSS3", level: 4, icon: "html5", usedIn: ["portal-jk", "foodapp", "campmaster"] },
      { id: "nette", name: "Nette", level: 3, icon: "nette", usedIn: ["portal-jk"] },
      { id: "latte", name: "Latte", level: 3, usedIn: ["portal-jk"] },
      { id: "tailwind", name: "Tailwind CSS", level: 3, icon: "tailwindcss", usedIn: ["portal-jk", "campmaster", "cv-oldjas"] },
      { id: "react", name: "React", level: 3, icon: "react", usedIn: ["campmaster", "cv-oldjas"] },
      { id: "vue", name: "Vue.js", level: 3, icon: "vuedotjs", usedIn: ["kiosek"] },
      { id: "nextjs", name: "Next.js", level: 2, icon: "nextdotjs", usedIn: ["cv-oldjas"] },
      { id: "twig", name: "Twig", level: 2, usedIn: ["foodapp"] },
      { id: "ux-ui", name: "UX/UI design", level: 2, usedIn: ["kiosek", "campmaster"] },
      { id: "node", name: "Node.js – Express, Socket.IO", level: 2, icon: "nodedotjs", usedIn: ["campmaster"] },
    ],
  },
  {
    id: "architecture",
    name: { en: "Architecture & networking", cs: "Architektura a sítě" },
    items: [
      { id: "mvc", name: { en: "MVC / MVP architecture", cs: "MVC / MVP architektura" }, level: 4, usedIn: ["portal-jk", "foodapp"] },
      { id: "tcp", name: { en: "TCP/IP sockets, custom protocol", cs: "TCP/IP sokety, vlastní protokol" }, level: 3, usedIn: ["pexeso"] },
      { id: "rest", name: "REST API", level: 2, usedIn: ["campmaster"] },
      { id: "websockets", name: { en: "WebSockets – Socket.IO", cs: "WebSockety – Socket.IO" }, level: 2, icon: "socketdotio", usedIn: ["campmaster"] },
      { id: "openmp", name: { en: "Parallelism – OpenMP", cs: "Paralelizace – OpenMP" }, level: 2, usedIn: ["meteo"] },
      { id: "oauth", name: "OAuth 2.0", level: 1, usedIn: ["portal-jk"] },
      { id: "nfc", name: "NFC", level: 1, icon: "nfc", usedIn: ["kiosek"] },
    ],
  },
  {
    id: "tools",
    name: { en: "Databases & tools", cs: "Databáze a nástroje" },
    items: [
      { id: "git", name: { en: "Git & GitHub", cs: "Git a GitHub" }, level: 4, icon: "git" },
      { id: "latex", name: "LaTeX", level: 4, icon: "latex", usedIn: ["kmx"] },
      { id: "mysql", name: "MySQL", level: 3, icon: "mysql", usedIn: ["portal-jk", "foodapp"] },
      { id: "linux", name: "Linux WSL", level: 3, icon: "linux" },
      { id: "vite", name: "Vite", level: 3, icon: "vite", usedIn: ["portal-jk", "campmaster"] },
      { id: "build-tools", name: "Make / CMake / Maven", level: 3, icon: "cmake", usedIn: ["kmx", "vfs", "pexeso"] },
      { id: "docker", name: "Docker", level: 1, icon: "docker", usedIn: ["portal-jk"] },
      { id: "gh-actions", name: "GitHub Actions (CI/CD)", level: 1, icon: "githubactions", usedIn: ["cv-oldjas"] },
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
    ],
  },
  {
    id: "planned",
    name: { en: "Planned", cs: "V plánu" },
    planned: true,
    items: [
      { id: "postgresql", name: "PostgreSQL", icon: "postgresql" },
      { id: "spring", name: "Spring Boot", icon: "springboot" },
      { id: "testing", name: { en: "Testing (JUnit, Jest)", cs: "Testování (JUnit, Jest)" }, icon: "jest" },
      { id: "kubernetes", name: "Kubernetes", icon: "kubernetes" },
      { id: "aws", name: "AWS / cloud" },
    ],
  },
];
