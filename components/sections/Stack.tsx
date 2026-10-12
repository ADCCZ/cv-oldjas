import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechPill } from "@/components/ui/TechPill";
import { getProject } from "@/content/projects.config";
import { stack, type Level } from "@/content/stack.config";
import type { Locale } from "@/content/types";
import type { Dictionary } from "@/lib/dictionary";
import { tx } from "@/lib/i18n";
import { techIconPath } from "@/lib/techIcons";

const LEVELS: Level[] = [1, 2, 3, 4, 5];

/**
 * Stack – technologies grouped by category, tile size = level.
 * This sorted grid is also the final view on mobile and with reduced motion;
 * the falling physics pile is layered on top of it in the interactions phase.
 */
export function Stack({ t, locale }: { t: Dictionary; locale: Locale }) {
  const levelText = (level?: Level) => (level ? `${level}/5 – ${t.stack.levels[level - 1]}` : t.stack.planned);

  return (
    <section id="stack" aria-labelledby="stack-title" className="site-grid gap-y-12 py-28 md:py-40">
      <div className="col-span-12 lg:col-span-8">
        <SectionHeading id="stack-title" number="03">
          {t.stack.title}
        </SectionHeading>
        <p className="mt-6 max-w-[40ch] font-serif text-2xl text-fg-muted italic md:text-3xl">{t.stack.subtitle}</p>
      </div>

      <div className="col-span-12 border-y border-line py-5">
        <h3 className="eyebrow mb-4 text-fg-muted">{t.stack.legendTitle}</h3>
        <ol className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {LEVELS.map((level) => (
            <li key={level} className="flex items-center gap-2">
              <span className="font-mono text-gold-text">{level}</span>
              <span>{t.stack.levels[level - 1]}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-6 rounded-full border border-dashed border-line-strong" aria-hidden="true" />
            <span>{t.stack.planned}</span>
          </li>
        </ol>
      </div>

      <div className="col-span-12 grid gap-x-(--gutter) gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {stack.map((category) => (
          <div key={category.id}>
            <h3 className="eyebrow mb-5 text-fg-muted">{category.name[locale]}</h3>
            <ul className="flex flex-wrap items-center gap-2">
              {category.items.map((tech) => (
                <TechPill
                  key={tech.id}
                  name={tx(tech.name, locale)}
                  level={tech.level}
                  planned={category.planned}
                  iconPath={techIconPath(tech.icon)}
                  levelText={levelText(tech.level)}
                  usedInLabel={t.stack.usedIn}
                  usedIn={(tech.usedIn ?? []).flatMap((id) => {
                    const project = getProject(id);
                    return project ? [{ id, title: tx(project.title, locale) }] : [];
                  })}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
