import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/layout/Providers";
import { links } from "@/content/links.config";
import { getDictionary } from "@/lib/dictionary";
import { fontVariables } from "@/lib/fonts";
import { isLocale, localePath, locales } from "@/lib/i18n";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Only /en (served as /) and /cs exist – everything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(links.site),
    title: t.meta.title,
    description: t.meta.description,
    authors: [{ name: "Oldřich Jan Švehla", url: links.site }],
    creator: "Oldřich Jan Švehla",
    alternates: {
      canonical: localePath(locale),
      languages: { en: "/", cs: "/cs", "x-default": "/" },
    },
    openGraph: {
      type: "profile",
      firstName: "Oldřich",
      lastName: "Švehla",
      locale: t.meta.ogLocale,
      url: localePath(locale),
      siteName: "Oldřich Jan Švehla",
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="pill pill-red fixed top-3 left-3 z-[200] -translate-y-24 focus-visible:translate-y-0"
        >
          {t.a11y.skipLink}
        </a>
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden="true" />
        {/* Analytics only on Vercel – locally the scripts would 404 and pollute the console. */}
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
