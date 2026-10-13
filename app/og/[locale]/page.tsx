import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FULL_NAME } from "@/components/sections/Hero";
import { Segments } from "@/components/ui/Segments";
import { links } from "@/content/links.config";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale, "plain").meta.title } : {};
}

/**
 * The share image (1200 × 630) in the site's design: the name in Archivo on the dark base, the
 * portrait on a red panel (60 / 30 / 10), gold only on the role line. Text from the dictionaries.
 * Only for `npm run og` – on Vercel a static 404, like the CV print pages.
 */
export default async function OgPage({ params }: Props) {
  const { locale } = await params;
  if (process.env.VERCEL || !isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { hoursPerWeek, location } = links.availability;
  // "Oldřich Jan" over "Švehla".
  const words = FULL_NAME.split(" ");
  const lines = [words.slice(0, -1).join(" "), words.at(-1)];

  return (
    <main className="relative flex h-[630px] w-[1200px] overflow-hidden bg-bg text-fg">
      <div className="flex min-w-0 flex-1 flex-col justify-between px-16 pt-14 pb-12">
        <div className="flex items-baseline justify-between">
          <span className="text-[30px] leading-none font-black tracking-display">{t.nav.logo[0]}</span>
          <span className="eyebrow text-[15px] text-fg-muted">{links.siteLabel}</span>
        </div>

        <div>
          <p className="eyebrow text-[17px] text-gold-text">{t.meta.jobTitle}</p>
          <h1 data-og-name className="mt-5 text-[96px] leading-[0.86] font-black tracking-[-0.04em] uppercase">
            {lines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-7 font-serif text-[40px] leading-none text-fg-muted italic">{t.hero.nickname}</p>
        </div>

        <p className="eyebrow flex items-center gap-3 border-t border-line pt-5 text-[15px]">
          <span className="status-dot" aria-hidden="true" />
          <Segments nowrap items={[t.hero.status, `${hoursPerWeek} ${t.availability.hoursUnit}`, location[locale]]} />
        </p>
      </div>

      <div className="relative w-[380px] shrink-0 bg-red-600">
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size screenshot, no optimisation needed */}
        <img src={links.photo.src} alt="" className="absolute bottom-0 left-1/2 h-[400px] w-auto max-w-none -translate-x-1/2" />
      </div>
    </main>
  );
}
