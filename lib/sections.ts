/**
 * Section anchors. They are English and identical in both languages, because links to them
 * are already in sent internship applications – never rename them.
 */
export const SECTION_IDS = ["top", "about", "stats", "projects", "stack", "skills", "journey", "off-code", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Hidden aliases kept from the old website (rendered as empty anchors at the right place):
 * #education / #experience → the start of each stack in #journey, #leadership → #skills.
 */
export const LEGACY_ANCHORS = ["education", "experience", "leadership"] as const;

/** Items of the main navigation. */
export const NAV_ITEMS = ["about", "projects", "stack", "journey", "contact"] as const;
export type NavItem = (typeof NAV_ITEMS)[number];

/** Sections without their own nav item light up the closest preceding item. */
export const NAV_ITEM_FOR_SECTION: Record<SectionId, NavItem | null> = {
  top: null,
  about: "about",
  stats: "about",
  projects: "projects",
  stack: "stack",
  skills: "stack",
  journey: "journey",
  "off-code": "journey",
  contact: "contact",
};
