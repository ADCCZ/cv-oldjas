import Image from "next/image";
import { cvConfig } from "@/content/cv.config";
import { links } from "@/content/links.config";
import { archiveProjects } from "@/content/projects.config";
import { stack, type Level, type Tech } from "@/content/stack.config";
import { pad, tx } from "@/lib/i18n";
import {
  availability,
  contacts,
  cvProjects,
  cvYear,
  projectLink,
  projectSummary,
  type CvProps,
} from "./shared";

/*
 * The design CV (cv.pdf, cv-cs.pdf): two A4 sheets in the colours of the light theme –
 * cream base (60 %), red blocks (30 %), gold numbers and hairlines (10 %). Styles: app/cv/print/print.css.
 */

const PAGES = 2;

/**
 * Section heading. The gold number (01–08) is a CSS counter: Chromium builds the PDF bookmarks from
 * the heading's text nodes without spaces between them – a number in its own span would read "01PROFILE".
 */
function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="cv-h">{children}</h2>;
}

/** The thin label bar on top of each sheet. */
function Bar({ t, page }: CvProps & { page: number }) {
  return (
    <header className="cv-bar cv-label">
      <span>
        <i className="cv-dot" aria-hidden="true" /> {t.cv.label} · {cvYear} · <a href={links.site}>{links.siteLabel}</a>
      </span>
      <span>
        {pad(page)} / {pad(PAGES)}
      </span>
    </header>
  );
}

/** A level as five small rectangles; the long-term ones (4+) are gold. */
function LevelMarks({ level, label }: { level: Level; label?: string }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <span className="cv-level" data-high={level >= 4 ? "" : undefined} {...a11y}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} data-on={i <= level ? "" : undefined} />
      ))}
    </span>
  );
}

type Rated = Tech & { level: Level };
const isRated = (tech: Tech): tech is Rated => tech.level !== undefined;

