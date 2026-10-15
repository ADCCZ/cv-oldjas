import { UnderlineDraw } from "@/components/motion/UnderlineDraw";
import { ButtonContent } from "@/components/ui/ButtonContent";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { availabilityLine } from "@/lib/i18n";

/** Pause before the first underline is drawn (the heading's lines rise first) and between the two. */
const DRAW_DELAY_MS = 450;
const DRAW_STAGGER_MS = 280;

/**
 * A heading line with its "[marked]" words underlined by a hand-drawn gold stroke (drawn on view by
 * UnderlineDraw). `first` is the number of marked words in the lines before, for the stagger.
 */
function MarkedLine({ line, first }: { line: string; first: number }) {
  return line.split(/\[([^\]]+)\]/).map((part, i) =>
    i % 2 ? (
      <span key={i} data-split-keep className="relative whitespace-nowrap">
        {part}
        <svg
          data-draw
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute bottom-[0.02em] -left-[0.04em] h-[0.16em] w-[calc(100%+0.08em)] overflow-visible text-gold-text"
          style={{ "--draw-delay": `${DRAW_DELAY_MS + (first + (i - 1) / 2) * DRAW_STAGGER_MS}ms` } as React.CSSProperties}
        >
          <path
            d="M1 8.6C22 4.6 53 3.1 99 6.3"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="[stroke-width:0.055em]"
          />
        </svg>
      </span>
    ) : (
      part
    ),
  );
}

/** Contact – the big ask, availability and the two main actions. Details follow in the footer. */
export function Contact({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { hoursPerWeek, location } = links.availability;
  const cv = links.cv[locale];
  const [firstLine = "", secondLine = ""] = t.contact.titleLines;
  const marksInFirst = (firstLine.match(/\[/g) ?? []).length;

  return (
    <section id="contact" aria-labelledby="contact-title" className="site-grid gap-y-10 pt-28 pb-20 md:pt-40 md:pb-28">
      <SectionHeading
        id="contact-title"
        number="07"
        className="col-span-12"
        headingClassName="text-[clamp(2.5rem,6.2vw,7rem)] leading-[0.92] tracking-display"
      >
        {/* One line each; the accent stays whole with the line before it. */}
        <span className="block">
          <MarkedLine line={firstLine} first={0} />
        </span>
        <span className="block">
          <MarkedLine line={secondLine} first={marksInFirst} />{" "}
          <em className="font-serif font-normal tracking-normal whitespace-nowrap italic">{t.contact.titleAccent}</em>
        </span>
      </SectionHeading>

      <p className="eyebrow col-span-12 text-fg-muted">
        {availabilityLine(hoursPerWeek, t.availability.hoursUnit, location[locale])}
      </p>

      <div className="col-span-12 flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-3">
          <TrackedLink href={`mailto:${links.email}`} event="email_click" data={{ place: "contact-button" }} className="btn btn-primary">
            <ButtonContent label={t.contact.emailButton} />
          </TrackedLink>
          <TrackedLink
            href={cv.design}
            event="cv_download"
            data={{ lang: locale, version: "design" }}
            className="btn btn-outline"
            download
          >
            <ButtonContent label={t.contact.cvButton} />
          </TrackedLink>
        </div>
        <TrackedLink
          href={cv.plain}
          event="cv_download"
          data={{ lang: locale, version: "plain" }}
          className="link-draw text-sm text-fg-muted"
          download
        >
          {t.contact.cvPlain}
        </TrackedLink>
      </div>
      <UnderlineDraw />
    </section>
  );
}
