import { Clock } from "@/components/layout/Clock";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { ButtonContent } from "@/components/ui/ButtonContent";
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
 * the marquee copies around it are decorative. z-[6]: above the WebGL canvas while the hero
 * reveal runs (the copy stays on top of the liquid), below About (z-10), which slides over it.
 */
export function Hero({ t, locale }: Props) {
  const { hoursPerWeek, location } = links.availability;
  const status = `${t.hero.status} · ${availabilityLine(hoursPerWeek, t.availability.hoursUnit, location[locale])}`;
  const statusShort = `${t.hero.statusShort} · ${hoursPerWeek} ${t.availability.hoursUnit}`;

  return (
    // The pin spacer of HeroMotion's ScrollTrigger, rendered here: if ScrollTrigger created it, it
    // would move the hero into it after hydration and the browser would paint the whole hero
    // (and count it for Largest Contentful Paint) a second time.
    <div data-hero-spacer>
      <section
        id="top"
        aria-labelledby="hero-title"
        // A definite height (min-content only as a floor): with just a min-height, Chrome sizes the
        // h1 container for the name's cqh units at 0 when it lays the hero out while the HTML is
        // still streaming in, and the name stays at its smallest size until a script touches it.
        className="relative z-[6] flex h-svh min-h-min flex-col justify-between pt-24 select-none md:pt-28"
      >
        <div className="site-grid">
          <div data-hero-intro className="col-span-12 md:col-span-7 md:col-start-4 lg:col-span-5 lg:col-start-4">
            {/* Each line slides out of its own mask (HeroMotion). Masks from the server, not
                SplitText: splitting would change the hero's height after the first paint. */}
            <p className="text-2xl leading-tight font-medium tracking-tight md:text-3xl">
              <span className="split-line-mask block overflow-clip">
                <span data-hero-line className="block">
                  {t.hero.role}
                </span>
              </span>
            </p>
            <p className="mt-1 font-serif text-2xl text-fg-muted italic md:text-3xl">
              <span className="split-line-mask block overflow-clip">
                <span data-hero-line className="block">
                  {t.hero.nickname}
                </span>
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" data-hero-pop className="btn btn-primary">
                <ButtonContent label={t.hero.ctaWork} />
              </a>
              <a href="#contact" data-hero-pop className="btn btn-outline">
                <ButtonContent label={t.hero.ctaContact} />
              </a>
            </div>
          </div>
        </div>

        {/* The h1 takes all the height left between the intro and the bar; the name rows fill it. */}
        <h1 id="hero-title" className="hero-title flex flex-1 flex-col justify-end pt-10 font-black uppercase md:pt-6">
          <span className="sr-only">{FULL_NAME}</span>
          <Marquee text={FULL_NAME} className="motion-only" />
          {/* Reduced motion: the name stands still and wraps instead of looping. */}
          <span aria-hidden="true" className="reduced-only px-gutter text-[clamp(3.5rem,15vw,12rem)] leading-[0.98]">
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
    </div>
  );
}
