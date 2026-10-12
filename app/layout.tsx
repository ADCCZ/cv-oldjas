import "./globals.css";

/**
 * The real root layout (with <html lang>) is app/[locale]/layout.tsx, so each language gets
 * the right `lang` attribute in the static HTML. This file only exists because the global
 * not-found page needs a root layout – it passes children through.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
