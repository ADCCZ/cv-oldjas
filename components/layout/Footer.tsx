import { Clock } from "@/components/layout/Clock";
import { FooterMotion } from "@/components/motion/FooterMotion";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { NAV_ITEMS } from "@/lib/sections";

const GIANT = "ŠVEHLA";

type Props = { t: Dictionary; locale: Locale; projectCount: number };

/**
 * Footer: three columns (contact / links / navigation), the giant surname across the full width
 * and a mono bottom bar. The giant letters are separate spans – the variable-width hover effect
 * (wdth 125 → 62) is added in the interactions phase.
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
                <ScrambleText text={links.location[locale]} />
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-1 text-gold-text">{t.contact.email}</dt>
              <dd>
                <CopyEmail email={links.email} copyLabel={t.contact.copy} copiedLabel={t.contact.copied} writeLabel={t.contact.writeEmail} />
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
                  className="link-draw"
                >
                  <ScrambleText text={links.githubLabel} />
                  {newTab}
                </TrackedLink>
              </dd>
            </div>
            {links.linkedin ? (
              <div>
                <dt className="eyebrow mb-1 text-gold-text">{t.contact.linkedin}</dt>
                <dd>
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="link-draw">
                    {links.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
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
                className="link-draw"
              >
                GitHub ↗{newTab}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`mailto:${links.email}`} event="email_click" data={{ place: "footer-links" }} className="link-draw">
                {t.contact.email}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={cv.design} event="cv_download" data={{ lang: locale, version: "design" }} className="link-draw" download>
                {t.contact.linkCv} ↓
              </TrackedLink>
            </li>
          </ul>
        </div>

        <nav aria-label={t.contact.navTitle} className="col-span-12 lg:col-span-3">
          <p className="eyebrow mb-6 text-fg-muted">{t.contact.navTitle}</p>
          <ul className="space-y-1 text-lg">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <a href={`#${item}`} className="link-draw">
                  {t.nav[item]}
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
        <p className="col-span-12 flex flex-wrap items-center gap-x-3 gap-y-1 lg:col-span-10">
          <span>© {new Date().getFullYear()} Oldřich Jan Švehla</span>
          <span aria-hidden="true">·</span>
          <span>{t.footer.place}</span>
          <span aria-hidden="true">·</span>
          <Clock label={t.hero.clockLabel} showOffset className="text-fg" />
          <span aria-hidden="true">·</span>
          <span>{t.footer.built}</span>
          <span aria-hidden="true">·</span>
          <a href={links.sourceRepo} target="_blank" rel="noopener noreferrer" className="link-draw text-fg">
            {t.footer.source}
            {newTab}
          </a>
        </p>
        <a href="#top" className="link-draw col-span-12 justify-self-start text-fg lg:col-span-2 lg:justify-self-end">
          {t.footer.top}
        </a>
      </div>
      <FooterMotion />
    </footer>
  );
}