function PageOne(props: CvProps) {
  const { t, locale } = props;
  const rated = stack.filter((category) => !category.planned);
  const planned = stack.find((category) => category.planned);

  return (
    <section className="cv-sheet cv-p1">
      <Bar {...props} page={1} />

      {/*
        Chromium builds the PDF bookmarks from the painted lines of a heading and drops the space at
        the break ("JANŠVEHLA"). So the two-line name is not a heading: the h1 is a screen-reader copy
        (like the animated name on the website) and the bookmarks start at the sections.
        The visible name wraps by width; ::first-line keeps "Oldřich Jan" black.
      */}
      <div className="cv-head">
        <h1 className="sr-only">Oldřich Jan Švehla</h1>
        <p className="cv-name" aria-hidden="true">
          Oldřich Jan Švehla
        </p>

        <div className="cv-intro">
          <p className="cv-role">
            {t.hero.role} <em>{t.hero.nickname}</em>
          </p>
          <p className="cv-status cv-label">
            <span>
              <i className="cv-dot" aria-hidden="true" /> {t.cv.status}
            </span>
            <span>{availability(props)}</span>
          </p>
        </div>

        {/* The cut-out sits right of the surname; its faded bottom ends on the contact line. */}
        <Image
          className="cv-photo"
          src={links.photo.src}
          width={links.photo.width}
          height={links.photo.height}
          alt={t.about.photoAlt}
          unoptimized
          priority
        />
      </div>

      <ul className="cv-contacts">
        {contacts(t).map((c) => (
          <li key={c.label}>
            <span className="cv-label cv-gold">{c.label}</span>
            <a href={c.href}>{c.value}</a>
          </li>
        ))}
      </ul>

      <div className="cv-cols">
        <div className="cv-main">
          <Heading>{t.cv.sections.profile}</Heading>
          <p className="cv-profile">{t.cv.profile}</p>

          <Heading>{t.cv.sections.experience}</Heading>
          <ol className="cv-exp">
            {t.journey.experience.items.map((item) => (
              <li key={item.title}>
                <span className="cv-label cv-exp-period">{item.period}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p className="cv-exp-place">{item.place}</p>
                  <ul className="cv-dash">
                    {item.text.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="cv-side">
          <Heading>{t.cv.sections.technologies}</Heading>
          <dl className="cv-scale">
            <dt className="cv-label">{t.cv.scale}</dt>
            {t.stack.levels.map((name, i) => (
              <dd key={name}>
                <LevelMarks level={(i + 1) as Level} />
                {name}
              </dd>
            ))}
          </dl>

          {rated.map((category) => {
            const items = category.items.filter(isRated);
            const main = items.filter((tech) => tech.level >= cvConfig.mainLevel);
            const rest = items.filter((tech) => tech.level < cvConfig.mainLevel);
            return (
              <section key={category.id} className="cv-cat">
                <h3 className="cv-label">{category.name[locale]}</h3>
                <ul>
                  {main.map((tech) => (
                    <li key={tech.id}>
                      <span>{tx(tech.name, locale)}</span>
                      <LevelMarks level={tech.level} label={t.stack.levels[tech.level - 1] ?? ""} />
                    </li>
                  ))}
                </ul>
                {rest.length ? (
                  <p className="cv-also">
                    <span className="cv-label">{t.cv.also}</span> {rest.map((tech) => tx(tech.name, locale)).join(" · ")}
                  </p>
                ) : null}
              </section>
            );
          })}

          {planned ? (
            <section className="cv-cat">
              <h3 className="cv-label">{t.cv.sections.planned}</h3>
              <p className="cv-also">{planned.items.map((tech) => tx(tech.name, locale)).join(" · ")}</p>
            </section>
          ) : null}

          <section className="cv-cat">
            <h3 className="cv-label">{t.cv.sections.languageSkills}</h3>
            <ul>
              {t.cv.languages.map((language) => (
                <li key={language.name}>
                  <span>{language.name}</span>
                  <span className="cv-label cv-lang-level">{language.level}</span>
                </li>
              ))}
            </ul>
          </section>

          <span className="cv-olda" aria-hidden="true">
            Olda
          </span>
        </aside>
      </div>
    </section>
  );
}

function PageTwo(props: CvProps) {
  const { t, locale } = props;
  // Newest first, like everywhere in a CV; the folders darken towards the top like on the web.
  const education = [...t.journey.education.items].reverse();

  return (
    <section className="cv-sheet cv-p2">
      <Bar {...props} page={2} />

      <Heading>{t.cv.sections.education}</Heading>
      <ol className="cv-folders">
        {education.map((item, i) => (
          <li key={item.title}>
            <span className="cv-label cv-folder-n">{pad(i + 1)}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
              {item.text.map((line) => (
                <p key={line} className="cv-folder-text">
                  {line}
                </p>
              ))}
            </div>
            <span className="cv-label cv-folder-period">{item.period}</span>
          </li>
        ))}
      </ol>

      <Heading>{t.cv.sections.projects}</Heading>
      <ol className="cv-projects">
        {cvProjects.map((project, i) => {
          const link = projectLink(project, props);
          const tag = project.tags?.[0];
          return (
            <li key={project.id}>
              <p className="cv-label cv-project-meta">
                <span className="cv-gold">{pad(i + 1)}</span>
                {tag ? <span>{tx(tag, locale)}</span> : null}
              </p>
              <h3>{tx(project.title, locale)}</h3>
              <p className="cv-project-text">{projectSummary(project, locale)}</p>
              <ul className="cv-tags">
                {project.stack.map((s) => (
                  <li key={tx(s, "en")}>{tx(s, locale)}</li>
                ))}
              </ul>
              {"href" in link ? (
                <a className="cv-label cv-link" href={link.href}>
                  {link.label} ↗
                </a>
              ) : (
                <p className="cv-label cv-note">{link.note}</p>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cv-other">
        <span className="cv-label cv-gold">{t.cv.otherProjects}</span>
        {archiveProjects.map((p, i) => (
          <span key={p.id}>
            {i ? " · " : " "}
            {tx(p.title, locale)} <span className="cv-muted">{p.stack.slice(0, 2).map((s) => tx(s, locale)).join(", ")}</span>
          </span>
        ))}
      </p>

      <div className="cv-trio">
        <section>
          <Heading>{t.cv.sections.softSkills}</Heading>
          <ul className="cv-dash">
            {t.skills.soft.map((skill) => (
              <li key={skill.title}>{skill.title}</li>
            ))}
          </ul>
        </section>
        <section>
          <Heading>{t.cv.sections.courses}</Heading>
          <ul className="cv-dash">
            {t.cv.courses.map((course) => (
              <li key={course.name}>
                {course.name} <span className="cv-muted">({course.period})</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <Heading>{t.cv.sections.offCode}</Heading>
          <ul className="cv-dash">
            {t.cv.offCode.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Echo of the website footer: the contacts on red and the name cut off by the page edge. */}
      <footer className="cv-band">
        <ul className="cv-label cv-band-bar">
          {contacts(t).map((c) => (
            <li key={c.label}>
              <a href={c.href}>{c.value}</a>
            </li>
          ))}
        </ul>
        <span className="cv-band-name" aria-hidden="true">
          Švehla
        </span>
      </footer>
    </section>
  );
}

export function DesignCv(props: CvProps) {
  return (
    <main className="cv-design">
      <PageOne {...props} />
      <PageTwo {...props} />
    </main>
  );
}
