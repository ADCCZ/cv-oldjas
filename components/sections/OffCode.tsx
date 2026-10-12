import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionary";

/** Scattered layout on large screens (left / top inside the pile, rotation ±6°). */
const SCATTER = [
  { x: "1%", y: "6%", r: "-5deg" },
  { x: "20%", y: "34%", r: "4deg" },
  { x: "39%", y: "3%", r: "-2deg" },
  { x: "58%", y: "30%", r: "6deg" },
  { x: "77%", y: "5%", r: "-4deg" },
];

/** Beyond code – cards thrown on a pile, alternating cream / red (griflan.com style). */
export function OffCode({ t }: { t: Dictionary }) {
  return (
    <section id="off-code" aria-labelledby="offcode-title" className="overflow-x-clip py-28 md:py-40">
      <div className="site-grid">
        <SectionHeading id="offcode-title" number="06" className="col-span-12">
          {t.offCode.titleStart} <em className="font-serif font-normal tracking-normal italic">{t.offCode.titleAccent}</em>
        </SectionHeading>
      </div>

      <ul className="mt-16 grid gap-6 px-gutter sm:grid-cols-2 lg:relative lg:mt-20 lg:block lg:h-[42rem]">
        {t.offCode.cards.map((card, i) => {
          const pos = SCATTER[i % SCATTER.length]!;
          const red = i % 2 === 1;
          return (
            <li
              key={card.id}
              style={{ "--x": pos.x, "--y": pos.y, "--r": pos.r } as React.CSSProperties}
              className={`flex min-h-[19rem] flex-col p-6 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] transition-[scale,box-shadow] duration-500 ease-brand rotate-(--r) hover:scale-[1.03] hover:shadow-[0_36px_80px_-24px_rgb(0_0_0/0.6)] md:p-7 lg:absolute lg:top-(--y) lg:left-(--x) lg:w-[22%] ${
                red ? "bg-red-500 text-cream" : "bg-cream text-red-600"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-3xl leading-none font-bold tracking-tight">{card.title}</h3>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-current">
                  <Icon name={card.icon} className="size-6" />
                </span>
              </div>
              <p className="mt-auto pt-10 text-lg leading-snug">{card.text}</p>
              {card.link ? (
                <a href={card.link.href} target="_blank" rel="noopener noreferrer" className="eyebrow link-draw mt-4 self-start">
                  {card.link.label}
                  <span className="sr-only"> ({t.a11y.openInNewTab})</span>
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
