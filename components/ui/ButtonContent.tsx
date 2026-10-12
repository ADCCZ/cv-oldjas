/** Trailing symbols that move into their own square next to the label. */
const ICONS = ["→", "↓", "↗", "@", "::", "✕"] as const;

/** "See my work →" → { text: "See my work", icon: "→" } */
export function splitIcon(label: string): { text: string; icon: string | null } {
  const trimmed = label.trim();
  for (const icon of ICONS) {
    if (trimmed.length > icon.length && trimmed.endsWith(icon)) {
      return { text: trimmed.slice(0, -icon.length).trim(), icon };
    }
  }
  return { text: trimmed, icon: null };
}

type Props = {
  label: string;
  /** Explicit icon; by default it is split off the end of the label. `null` = no icon square. */
  icon?: string | null;
};

/**
 * Inside of a `.btn` (juncastudio.com style): a rectangular label block and a separate square for
 * the icon. On hover both roll up to an identical copy. The copies and the icon are aria-hidden,
 * so the accessible name is just the label text.
 */
export function ButtonContent({ label, icon }: Props) {
  const parts = icon === undefined ? splitIcon(label) : { text: label, icon };

  return (
    <>
      <span className="btn-face">
        <span className="btn-roll">
          <span>{parts.text}</span>
          <span aria-hidden="true">{parts.text}</span>
        </span>
      </span>
      {parts.icon ? (
        <span className="btn-icon" aria-hidden="true">
          <span className="btn-roll">
            <span>{parts.icon}</span>
            <span>{parts.icon}</span>
          </span>
        </span>
      ) : null}
    </>
  );
}
