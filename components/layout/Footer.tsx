import { Clock } from "@/components/layout/Clock";
import { FooterMotion } from "@/components/motion/FooterMotion";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { LetterRoll } from "@/components/ui/LetterRoll";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Segments } from "@/components/ui/Segments";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { NAV_ITEMS } from "@/lib/sections";

const GIANT = "ŠVEHLA";
/** The contact details decode slowly enough to be noticed – the footer is the last thing on the page. */
const DECODE_SECONDS = 1.4;

type Props = { t: Dictionary; locale: Locale; projectCount: number };

/**
 * Footer: three columns (contact / links / navigation), the giant surname across the full width
 * and a label bar. The giant letters are separate spans – they rise into view and shrink away
 * under the pointer (FooterMotion).
 */
export function Footer({ t, locale, projectCount }: Props) {
  const cv = links.cv[locale];
  const newTab = <span className="sr-only"> ({t.a11y.openInNewTab})</span>;

  return (
    <footer className="border-t border-line">
      <div className="site-grid gap-y-14 py-16 md:py-20">
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <p className="eyebrow mb-6 text-fg-muted">{t.contact.contactTitle}</p>
          <dl className="space-y-5">
            <div>
              <dt className="eyebrow mb-1 text-gold-text">{t.contact.location}</dt>
              <dd>
                <ScrambleText text={links.location[locale]} duration={DECODE_SECONDS} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-1 text-gold-text">{t.contact.email}</dt>
              <dd>
                <CopyEmail email={links.email} duration={DECODE_SECONDS} copyLabel={t.contact.copy} copiedLabel={t.contact.copied} writeLabel={t.contact.writeEmail} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-1 text-gold-text">{t.contact.github}</dt>
              <dd>
                <TrackedLink
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="github_click"
                  data={{ place: "footer-details" }}
                  className="link-draw link-anim"
                >
                  <ScrambleText text={links.githubLabel} duration={DECODE_SECONDS} hover />
                  {newTab}
                </TrackedLink>
              </dd>
            </div>
            {links.linkedin ? (
              <div>
                <dt className="eyebrow mb-1 text-gold-text">{t.contact.linkedin}</dt>
                <dd>
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="link-draw link-anim">
                    <ScrambleText text={links.linkedin.replace(/^https?:\/\/(www\.)?/, "")} duration={DECODE_SECONDS} hover />
                    {newTab}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-5">
          <p className="eyebrow mb-6 text-fg-muted">{t.contact.linksTitle}</p>
          <ul className="space-y-1 text-5xl leading-[1.05] font-bold tracking-display md:text-6xl">
            <li>
              <TrackedLink
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                event="github_click"
                data={{ place: "footer-links" }}
                className="roll-link link-draw link-anim"
              >
                <LetterRoll text="GitHub" arrow="out" />
                {newTab}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={`mailto:${links.email}`}
                event="email_click"
                data={{ place: "footer-links" }}
                className="roll-link link-draw link-anim"
              >
                <LetterRoll text={t.contact.email} />
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                href={cv.design}
                event="cv_download"
                data={{ lang: locale, version: "design" }}
                className="roll-link link-draw link-anim"
                download
              >
                <LetterRoll text={t.contact.linkCv} arrow="down" />
              </TrackedLink>
            </li>
          </ul>
        </div>

        <nav aria-label={t.contact.navTitle} className="col-span-12 lg:col-span-3">
          <p className="eyebrow mb-6 text-fg-muted">{t.contact.navTitle}</p>
          <ul className="space-y-1 text-lg">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <a href={`#${item}`} className="link-draw link-anim">
                  <ScrambleText text={t.nav[item]} appear={false} hover />
                </a>
                {item === "projects" ? <span className="ml-1 font-label text-xs text-fg-muted">({projectCount})</span> : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Font size = available width / text width in em (≈ 5.3 em for ŠVEHLA at wdth 125, wght 900). */}
      <p
        data-giant
        aria-hidden="true"
        className="overflow-x-clip px-gutter pt-[0.08em] text-center font-wide text-[calc((100vw-2*var(--gutter))/5.3)] leading-[0.82] font-black tracking-[-0.03em] whitespace-nowrap select-none"
      >
        {[...GIANT].map((letter, i) => (
          <span key={i} data-giant-letter className="inline-block">
            {letter}
          </span>
        ))}
      </p>

      <div className="site-grid eyebrow items-center gap-y-3 border-t border-line py-5 text-fg-muted">
        <p className="col-span-12 lg:col-span-10">
          <Segments
            stack
            nowrap
            items={[
              `© ${new Date().getFullYear()} Oldřich Jan Švehla`,
              t.footer.place,
              <Clock key="clock" label={t.hero.clockLabel} showOffset className="text-fg" />,
              t.footer.built,
              <a key="source" href={links.sourceRepo} target="_blank" rel="noopener noreferrer" className="link-draw link-anim text-fg">
                <ScrambleText text={t.footer.source} appear={false} hover />
                {newTab}
              </a>,
            ]}
          />
        </p>
        <a href="#top" className="link-draw link-anim col-span-12 justify-self-end text-fg lg:col-span-2">
          <ScrambleText text={t.footer.top} appear={false} hover />
        </a>
      </div>
      <FooterMotion />
    </footer>
  );
}
