import { ArchiveMotion } from "@/components/motion/ArchiveMotion";
import { Segments } from "@/components/ui/Segments";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { archiveProjects, featuredProjects } from "@/content/projects.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { pad, tx } from "@/lib/i18n";

/** Text that turns cream while the red fill is under it (hover or keyboard focus on the row). */
const ON_FILL = "transition-colors duration-500 group-hover/row:text-cream group-has-[summary:focus-visible]/row:text-cream";

/**
 * Archive below the project strip (the previous website, semester projects) – full-width rows
 * (leome-and-partners.com style), with repository and demo links where they exist. Hovering a row
 * wipes a red fill in from the left, edge to edge, and expands its description (ArchiveMotion).
 * The hairlines stay on the grid gutters like every other rule on the page.
 * Native <details> keeps it usable with keyboard and screen readers, and without any JS.
 */
export function ProjectArchive({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <div className="site-grid mt-24 md:mt-32">
      <div className="col-span-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
        <h3 className="text-3xl font-bold tracking-tight md:text-5xl">{t.projects.archiveTitle}</h3>
        <p className="eyebrow text-fg-muted">{t.projects.archiveNote}</p>
      </div>

      <ol className="col-span-12 -mx-(--gutter)">
        {archiveProjects.map((project, i) => {
          const stack = <Segments items={project.stack.map((s) => tx(s, locale))} />;
          const targets = [
            project.repo ? { target: "repo" as const, href: `https://github.com/${project.repo}`, label: t.projects.repo } : null,
            project.demo ? { target: "demo" as const, href: project.demo, label: t.projects.live } : null,
          ].filter((link) => link !== null);
          return (
            <li key={project.id} id={`project-${project.id}`} data-surface="red" className="group/row relative after:absolute after:inset-x-(--gutter) after:bottom-0 after:h-px after:bg-line">
              <div className="archive-fill absolute inset-0 bg-red-500" aria-hidden="true" />
              <details data-archive-row className="group relative">
                <summary className="grid cursor-pointer list-none grid-cols-12 items-baseline gap-x-(--gutter) px-gutter py-5 md:py-6 [&::-webkit-details-marker]:hidden">
                  <span className={`eyebrow col-span-2 text-gold-text md:col-span-1 ${ON_FILL}`}>
                    {pad(featuredProjects.length + i + 1)}
                  </span>
                  <span className={`col-span-9 text-xl font-semibold tracking-tight md:col-span-6 md:text-3xl ${ON_FILL}`}>
                    {tx(project.title, locale)}
                  </span>
                  <span className={`eyebrow hidden text-right text-fg-muted md:col-span-4 md:block ${ON_FILL}`}>{stack}</span>
                  <span className={`col-span-1 text-right text-2xl leading-none ${ON_FILL}`} aria-hidden="true">
                    <svg className="archive-plus" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 0v12M0 6h12" />
                    </svg>
                  </span>
                </summary>
                <div data-archive-body className="overflow-hidden">
                  <div className="grid grid-cols-12 gap-x-(--gutter) px-gutter pb-8">
                    <p className={`col-span-12 max-w-[65ch] text-fg-muted md:col-span-7 md:col-start-2 ${ON_FILL}`}>
                      {tx(project.description, locale)}
                    </p>
                    <p className={`eyebrow col-span-12 mt-4 text-fg-muted md:hidden ${ON_FILL}`}>{stack}</p>
                    {targets.length ? (
                      <p className={`eyebrow col-span-12 mt-5 flex flex-wrap gap-x-6 gap-y-2 md:col-span-7 md:col-start-2 ${ON_FILL}`}>
                        {targets.map((link) => (
                          <TrackedLink
                            key={link.target}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            event="project_open"
                            data={{ id: project.id, target: link.target }}
                            className="link-draw"
                          >
                            {link.label}
                            <span className="sr-only"> ({t.a11y.openInNewTab})</span>
                          </TrackedLink>
                        ))}
                      </p>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      <ArchiveMotion />
    </div>
  );
}
