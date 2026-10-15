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
 * About – the text on the left; on the right a sticky column with the portrait next to the compass
 * and the quick facts under them.
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
          {t.about.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>

      <aside
        aria-label={t.about.factsLabel}
        className="col-span-12 self-start md:col-span-8 md:col-start-3 lg:sticky lg:top-28 lg:col-span-4 lg:col-start-9"
      >
        {/* The portrait (a cut-out, no tile – the faded shoulders melt into the page) next to the compass,
            side by side so the sticky column gets no taller. The WebGL layer draws the 3D compass into its
            box; the SVG is the fallback. */}
        <div className="mb-10 flex items-center justify-center gap-4 md:gap-6">
          <figure className="w-[55%] max-w-72">
            <Image
              src={links.photo.src}
              width={links.photo.width}
              height={links.photo.height}
              alt={t.about.photoAlt}
              sizes="(min-width: 1024px) 18rem, (min-width: 768px) 18rem, 55vw"
              className="h-auto w-full"
            />
          </figure>
          <div data-compass className="relative aspect-square w-[42%] max-w-56">
            <CompassSvg className="compass-svg size-full" />
          </div>
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
