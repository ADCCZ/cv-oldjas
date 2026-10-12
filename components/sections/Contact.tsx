import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { availabilityLine } from "@/lib/i18n";

/** Contact – the big ask, availability and the two main actions. Details follow in the footer. */
export function Contact({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { hoursPerWeek, location } = links.availability;
  const cv = links.cv[locale];

  return (
    <section id="contact" aria-labelledby="contact-title" className="site-grid gap-y-10 pt-28 pb-20 md:pt-40 md:pb-28">
      <div className="col-span-12 flex items-start gap-3 md:gap-5">
        <span className="eyebrow mt-[0.6em] text-gold-text" aria-hidden="true">
          07
        </span>
        <h2 id="contact-title" className="max-w-[18ch] text-[clamp(2.5rem,7vw,7.5rem)] leading-[0.92] font-bold tracking-display">
          {t.contact.title}
        </h2>
      </div>

      <p className="eyebrow col-span-12 text-fg-muted md:col-start-2">
        {availabilityLine(hoursPerWeek, t.availability.hoursUnit, location[locale])}
      </p>

      <div className="col-span-12 flex flex-col items-start gap-4 md:col-start-2">
        <div className="flex flex-wrap gap-3">
          <TrackedLink href={`mailto:${links.email}`} event="email_click" data={{ place: "contact-button" }} className="pill pill-red">
            {t.contact.emailButton}
          </TrackedLink>
          <TrackedLink
            href={cv.design}
            event="cv_download"
            data={{ lang: locale, version: "design" }}
            className="pill pill-outline"
            download
          >
            {t.contact.cvButton}
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
    </section>
  );
}
