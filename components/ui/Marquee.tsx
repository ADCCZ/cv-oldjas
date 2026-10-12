type Props = {
  text: string;
  className?: string;
};

/** Rows rendered; CSS shows 1 on wide screens, 2 on tall windows and 3 on portrait screens. */
const ROWS = 3;

/**
 * The infinite name: up to three rows of a seamless loop, each with two identical copies in one
 * track that moves by exactly one copy. A CSS animation is the no-JS fallback; HeroMotion takes
 * over and ties speed and direction to the scroll velocity (every other row runs the other way).
 * The rows fill whatever height the hero leaves – on a tall window or a phone the name is not a
 * thin strip with empty space around it. Decorative – the accessible name lives in the h1
 * (sr-only), so all of this is aria-hidden. Rows are clipped only horizontally, so letters can fly
 * out of them. The copies are plain inline text (not flex): once SplitText turns every letter into
 * an element, a flex container would swallow the spaces between the words.
 */
export function Marquee({ text, className = "" }: Props) {
  return (
    <div data-hero-name className={`hero-name ${className}`} aria-hidden="true">
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} data-marquee-row={row} className="marquee-row overflow-x-clip py-[0.08em]">
          <div data-marquee-track className="marquee-track">
            {[0, 1].map((copy) => (
              <span key={copy} data-marquee-copy className="shrink-0 whitespace-nowrap">
                {text}
                <span className="mx-[0.25em] text-red-text">—</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
