import { archiveProjects, featuredProjects } from "@/content/projects.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { pad, tx } from "@/lib/i18n";

/**
 * Archive of semester projects – full-width rows that expand to show the description.
 * Native <details> keeps it usable with keyboard and screen readers without any JS.
 */
export function ProjectArchive({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <div className="site-grid mt-24 md:mt-32">
      <div className="col-span-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
        <h3 className="text-3xl font-bold tracking-tight md:text-5xl">{t.projects.archiveTitle}</h3>
        <p className="eyebrow text-fg-muted">{t.projects.archiveNote}</p>
      </div>

      <ol className="col-span-12">
        {archiveProjects.map((project, i) => {
          const stack = project.stack.map((s) => tx(s, locale)).join(" · ");
          return (
            <li key={project.id} id={`project-${project.id}`} className="border-b border-line">
              <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-12 items-baseline gap-x-(--gutter) py-5 transition-colors duration-300 hover:text-gold-text md:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="eyebrow col-span-2 text-gold-text md:col-span-1">
                    {pad(featuredProjects.length + i + 1)}
                  </span>
                  <span className="col-span-9 text-xl font-semibold tracking-tight md:col-span-6 md:text-3xl">
                    {tx(project.title, locale)}
                  </span>
                  <span className="eyebrow hidden text-right text-fg-muted md:col-span-4 md:block">{stack}</span>
                  <span
                    className="col-span-1 text-right text-2xl leading-none transition-transform duration-500 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="grid grid-cols-12 gap-x-(--gutter) pb-8">
                  <p className="col-span-12 max-w-[65ch] text-fg-muted md:col-span-7 md:col-start-2">
                    {project.description[locale]}
                  </p>
                  <p className="eyebrow col-span-12 mt-4 text-fg-muted md:hidden">{stack}</p>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
