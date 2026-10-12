import { projects } from "./projects.config";

/** Labels live in the dictionaries (`stats.labels[id]`), the falling sticker texts in `stats.stickers`. */
export type Stat = {
  id: "projects" | "technologies" | "camps" | "pathfinder" | "tests" | "charts" | "ferrata" | "guitar";
  /** Numbers count up from 0 when they enter the viewport; strings are shown as they are. */
  value: number | string;
  suffix?: string;
};

export const stats: Stat[] = [
  { id: "projects", value: projects.length },
  { id: "technologies", value: 35, suffix: "+" },
  { id: "camps", value: 3 },
  { id: "pathfinder", value: 2012 },
  { id: "tests", value: 24 },
  { id: "charts", value: 15 },
  { id: "ferrata", value: "D" },
  { id: "guitar", value: 2011 },
];
