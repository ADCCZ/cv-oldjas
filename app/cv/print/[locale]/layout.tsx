import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/i18n";
import "../print.css";

/**
 * Root layout of the CV print pages, rendered to PDF by `npm run cv` (scripts/generate-cv.ts).
 * Its own <html>: light colours, the site's fonts and tokens, but no navigation, no animations,
 * no analytics – and no JavaScript the PDF would need.
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

export default async function PrintLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} data-theme="light" className={`${fontVariables} cv-doc`}>
      <body>{children}</body>
    </html>
  );
}
