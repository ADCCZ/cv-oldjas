import { notFound } from "next/navigation";
import { Segments } from "@/components/ui/Segments";
import { links } from "@/content/links.config";
import { stack } from "@/content/stack.config";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, tx } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

/** The technologies on the banner, in this order – the same as in the About text. */
const BANNER_STACK = ["php", "nette", "react", "vue", "python"];

/**
 * LinkedIn profile banner (1584 × 396), shot to docs/linkedin-banner.png by `npm run og`.
 * LinkedIn lays the round profile photo over the bottom-left corner, so that corner is only the
 * red panel (the photo sits on it) and all text keeps to the dark part on the right.
 * The headline is the contact line of the site, its last sentence in the serif accent – so the status
 * line below takes the short form ("Open to work").
 * Only for `npm run og` – on Vercel a static 404, like the share image pages.
 */
export default async function LinkedinBannerPage({ params }: Props) {
  const { locale } = await params;
  if (process.env.VERCEL || !isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { hoursPerWeek, location } = links.availability;
  const lead = t.contact.titleLines.join(" ").replace(/[\[\]]/g, ""); // no underline marks here
  const accent = t.contact.titleAccent;
  const techs = stack.flatMap((category) => category.items);
  const names = BANNER_STACK.flatMap((id) => techs.filter((tech) => tech.id === id).map((tech) => tx(tech.name, locale)));

  return (
    <main className="relative flex h-[396px] w-[1584px] overflow-hidden bg-bg text-fg">
      <div className="relative w-[460px] shrink-0 bg-red-600 px-12 pt-11">
        <span className="block text-[132px] leading-[0.8] font-black tracking-display text-cream">{t.nav.logo[0]}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between px-16 pt-12 pb-11">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow text-[17px] text-gold-text">{t.meta.jobTitle}</span>
          <span className="eyebrow text-[17px] text-fg-muted">{links.siteLabel}</span>
        </div>

        <p className="max-w-[920px] text-[58px] leading-[1.02] font-bold tracking-tight">
          {lead} <span className="font-serif font-normal tracking-normal text-fg-muted italic">{accent}</span>
        </p>

        <div className="flex items-center justify-between gap-8 border-t border-line pt-5">
          <p className="eyebrow flex shrink-0 items-center gap-3 text-[15px] whitespace-nowrap">
            <span className="status-dot" aria-hidden="true" />
            <Segments nowrap items={[t.hero.statusShort, `${hoursPerWeek} ${t.availability.hoursUnit}`, location[locale]]} />
          </p>
          <p className="eyebrow shrink-0 text-[15px] whitespace-nowrap text-fg-muted">
            <Segments nowrap items={names} />
          </p>
        </div>
      </div>
    </main>
  );
}
