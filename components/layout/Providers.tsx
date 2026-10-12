"use client";

import { ThemeProvider } from "next-themes";
import { SmoothScroll } from "./SmoothScroll";

/**
 * Theme: dark is the designed default, but the visitor's OS preference wins until they
 * pick a theme with the toggle (stored in localStorage by next-themes).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem themes={["dark", "light"]} disableTransitionOnChange>
      <SmoothScroll>{children}</SmoothScroll>
    </ThemeProvider>
  );
}
