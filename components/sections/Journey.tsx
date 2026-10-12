import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionary";
import { pad } from "@/lib/i18n";
import { shadeFor } from "@/lib/shade";

type Row = { title: string; period: string; place: string; text: string[] };

type FolderProps = {
  index: number;
  total: number;
  children: React.ReactNode;
};

/**
 * One "folder" of the stack. From md up every row is sticky, offset by one bar height per index,
 * so the next row slides over the previous one and leaves only its ~64 px bar visible – a card
 * index (juncastudio.com style) with pure CSS. All rows share one minimum height, so no row gets
 * pushed out of the stack early when the list ends. Colours go from --red-950 to --red-500.
 */
function Folder({ index, total, children }: FolderProps) {
  return (
    <li
      className="flex flex-col text-cream md:sticky md:min-h-[60svh]"
      style={{
        background: shadeFor(index, total),
        top: `calc(var(--header-h) + ${index} * var(--bar-h))`,
        zIndex: index + 1,
      }}
    >
      {children}
    </li>
  );
}

function FolderBar({ number, title, aside }: { number: string; title: string; aside: React.ReactNode }) {
  return (
    <div className="site-grid min-h-(--bar-h) items-center gap-y-1 border-t border-cream/15 py-3">
      <span className="col-span-2 font-mono text-2xl text-gold-soft md:col-span-1" aria-hidden="true">
        {number}
      </span>
      <h4 className="col-span-10 text-xl leading-tight font-bold tracking-tight md:col-span-8 md:text-3xl">{title}</h4>
      <div className="col-span-10 col-start-3 font-mono text-sm md:col-span-3 md:col-start-auto md:justify-self-end">
        {aside}
      </div>
    </div>
  );
}

function FolderBody({ row }: { row: Row }) {
  return (
    <div className="site-grid flex-1 content-start gap-y-5 pt-3 pb-12 md:pb-16">
      <p className="col-span-12 font-serif text-xl italic md:col-span-4 md:col-start-2 md:text-2xl">{row.place}</p>
      {row.text.length > 0 ? (
        <ul className="col-span-12 space-y-3 md:col-span-6 md:col-start-7">
          {row.text.map((line) => (
            <li key={line.slice(0, 32)} className="flex gap-3">
              <span className="mt-[0.75em] h-px w-4 shrink-0 bg-gold-soft" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Journey – two stacks (Education, Experience) so the collapsed bars never exceed the viewport. */
export function Journey({ t }: { t: Dictionary }) {
  const education = t.journey.education.items;
  const experience = t.journey.experience.items;
  const experienceTotal = experience.length + 1; // + the "next step" row

  return (
    <section id="journey" aria-labelledby="journey-title" className="py-28 md:py-40">
      <div className="site-grid">
        <SectionHeading id="journey-title" number="05" className="col-span-12">
          {t.journey.title}
        </SectionHeading>
      </div>

      <div className="mt-16 md:mt-24">
        {/* Old website: #education */}
        <span id="education" className="anchor-alias" aria-hidden="true" />
        <h3 className="eyebrow mb-5 px-gutter text-fg-muted">{t.journey.education.title}</h3>
        <ol>
          {education.map((row, i) => (
            <Folder key={row.title} index={i} total={education.length}>
              <FolderBar number={pad(i + 1)} title={row.title} aside={row.period} />
              <FolderBody row={row} />
            </Folder>
          ))}
        </ol>
      </div>

      <div className="mt-24 md:mt-32">
        {/* Old website: #experience */}
        <span id="experience" className="anchor-alias" aria-hidden="true" />
        <div className="site-grid mb-8 gap-y-3">
          <h3 className="eyebrow col-span-12 text-fg-muted md:col-span-3">{t.journey.experience.title}</h3>
          <p className="col-span-12 max-w-[42ch] text-xl leading-snug tracking-tight md:col-span-9 md:text-2xl">
            {t.journey.experience.lead}
          </p>
        </div>
        <ol>
          {experience.map((row, i) => (
            <Folder key={row.title} index={i} total={experienceTotal}>
              <FolderBar number={pad(i + 1)} title={row.title} aside={row.period} />
              <FolderBody row={row} />
            </Folder>
          ))}
          <Folder index={experience.length} total={experienceTotal}>
            <FolderBar
              number={pad(experienceTotal)}
              title={t.journey.next.title}
              aside={
                <a href="#contact" className="pill bg-cream text-red-600 hover:bg-ink hover:text-cream">
                  {t.journey.next.cta}
                </a>
              }
            />
            <div className="h-6 md:flex-1" />
          </Folder>
        </ol>
      </div>
    </section>
  );
}
