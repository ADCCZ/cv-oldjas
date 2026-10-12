import { StatsMotion } from "@/components/motion/StatsMotion";
import { Sticker } from "@/components/ui/Sticker";
import { stats } from "@/content/stats.config";
import type { Dictionary } from "@/lib/dictionary";

const STICKER_TILT = [-9, 7, -5];

/**
 * Stats strip (griflan.com style): cells separated by hairlines.
 * Scrolls horizontally for now; the auto-moving, draggable strip comes with the interactions.
 */
export function Stats({ t }: { t: Dictionary }) {
  let stickerIndex = 0;

  return (
    <section id="stats" aria-labelledby="stats-title" className="border-y border-line">
      <h2 id="stats-title" className="sr-only">
        {t.stats.title}
      </h2>
      <ul
        tabIndex={0}
        aria-label={t.stats.title}
        className="relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"
      >
        {stats.map((stat) => {
          const tilt = stat.sticker ? STICKER_TILT[stickerIndex++ % STICKER_TILT.length] : 0;
          return (
            <li
              key={stat.id}
              className="relative flex min-h-[19rem] w-[78vw] shrink-0 snap-start flex-col justify-between border-r border-line p-6 sm:w-[42vw] lg:w-[24vw] md:p-8"
            >
              <p className="font-serif text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.85] tracking-tight">
                {typeof stat.value === "number" ? (
                  <>
                    {/* The animated count is decorative; screen readers get the final value. */}
                    <span className="sr-only">
                      {stat.value}
                      {stat.suffix}
                    </span>
                    <span aria-hidden="true" data-count={stat.value}>
                      {stat.value}
                    </span>
                    <span aria-hidden="true">{stat.suffix}</span>
                  </>
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-6 max-w-[26ch] text-sm text-fg-muted">{t.stats.labels[stat.id]}</p>
              {stat.sticker ? (
                <Sticker text={t.stats.stickers[stat.sticker]} rotate={tilt} className="absolute top-6 right-6" />
              ) : null}
            </li>
          );
        })}
      </ul>
      <StatsMotion />
    </section>
  );
}
