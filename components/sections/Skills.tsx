import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillCard } from "@/components/ui/SkillCard";
import type { Dictionary } from "@/lib/dictionary";
import { pad } from "@/lib/i18n";

/** What I can do – four reveal cards, soft skills spelled out below. */
export function Skills({ t }: { t: Dictionary }) {
  return (
    <section id="skills" aria-labelledby="skills-title" className="site-grid gap-y-12 py-28 md:py-40">
      {/* Old website: #leadership */}
      <span id="leadership" className="anchor-alias col-span-12" aria-hidden="true" />

      <SectionHeading id="skills-title" number="04" className="col-span-12">
        {t.skills.title}
      </SectionHeading>

      {/* Four in a row only from xl – narrower square cards cannot hold the list and the title. */}
      <ul className="col-span-12 grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {t.skills.cards.map((card, i) => (
          <SkillCard
            key={card.title}
            number={pad(i + 1)}
            title={card.title}
            items={card.items}
            showDetailsLabel={t.skills.showDetails}
          />
        ))}
      </ul>

      <div className="col-span-12 grid gap-x-(--gutter) gap-y-8 md:grid-cols-12">
        <h3 className="eyebrow text-fg-muted md:col-span-12 lg:col-span-3">{t.skills.softTitle}</h3>
        <div className="grid gap-8 md:col-span-12 md:grid-cols-3 lg:col-span-9">
          {t.skills.soft.map((item) => (
            <div key={item.title} className="border-t border-line pt-5">
              <h4 className="text-lg font-semibold tracking-tight">{item.title}</h4>
              <p className="mt-2 text-fg-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
