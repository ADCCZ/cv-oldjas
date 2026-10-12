import { Clock } from "@/components/layout/Clock";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { Marquee } from "@/components/ui/Marquee";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { availabilityLine } from "@/lib/i18n";

export const FULL_NAME = "Oldřich Jan Švehla";

type Props = { t: Dictionary; locale: Locale };

/**
 * Hero – "the infinite name". The H1 is real HTML text (it is the LCP element);
 * the marquee copies around it are decorative.
 */
export function Hero({ t, locale }: Props) {
  const { hoursPerWeek, location } = links.availability;
  const status = `${t.hero.status} · ${availabilityLine(hoursPerWeek, t.availability.hoursUnit, location[locale])}`;
  const statusShort = `${t.hero.statusShort} · ${hoursPerWeek} ${t.availability.hoursUnit}`;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col justify-between pt-24 md:pt-28">
      <div className="site-grid">
        <div data-hero-intro className="col-span-12 md:col-span-7 md:col-start-4 lg:col-span-5 lg:col-start-4">
          <p data-hero-line className="text-2xl leading-tight font-medium tracking-tight md:text-3xl">
            {t.hero.role}
          </p>
          <p data-hero-line className="mt-1 font-serif text-2xl text-fg-muted italic md:text-3xl">
            {t.hero.nickname}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" data-hero-pop className="pill pill-red">
              {t.hero.ctaWork}
            </a>
            <a href="#contact" data-hero-pop className="pill pill-outline">
              {t.hero.ctaContact}
            </a>
          </div>
        </div>
      </div>

      <h1 id="hero-title" className="my-10 font-black uppercase text-hero md:my-6">
        <span className="sr-only">{FULL_NAME}</span>
        <Marquee text={FULL_NAME} className="motion-only py-[0.08em]" />
        {/* Reduced motion: the name stands still and wraps instead of looping. */}
        <span aria-hidden="true" className="reduced-only px-gutter text-[clamp(3.5rem,15vw,12rem)] leading-[0.9]">
          {FULL_NAME}
        </span>
      </h1>

      <div data-hero-bar className="site-grid eyebrow items-center gap-y-3 border-t border-line py-4">
        <p data-hero-pop className="col-span-12 text-fg-muted md:col-span-4">
          {t.hero.degree}
        </p>
        <p data-hero-pop className="col-span-12 flex items-center gap-2 md:col-span-5 md:justify-center">
          <span className="status-dot" aria-hidden="true" />
          <span className="hidden sm:inline">{status}</span>
          <span className="sm:hidden">{statusShort}</span>
        </p>
        <div data-hero-pop className="col-span-12 flex items-center gap-5 md:col-span-3 md:justify-end">
          <TrackedLink
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            event="github_click"
            data={{ place: "hero" }}
            className="link-draw"
          >
            {t.hero.github} ↗
          </TrackedLink>
          <Clock label={t.hero.clockLabel} />
        </div>
      </div>
      <HeroMotion />
    </section>
  );
}
