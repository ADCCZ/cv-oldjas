import { CardToss } from "@/components/motion/CardToss";
import { DriftStrip } from "@/components/motion/DriftStrip";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Segments } from "@/components/ui/Segments";
import type { Dictionary } from "@/lib/dictionary";

/** Clone, original, clone – DriftStrip loops inside the middle copy. */
const COPIES = [0, 1, 2] as const;
const ORIGINAL = 1;
/**
 * Five cards cannot alternate cream / red (or high / low) around a loop, so every copy holds them
 * twice – the second time with the colours swapped. Only the first pass of the middle copy is read.
 */
const PASSES = [0, 1] as const;
/** Tilt by position in a copy (±4–6°), so neighbours never lean the same way. */
const TILT = [-5, 4, -4, 6, -6, 5, -4, 6, -5, 4];

/**
 * Beyond code (griflan.com style): tilted cards in two staggered rows drift past by themselves;
 * the strip can be grabbed by its gaps and thrown (DriftStrip, cursor "Drag"); a card can be picked up on
 * its own and springs back into its slot (CardToss). Hover lifts a card.
 * With reduced motion it is a plain horizontal scroller with the five original cards.
 */
export function OffCode({ t }: { t: Dictionary }) {
  const cards = t.offCode.cards;

  return (
    <section id="off-code" aria-labelledby="offcode-title" className="overflow-x-clip py-28 md:py-40">
      <div className="site-grid">
        <SectionHeading id="offcode-title" number="06" className="col-span-12">
          {t.offCode.titleStart} <em className="font-serif font-normal tracking-normal italic">{t.offCode.titleAccent}</em>
        </SectionHeading>
      </div>

      {/* The scroller clips vertically too: the deep bottom padding keeps the lifted cards’ shadows whole,
          the negative margin gives that space back to the section. */}
      <div className="mt-10 -mb-14 md:mt-14">
        <div
          data-strip
          data-cursor="drag"
          role="group"
          tabIndex={0}
          aria-label={`${t.offCode.titleStart} ${t.offCode.titleAccent}`}
          className="overflow-x-auto overscroll-x-contain pt-14 pb-28 select-none [scrollbar-width:none] motion-reduce:snap-x motion-reduce:snap-mandatory"
        >
          <div className="flex w-max px-gutter">
            {COPIES.map((copy) => (
              <ul
                key={copy}
                data-strip-copy
                aria-hidden={copy === ORIGINAL ? undefined : true}
                className={`flex items-start ${copy === ORIGINAL ? "" : "motion-only"}`}
              >
                {PASSES.flatMap((pass) =>
                  cards.map((card, i) => {
                    const slot = pass * cards.length + i; // position in the copy
                    const read = copy === ORIGINAL && pass === 0;
                    // The second pass of the original copy – a duplicate like the clones around it.
                    const duplicate = copy === ORIGINAL && pass === 1;
                    const red = slot % 2 === 1;
                    return (
                      <li
                        key={`${pass}-${card.id}`}
                        data-toss
                        aria-hidden={duplicate || undefined}
                        data-surface={red ? "red" : undefined}
                        style={{ "--r": `${TILT[slot % TILT.length]}deg` } as React.CSSProperties}
                        className={`relative -mr-[1vw] flex min-h-[19rem] w-[max(17rem,22vw)] shrink-0 flex-col p-6 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] transition-[scale,translate,box-shadow] duration-500 ease-brand rotate-(--r) hover:z-10 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_40px_80px_-24px_rgb(0_0_0/0.6)] motion-reduce:snap-start md:p-7 ${
                          red ? "mt-[clamp(5rem,9vw,9rem)] bg-red-500 text-cream" : "bg-cream text-red-600 light:ring-1 light:ring-line"
                        } ${duplicate ? "motion-only" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-3xl leading-none font-bold tracking-tight">{card.title}</h3>
                          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-current">
                            <Icon name={card.icon} className="size-6" />
                          </span>
                        </div>
                        <p className="mt-auto pt-10 text-lg leading-snug">
                          <Segments items={card.text} />
                        </p>
                        {card.link ? (
                          <a
                            href={card.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={read ? undefined : -1}
                            draggable={false} // pressing and moving drags the strip, not the URL
                            className="eyebrow link-draw mt-4 self-start"
                          >
                            {card.link.label}
                            <span className="sr-only"> ({t.a11y.openInNewTab})</span>
                          </a>
                        ) : null}
                      </li>
                    );
                  }),
                )}
              </ul>
            ))}
          </div>
        </div>
        <DriftStrip speed={44} />
        <CardToss />
      </div>
    </section>
  );
}
