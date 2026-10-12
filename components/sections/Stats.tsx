import { DriftStrip } from "@/components/motion/DriftStrip";
import { StatsMotion } from "@/components/motion/StatsMotion";
import { StatsPills } from "@/components/motion/StatsPills";
import { stats } from "@/content/stats.config";
import type { Dictionary } from "@/lib/dictionary";

/** Clone, original, clone – DriftStrip loops inside the middle copy. */
const COPIES = [0, 1, 2] as const;
const ORIGINAL = 1;

/**
 * Stats strip (griflan.com style): cells separated by hairlines that drift to the left by
 * Only the middle copy is read by screen readers; the clones are aria-hidden, inert and – with
 * reduced motion – not rendered at all, leaving a plain horizontal scroller.
 */
export function Stats({ t }: { t: Dictionary }) {
  return (
    <section id="stats" aria-labelledby="stats-title" className="relative border-y border-line">
      <h2 id="stats-title" className="sr-only">
        {t.stats.title}
      </h2>
      <div
        data-strip
        data-cursor="drag"
        role="group"
        tabIndex={0}
        aria-label={t.stats.title}
        className="overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] motion-reduce:snap-x motion-reduce:snap-mandatory"
      >
        <div className="flex w-max">
          {COPIES.map((copy) => {
            const original = copy === ORIGINAL;
            return (
              <ul
                key={copy}
                data-strip-copy
                aria-hidden={original ? undefined : true}
                inert={!original}
                className={`flex ${original ? "" : "motion-only"}`}
              >
                {stats.map((stat, i) => (
                  <li
                    key={stat.id}
                    className="flex min-h-[19rem] w-[78vw] shrink-0 flex-col justify-between border-r border-line p-6 motion-reduce:snap-start sm:w-[42vw] md:p-8 md:pb-16 lg:w-[24vw]"
                  >
                    <p className="font-serif text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.85] tracking-tight">
                      {typeof stat.value === "number" ? (
                        <>
                          {/* The animated count is decorative; screen readers get the final value. */}
                          <span className="sr-only">
                            {stat.value}
                            {stat.suffix}
                          </span>
                          <span aria-hidden="true" data-count={stat.value} data-count-order={i}>
                            {stat.value}
                          </span>
                          <span aria-hidden="true">{stat.suffix}</span>
                        </>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="mt-6 max-w-[26ch] text-sm text-fg-muted">{t.stats.labels[stat.id]}</p>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>
      <StatsMotion />
      <DriftStrip speed={30} />
      <StatsPills texts={Object.values(t.stats.stickers)} />
    </section>
  );
}
