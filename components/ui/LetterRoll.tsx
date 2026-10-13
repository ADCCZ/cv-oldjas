/** Deterministic 0–1 noise per letter: the same markup on every build, yet no visible pattern. */
function noise(i: number, salt: number): number {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type Props = {
  text: string;
  /** Arrow after the text: "out" turns to ↗ (leaves the site), "down" to ↓ (a download). */
  arrow?: "out" | "down";
};

/**
 * Text of a big footer link (globals.css, `.roll-*`): on hover every letter rolls away and an
 * identical copy rolls in – from above or below and after its own short delay, picked per letter.
 * The arrow points right like any link and turns to where this one leads; without hover it shows
 * that direction from the start. The animated copy is aria-hidden, screen readers get the text.
 */
export function LetterRoll({ text, arrow }: Props) {
  const salt = [...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) =>
          ch === " " ? (
            " "
          ) : (
            <span
              key={i}
              className="roll-char"
              style={{ "--dir": noise(i, salt) < 0.5 ? -1 : 1, "--delay": `${Math.round(noise(i, salt + 1) * 120)}ms` } as React.CSSProperties}
            >
              <span className="roll-track">
                <span>{ch}</span>
                <span className="roll-copy">{ch}</span>
              </span>
            </span>
          ),
        )}
        {arrow ? (
          <>
            {"\u00a0"}
            <span className={`roll-arrow roll-arrow-${arrow}`}>→</span>
          </>
        ) : null}
      </span>
    </>
  );
}
