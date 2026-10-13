import { archiveProjects, featuredProjects } from "@/content/projects.config";
import { stack } from "@/content/stack.config";
import { tx } from "@/lib/i18n";
import { availability, contacts, projectLink, projectSummary, type CvProps } from "./shared";

/*
 * The plain CV (cv-plain.pdf, cv-plain-cs.pdf) for applicant tracking systems: one column, white
 * paper, black text, no tables, columns, icons or images; section headings as plain words so a
 * parser recognises them. It may flow onto a second page (named @page cv-plain in print.css).
 */

export function PlainCv(props: CvProps) {
  const { t, locale } = props;
  const s = t.cv.sections;

  return (
    <main className="cv-plain">
      <header>
        <h1>Oldřich Jan Švehla</h1>
        <p>{t.meta.jobTitle}</p>
        <p>
          {contacts(t).map((c, i) => (
            <span key={c.label}>
              {i ? " | " : null}
              {c.label}: <a href={c.href}>{c.value}</a>
            </span>
          ))}
        </p>
      </header>

      <h2>{s.availability}</h2>
      <p>
        {t.cv.status}, {availability(props)}
      </p>

      <h2>{s.profile}</h2>
      <p>{t.cv.profile}</p>

      <h2>{s.experience}</h2>
      {t.journey.experience.items.map((item) => (
        <section key={item.title}>
          <h3>{item.title}</h3>
          <p>
            {item.period} | {item.place}
          </p>
          <ul>
            {item.text.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2>{s.education}</h2>
      {[...t.journey.education.items].reverse().map((item) => (
        <section key={item.title}>
          <h3>{item.title}</h3>
          <p>
            {item.period} | {item.place}
          </p>
          {item.text.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ))}

      <h2>{s.projectsPlain}</h2>
      {featuredProjects.map((project) => {
        const link = projectLink(project, props);
        return (
          <section key={project.id}>
            <h3>
              {tx(project.title, locale)} <span className="cv-plain-stack">| {project.stack.map((x) => tx(x, locale)).join(", ")}</span>
            </h3>
            <p>
              {projectSummary(project, locale)}{" "}
              {"href" in link ? <a href={link.href}>{link.label}</a> : `(${link.note})`}
            </p>
          </section>
        );
      })}
      <p>
        {t.cv.otherProjects}: {archiveProjects.map((p) => tx(p.title, locale)).join(", ")}.
      </p>

      <h2>{s.technologies}</h2>
      {stack
        .filter((category) => !category.planned)
        .map((category) => (
          <p key={category.id}>
            {category.name[locale]}: {category.items.map((tech) => tx(tech.name, locale)).join(", ")}
          </p>
        ))}

      <h2>{s.languages}</h2>
      <p>{t.cv.languages.map((l) => `${l.name} (${l.level})`).join(", ")}</p>

      <h2>{s.courses}</h2>
      <ul>
        {t.cv.courses.map((course) => (
          <li key={course.name}>
            {course.name} ({course.period})
          </li>
        ))}
      </ul>
    </main>
  );
}
