import { ProjectsMotion } from "@/components/motion/ProjectsMotion";
import { ProjectCover } from "@/components/ui/ProjectCover";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { links } from "@/content/links.config";
import { featuredProjects, type Project } from "@/content/projects.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import type { GithubData, RepoMeta } from "@/lib/github";
import { pad, tx } from "@/lib/i18n";
import { ProjectArchive } from "./ProjectArchive";

function NewTab({ label }: { label: string }) {
  return <span className="sr-only"> ({label})</span>;
}

function RepoMetaLine({ meta, t }: { meta: RepoMeta; t: Dictionary }) {
  const date = new Intl.DateTimeFormat(t.projects.dateLocale, { month: "short", year: "numeric" }).format(
    new Date(meta.pushedAt),
  );
  return (
    <span className="text-fg-muted">
      {meta.language ? (
        <>
          <span className="sr-only">{t.projects.language}: </span>
          {meta.language} ·{" "}
        </>
      ) : null}
      <span aria-hidden="true">★</span> {meta.stars}
      <span className="sr-only"> {t.projects.stars}</span> · {t.projects.updated} {date}
    </span>
  );
}

type CardProps = {
  project: Project;
  index: number;
  total: number;
  t: Dictionary;
  locale: Locale;
  meta?: RepoMeta;
};

function ProjectCard({ project, index, total, t, locale, meta }: CardProps) {
  const titleId = `project-${project.id}-title`;
  const repoUrl = project.repo ? `https://github.com/${project.repo}` : null;
  // A click on the image opens the live demo, otherwise the repository.
  const primaryUrl = project.demo ?? repoUrl;
  const cover = <ProjectCover project={project} index={index} total={total} locale={locale} />;

  return (
    <article
      id={`project-${project.id}`}
      aria-labelledby={titleId}
      className="w-[85vw] shrink-0 snap-start md:w-[min(52vw,calc((100svh-22rem)*1.6))] lg:w-[min(36vw,calc((100svh-20rem)*1.6))]"
    >
      <div className="relative" data-surface="red" data-cover>
        {primaryUrl ? (
          // Mouse shortcut only – the same links follow as text, so keyboard users skip this one.
          <TrackedLink
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            event="project_open"
            data={{ id: project.id, target: project.demo ? "demo" : "repo" }}
            data-cursor="view"
            className="block"
          >
            {cover}
          </TrackedLink>
        ) : (
          cover
        )}
        {project.tags?.length ? (
          <ul data-cover-tags className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li key={tx(tag, "en")} className="tag border-transparent bg-ink text-cream">
                {tx(tag, locale)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 id={titleId} className="text-2xl leading-tight font-bold tracking-tight md:text-4xl">
          {tx(project.title, locale)}
        </h3>
        <span className="eyebrow text-gold-text" aria-hidden="true">
          {pad(index + 1)}
        </span>
      </div>
      <p className="mt-3 max-w-[62ch] text-fg-muted">{project.description[locale]}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <li key={tx(s, "en")} className="tag text-fg-muted">
            {tx(s, locale)}
          </li>
        ))}
      </ul>
      <p className="eyebrow mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        {repoUrl ? (
          <TrackedLink
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            event="project_open"
            data={{ id: project.id, target: "repo" }}
            className="link-draw"
          >
            {t.projects.repo}
            <NewTab label={t.a11y.openInNewTab} />
          </TrackedLink>
        ) : (
          <span className="text-fg-muted">{project.privateNote?.[locale] ?? t.projects.privateOwn}</span>
        )}
        {project.demo ? (
          <TrackedLink
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            event="project_open"
            data={{ id: project.id, target: "demo" }}
            className="link-draw"
          >
            {t.projects.live}
            <NewTab label={t.a11y.openInNewTab} />
          </TrackedLink>
        ) : null}
        {meta ? <RepoMetaLine meta={meta} t={t} /> : null}
      </p>
    </article>
  );
}

type Props = {
  t: Dictionary;
  locale: Locale;
  github: GithubData;
};

/**
 * Projects (juncastudio.com style). From md up the heading stays on the left and vertical
 * scrolling moves the strip of cards to the left (pinned, ProjectsMotion). Phones get a native
 * swipe carousel, reduced motion a plain vertical list (CSS in globals.css).
 */
export function Projects({ t, locale, github }: Props) {
  const total = featuredProjects.length;

  return (
    <section id="projects" aria-labelledby="projects-title" className="py-28 md:py-0">
      <div data-projects-pin className="site-grid gap-y-10 md:min-h-svh md:content-center md:pt-(--header-h) md:pb-10">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <SectionHeading
            id="projects-title"
            number="02"
            aside={
              <span aria-hidden="true">
                <span data-projects-counter className="text-fg">
                  01
                </span>{" "}
                / {pad(total)}
              </span>
            }
          >
            {t.projects.title}
          </SectionHeading>
          {github.offline ? <p className="eyebrow mt-6 text-fg-muted">{t.projects.githubOffline}</p> : null}
        </div>

        <div data-projects-clip className="col-span-12 -mx-(--gutter) md:col-span-7 md:mx-0 md:overflow-x-clip lg:col-span-8">
          <div
            data-projects-track
            tabIndex={0}
            aria-label={t.projects.title}
            className="relative flex snap-x snap-mandatory scroll-pl-(--gutter) gap-6 overflow-x-auto overscroll-x-contain px-gutter pb-6 md:gap-8 md:px-0 md:pb-2"
          >
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                total={total}
                t={t}
                locale={locale}
                meta={project.repo ? github.repos[project.repo] : undefined}
              />
            ))}

            <div className="w-[85vw] shrink-0 snap-start md:w-[min(40vw,calc((100svh-22rem)*1.6))] lg:w-[min(22vw,calc((100svh-20rem)*1.6))]">
              <TrackedLink
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                event="github_click"
                data={{ place: "projects" }}
                data-surface="red"
                className="flex aspect-[16/10] flex-col justify-between border border-line-strong p-6 transition-colors duration-500 hover:border-red-500 hover:bg-red-500 hover:text-cream md:p-8"
              >
                <span className="eyebrow">{links.githubLabel}</span>
                <span className="text-3xl leading-none font-bold tracking-tight md:text-4xl">
                  {t.projects.allOnGithub}
                  <NewTab label={t.a11y.openInNewTab} />
                </span>
              </TrackedLink>
            </div>
          </div>
        </div>
        <ProjectsMotion />
      </div>

      <ProjectArchive t={t} locale={locale} />
    </section>
  );
}
