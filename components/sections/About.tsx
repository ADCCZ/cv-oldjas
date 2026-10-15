import Image from "next/image";
import { AboutFacts } from "@/components/motion/AboutFacts";
import { AboutMotion } from "@/components/motion/AboutMotion";
import { CompassSvg } from "@/components/ui/CompassSvg";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Segments } from "@/components/ui/Segments";
import { links } from "@/content/links.config";
import type { Dictionary } from "@/lib/dictionary";

/**
 * About – text with the portrait on the left, sticky compass with quick facts on the right.
 * Opaque and above the hero: it slides over the pinned hero while the name scatters.
 */
export function About({ t }: { t: Dictionary }) {
  return (
    <section id="about" aria-labelledby="about-title" className="site-grid relative z-10 gap-y-16 bg-bg py-28 md:py-40">
      <div className="col-span-12 lg:col-span-7">
        <SectionHeading id="about-title" number="01" reveal={false}>
          {t.about.title}
        </SectionHeading>
        <div data-about-text className="mt-10 space-y-6 text-xl leading-snug tracking-tight md:text-[1.75rem] md:leading-[1.3]">
          {/* The portrait (a cut-out, no tile – the faded shoulders melt into the page) stands right next to the
              first paragraph and is exactly as tall as it, so it never reaches into the next one. Phones: above it. */}
          <div className="md:relative md:pr-[13.5rem]">
            <figure className="mb-10 w-40 md:absolute md:top-0 md:right-0 md:mb-0 md:aspect-[520/572] md:h-full md:w-auto md:max-w-48">
              <Image
                src={links.photo.src}
                width={links.photo.width}
                height={links.photo.height}
                alt={t.about.photoAlt}
                sizes="(min-width: 768px) 12rem, 10rem"
                className="h-auto w-full md:h-full md:object-contain md:object-right-top"
              />
            </figure>
            <p>{t.about.paragraphs[0]}</p>
          </div>
          {t.about.paragraphs.slice(1).map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>

      <aside
        aria-label={t.about.factsLabel}
        className="col-span-12 self-start md:col-span-8 md:col-start-3 lg:sticky lg:top-28 lg:col-span-4 lg:col-start-9"
      >
        {/* The WebGL layer draws the 3D compass into this box; the SVG is the fallback. */}
        <div data-compass className="relative mx-auto mb-10 aspect-square w-56 md:w-60 lg:w-72">
          <CompassSvg className="compass-svg size-full" />
        </div>
        <ul data-facts className="border-t border-line">
          {t.about.facts.map((fact) => (
            <li key={fact.text} data-fact className="fact flex items-center gap-4 border-b border-line py-4">
              <span data-fact-icon className="fact-icon text-gold-text">
                <Icon name={fact.icon} />
              </span>
              <Segments items={fact.text} />
            </li>
          ))}
        </ul>
      </aside>
      <AboutMotion />
      <AboutFacts />
    </section>
  );
}
