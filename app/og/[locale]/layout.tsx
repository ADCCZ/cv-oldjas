import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n";

/**
 * Root layout of the share image pages (/og/en, /og/cs), shot to public/og.png and og-cs.png by
 * `npm run og` (scripts/og.ts). The site's dark theme and fonts, nothing else – no scripts needed.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function OgLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // No scrollbar gutter (globals.css reserves one): the screenshot is exactly the 1200 × 630 card.
    <html lang={locale} data-theme="dark" className={fontVariables} style={{ overflow: "hidden", scrollbarGutter: "auto" }}>
      <body>{children}</body>
    </html>
  );
}
