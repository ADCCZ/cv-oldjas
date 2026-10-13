/**
 * What the PDF CVs (app/cv/print, `npm run cv`) pick from the shared content – the CV and the
 * website read the same data, so they never drift apart.
 */
export const cvConfig = {
  /** The 2 × 3 project grid of the design CV, in this order. The plain CV lists every featured project. */
  projects: ["campmaster", "bakalarka", "kiosek", "portal-jk", "pexeso", "foodapp"],
  /** Technologies from this level up get the level squares in the design CV; the rest follow on one line. */
  mainLevel: 3,
} as const;
