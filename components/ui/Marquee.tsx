type Props = {
  text: string;
  className?: string;
};

/** Rows rendered; CSS shows 1 on wide screens, 2 on tall windows and 3 on portrait screens. */
const ROWS = 3;

/**
 * Every letter in its own inline-block (`.hero-char`, animated by HeroMotion) straight from the
 * server. Splitting the name in the browser would repaint the hero's biggest text after the
 * scripts ran – a late Largest Contentful Paint – and lay the page out once more.
 */
function Letters({ text }: { text: string }) {
  return Array.from(text).map((char, i) =>
    char === " " ? (
      " "
    ) : (
      <span key={i} className="hero-char">
        {char}
      </span>
    ),
  );
}

/**
 * The infinite name: up to three rows of a seamless loop, each with two identical copies in one
 * track that moves by exactly one copy. A CSS animation runs the loop (on the compositor);
 * HeroMotion only changes its speed and direction with the scroll velocity (every other row runs
 * the other way).
 * The rows fill whatever height the hero leaves – on a tall window or a phone the name is not a
 * thin strip with empty space around it. Decorative – the accessible name lives in the h1
 * (sr-only), so all of this is aria-hidden. Rows are clipped only horizontally, so letters can fly
 * out of them. The copies are inline content (not flex) – a flex container would swallow the
 * spaces between the words.
 */
export function Marquee({ text, className = "" }: Props) {
  return (
    <div data-hero-name className={`hero-name ${className}`} aria-hidden="true">
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} data-marquee-row={row} className="marquee-row overflow-x-clip py-[0.08em]">
          <div data-marquee-track className="marquee-track">
            {[0, 1].map((copy) => (
              <span key={copy} data-marquee-copy className="shrink-0 whitespace-nowrap">
                <Letters text={text} />
                <span className="mx-[0.25em] text-red-text">
                  <span className="hero-char">—</span>
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
