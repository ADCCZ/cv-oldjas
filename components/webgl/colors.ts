import { Vector3 } from "three";

let probe: CanvasRenderingContext2D | null = null;

/**
 * Any CSS colour → sRGB components 0–1. The shaders mix colours in sRGB, exactly like the page
 * does, so the WebGL layer and the DOM around it never drift apart.
 * A 2D context normalises every syntax (hex, rgb(), color-mix results) to "#rrggbb".
 */
export function cssColor(value: string, target = new Vector3()): Vector3 {
  probe ??= document.createElement("canvas").getContext("2d");
  if (!probe) return target.set(1, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = value.trim();
  const hex = String(probe.fillStyle);
  if (hex.startsWith("#") && hex.length === 7) {
    return target.set(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    );
  }
  const [r = 255, g = 255, b = 255] = hex.match(/[\d.]+/g)?.map(Number) ?? [];
  return target.set(r / 255, g / 255, b / 255);
}

/** A design token from :root (theme-aware: dark and light define different values). */
export function token(name: string, target = new Vector3()): Vector3 {
  return cssColor(getComputedStyle(document.documentElement).getPropertyValue(name), target);
}

/** Calls `onChange` whenever next-themes switches the theme. Returns the disconnect function. */
export function onThemeChange(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
