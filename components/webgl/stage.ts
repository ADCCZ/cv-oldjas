/**
 * Frame orchestration of the shared canvas.
 *
 * Every effect registers a stage. Before each frame the Driver (Scene.tsx) asks all stages whether
 * they have something to draw – cheap CPU checks only (visibility, hover, scroll state). R3F is
 * advanced only when at least one of them does; otherwise the canvas is cleared once and hidden,
 * so a page that shows no WebGL effect costs no GPU time at all.
 */
export type Prepare = (time: number) => boolean;

type Stage = { prepare: Prepare; order: number };

let stages: Stage[] = [];

/** Registers a stage; lower `order` runs first. Returns the unregister function. */
export function addStage(prepare: Prepare, order: number): () => void {
  const stage = { prepare, order };
  stages = [...stages, stage].sort((a, b) => a.order - b.order);
  return () => {
    stages = stages.filter((s) => s !== stage);
  };
}

/** Runs every stage (all of them – each keeps its own state current) and reports if any needs the frame. */
export function prepareStages(time: number): boolean {
  let busy = false;
  for (const stage of stages) busy = stage.prepare(time) || busy;
  return busy;
}

/**
 * Where the canvas sits in the page's stacking order. "under" while the hero reveal runs: below the
 * hero copy and buttons (they stay on top of the liquid, like on noth.in) and below About, which
 * then slides over it without any clipping. "over" for everything else (compass, project covers).
 * Written by the hero stage, which runs first.
 */
export const layer = { under: false };

/** Stage order – the hero decides the layer before the others look at it. */
export const ORDER = { hero: 0, compass: 1, ripples: 2 } as const;
