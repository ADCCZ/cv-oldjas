import { JourneyMotion } from "@/components/motion/JourneyMotion";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionary";
import { pad } from "@/lib/i18n";
import { shadeFor } from "@/lib/shade";

type Row = { title: string; period: string; place: string; text: string[] };

/** Static class names for Tailwind – how many grid rows the sticky number spans on phones. */
const NUMBER_ROWS = { 2: "row-span-2", 3: "row-span-3", 4: "row-span-4" } as const;

type FolderProps = {
  index: number;
  total: number;
  title: string;
  aside: React.ReactNode;
  rows: keyof typeof NUMBER_ROWS;
  children?: React.ReactNode;
};

/**
 * One "folder" of a stack.
 *
 * md and up: every row is sticky, offset by one bar height per index, so the next row slides over
 * the previous one and leaves only its ~64 px bar (number, title, period) visible – a card index
 * (juncastudio.com style) in pure CSS. Each row is one bar shorter than the previous one (so it ends at
 * the bottom of the viewport), capped at 34rem because our rows hold text, not big images. Either way
 * no row is pushed out of the stack early. Tablets get a taller bar (two title lines, see --bar-h).
 * JourneyMotion fades the rows that are being covered.
 *
 * Phones: a plain vertical list; the number sticks below the header while its row scrolls by.
 * Colours go from --red-950 to --red-500.
 */
function Folder({ index, total, title, aside, rows, children }: FolderProps) {
  return (
    <li
      className="border-t border-cream/15 text-cream md:sticky md:flex md:min-h-[min(calc(100svh-var(--header-h)-var(--i)*var(--bar-h)),34rem)] md:flex-col"
      style={{
        "--i": index,
        background: shadeFor(index, total),
        top: `calc(var(--header-h) + ${index} * var(--bar-h))`,
        zIndex: index + 1,
      } as React.CSSProperties}
    >
      <div className="site-grid flex-1 content-start gap-y-2 py-6 md:gap-y-0 md:py-0 md:pb-14">
        <div className={`col-span-2 md:col-span-1 md:row-span-1 md:flex md:h-(--bar-h) md:items-center ${NUMBER_ROWS[rows]}`}>
          <span className="sticky top-[calc(var(--header-h)+1rem)] block font-mono text-2xl text-gold-soft md:static" aria-hidden="true">
            {pad(index + 1)}
          </span>
        </div>
        {/* Sized so the longest title fits the bar: two lines on tablets, one line from lg up. */}
        <h4 className="col-span-10 text-xl leading-tight font-bold tracking-tight md:col-span-8 md:flex md:h-(--bar-h) md:items-center md:text-[1.375rem] lg:text-[clamp(1.375rem,2.15vw,1.875rem)]">
          <ScrambleText text={title} className="md:line-clamp-2 lg:line-clamp-1" />
        </h4>
        <div className="col-span-10 font-mono text-sm md:col-span-3 md:flex md:h-(--bar-h) md:items-center md:justify-end">
          {aside}
        </div>
        {children}
      </div>
    </li>
  );
}

function FolderBody({ row }: { row: Row }) {
  return (
    <>
      <p data-folder-body className="col-span-10 mt-3 font-serif text-xl italic md:col-span-4 md:col-start-2 md:mt-4 md:text-2xl">
        {row.place}
      </p>
      {row.text.length > 0 ? (
        <ul data-folder-body className="col-span-10 mt-2 space-y-3 md:col-span-6 md:col-start-7 md:mt-5">
          {row.text.map((line) => (
            <li key={line.slice(0, 32)} className="flex gap-3">
              <span className="mt-[0.75em] h-px w-4 shrink-0 bg-gold-soft" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
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
            <Folder key={row.title} index={i} total={education.length} title={row.title} aside={row.period} rows={row.text.length ? 4 : 3}>
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
            <Folder key={row.title} index={i} total={experienceTotal} title={row.title} aside={row.period} rows={4}>
              <FolderBody row={row} />
            </Folder>
          ))}
          <Folder
            index={experience.length}
            total={experienceTotal}
            title={t.journey.next.title}
            rows={2}
            aside={
              <a href="#contact" className="pill mt-2 bg-cream py-3! text-sm text-red-600 hover:bg-ink hover:text-cream md:mt-0">
                {t.journey.next.cta}
              </a>
            }
          />
        </ol>
      </div>
      <JourneyMotion />
    </section>
  );
}
