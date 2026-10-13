import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ButtonContent } from "@/components/ui/ButtonContent";
import { Cursor } from "@/components/layout/Cursor";
import { Intro } from "@/components/layout/Intro";
import { MagneticButtons } from "@/components/motion/MagneticButtons";
import { Providers } from "@/components/layout/Providers";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import { getDictionary } from "@/lib/dictionary";
import { fontVariables } from "@/lib/fonts";
import { localePath } from "@/lib/i18n";

/**
 * Runs before first paint and decides the intro (see lib/motion.ts – IntroState):
 * first visit in the tab → "play", loader already seen → "replay", deep link or reduced motion → "skip".
 */
const INTRO_SCRIPT = `(function(){var s="skip";try{var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;var deep=location.hash.length>1;var seen=sessionStorage.getItem("cv:intro")==="1";s=rm||deep?"skip":seen?"replay":"play"}catch(e){}document.documentElement.dataset.intro=s})();`;

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
  ],
};

export function siteMetadata(locale: Locale): Metadata {
  // Meta tags get the plain text – no invisible joiners in titles and descriptions.
  const t = getDictionary(locale, "plain");
  // Share images made by `npm run og` (app/og).
  const image = { url: locale === "cs" ? "/og-cs.png" : "/og.png", width: 1200, height: 630, alt: t.meta.title };

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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [image],
    },
  };
}

/** The root markup of both language versions – app/(en)/layout.tsx and app/cs/layout.tsx. */
export function SiteLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDictionary(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <a
          href="#main"
          className="btn btn-primary fixed top-3 left-3 z-[200] -translate-y-24 focus-visible:translate-y-0"
        >
          <ButtonContent label={t.a11y.skipLink} icon={null} />
        </a>
        <Providers>
          <Intro />
          {children}
        </Providers>
        <div className="grain" aria-hidden="true" />
        <Cursor viewLabel={t.cursor.view} dragLabel={t.cursor.drag} />
        <MagneticButtons />
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
