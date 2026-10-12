/**
 * Draws what the browser laid out into a 2D canvas, so a WebGL texture lines up with the page to
 * the pixel: every glyph at the exact position of its DOM text (Range rects – kerning,
 * letter-spacing and line breaks included), solid backgrounds and images. Fonts come from the
 * computed style; the next/font faces are already loaded, so the canvas uses the very same font.
 */

export type Box = { left: number; top: number; width: number; height: number };

export type RasterOptions = {
  /** Canvas pixels per CSS pixel. */
  scale: number;
  /** Text colour override, e.g. to write the coverage of different glyphs into separate channels. */
  textColor?: (el: Element) => string;
  /** Text only – no backgrounds, no images. */
  textOnly?: boolean;
};

/** Canvas only knows font-stretch keywords; computed styles report percentages (Archivo wdth 62–125). */
const STRETCH: [number, CanvasFontStretch][] = [
  [50, "ultra-condensed"],
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
  [150, "extra-expanded"],
  [200, "ultra-expanded"],
];

function stretchKeyword(value: string): CanvasFontStretch {
  const percent = value.endsWith("%") ? parseFloat(value) : (STRETCH.find(([, k]) => k === value)?.[0] ?? 100);
  let best = STRETCH[4]!;
  for (const entry of STRETCH) if (Math.abs(entry[0] - percent) < Math.abs(best[0] - percent)) best = entry;
  return best[1];
}

/** Visual scale of an element (CSS `scale` / transform on it or an ancestor): rendered vs. layout width. */
export function visualScale(el: HTMLElement): number {
  const width = el.offsetWidth;
  return width > 0 ? el.getBoundingClientRect().width / width : 1;
}

function isTransparent(color: string): boolean {
  return color === "transparent" || /^rgba\(.*,\s*0\)$/.test(color) || color.endsWith("/ 0)");
}

/** object-fit: cover / contain for drawImage. */
function drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, rect: DOMRect, fit: string) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = fit === "contain" ? Math.min(rect.width / iw, rect.height / ih) : Math.max(rect.width / iw, rect.height / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.left, rect.top, rect.width, rect.height);
  ctx.clip();
  ctx.drawImage(img, rect.left + (rect.width - w) / 2, rect.top + (rect.height - h) / 2, w, h);
  ctx.restore();
}

/**
 * Draws the subtree of `root` into `ctx`; `origin` (viewport CSS px) maps to the canvas corner.
 * Opacity of the root and its ancestors is ignored (the caller may be fading it), opacity inside
 * the subtree is applied.
 */
export function rasterize(root: HTMLElement, origin: Box, ctx: CanvasRenderingContext2D, options: RasterOptions): void {
  const { scale, textColor, textOnly = false } = options;
  const zoom = visualScale(root);
  const lang = root.closest<HTMLElement>("[lang]")?.lang || document.documentElement.lang || "en";
  const alpha = new Map<Node, number>([[root, 1]]);
  const descents = new Map<string, number>();
  const range = document.createRange();

  ctx.save();
  // Draw in viewport CSS px; the transform maps them onto the canvas.
  ctx.setTransform(scale, 0, 0, scale, -origin.left * scale, -origin.top * scale);
  ctx.textBaseline = "alphabetic";

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node instanceof Element && getComputedStyle(node).display === "none" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });

  for (let node: Node | null = root; node; node = walker.nextNode()) {
    if (node instanceof HTMLElement) {
      const style = getComputedStyle(node);
      const parentAlpha = alpha.get(node.parentNode!) ?? 1;
      const own = node === root ? 1 : parentAlpha * parseFloat(style.opacity || "1");
      alpha.set(node, own);
      if (textOnly || style.visibility === "hidden" || own <= 0) continue;

      const rect = node.getBoundingClientRect();
      if (!isTransparent(style.backgroundColor)) {
        ctx.globalAlpha = own;
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      if (node instanceof HTMLImageElement && node.complete) {
        ctx.globalAlpha = own;
        drawImage(ctx, node, rect, style.objectFit);
      }
      continue;
    }

    const parent = node.parentElement;
    const text = node.textContent ?? "";
    if (!parent || !text.trim()) continue;
    const style = getComputedStyle(parent);
    const own = alpha.get(parent) ?? 1;
    if (style.visibility === "hidden" || own <= 0) continue;

    ctx.globalAlpha = own;
    ctx.fillStyle = textColor ? textColor(parent) : style.color;
    const size = parseFloat(style.fontSize) * zoom;
    const stretch = stretchKeyword(style.fontStretch);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${stretch} ${size}px ${style.fontFamily}`;
    if ("fontStretch" in ctx) ctx.fontStretch = stretch;
    const upper = style.textTransform === "uppercase";

    // The glyph box of a text range spans ascent + descent – its bottom minus the font's descent is the baseline.
    let descent = descents.get(ctx.font);
    if (descent === undefined) {
      descent = ctx.measureText("H").fontBoundingBoxDescent;
      descents.set(ctx.font, descent);
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!;
      if (!char.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getClientRects()[0];
      if (!rect || rect.width === 0) continue;
      ctx.fillText(upper ? char.toLocaleUpperCase(lang) : char, rect.left, rect.bottom - descent);
    }
  }

  range.detach();
  ctx.restore();
}
