"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FINE_POINTER, MOTION_OK, rand, STRIP_MOVE_EVENT } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Props = {
  /** Sticker texts per stat id (`data-stat` on the cells) – a pill fits the number under the mouse. */
  stickers: Record<string, readonly string[]>;
};

/** One physics step (matter-js is tuned for 60 Hz); faster screens just step less often. */
const STEP_MS = 1000 / 60;
/** A new pill needs this much pointer travel and time since the previous one – an occasional
    sticker, not a trail of them. */
const SPAWN_DISTANCE = 110;
const SPAWN_INTERVAL_MS = 225;

type Pill = { el: HTMLElement; body: Matter.Body; w: number; h: number; dying: boolean };

/**
 * Stickers on the stats strip (griflan.com "Bravo! / Kudos!"): moving the mouse over the strip
 * now and then throws out a pill – red handwritten text in a red outline – that fits the number under
 * the pointer ("All green!" over the tests, "Summit!" over the via ferrata), with a random tilt and
 * the speed of the pointer. They fall (gravity 2), pile up on an invisible floor at the bottom edge
 * and ride along with the drifting strip (STRIP_MOVE_EVENT). At most 6–14 at once (by width); the
 * oldest fades away. matter-js is loaded only when the strip comes near the viewport.
 * Mouse and full motion only – phones and reduced motion get no stickers.
 */
export function StatsPills({ stickers }: Props) {
  const enabled = useMediaQuery(`${FINE_POINTER} and ${MOTION_OK}`);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.parentElement;
    const strip = section?.querySelector<HTMLElement>("[data-strip]");
    if (!enabled || !layer || !section || !strip) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const start = async () => {
      const Matter = await import("matter-js");
      // Measure pills in their final font – Caveat is not preloaded.
      const probe = makePill(Object.values(stickers)[0]?.[0] ?? "");
      probe.style.visibility = "hidden";
      layer.append(probe);
      const style = getComputedStyle(probe);
      await document.fonts.load(`${style.fontSize} ${style.fontFamily}`);
      probe.remove();
      if (cancelled) return;
      teardown = run(Matter, layer, section, strip, stickers);
    };

    // Start loading a little before the strip scrolls into view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void start();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      teardown?.();
    };
  }, [enabled, stickers]);

  if (!enabled) return null;
  return <div ref={layerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />;
}

function makePill(text: string): HTMLElement {
  const el = document.createElement("span");
  el.className = "stat-pill";
  el.textContent = text;
  return el;
}

/** The simulation itself; returns its cleanup. */
function run(
  Matter: typeof import("matter-js"),
  layer: HTMLElement,
  section: HTMLElement,
  strip: HTMLElement,
  stickers: Record<string, readonly string[]>,
) {
  const { Bodies, Body, Composite, Engine } = Matter;
  const engine = Engine.create({ gravity: { x: 0, y: 2 } });
  const pills: Pill[] = [];
  let floor: Matter.Body | null = null;
  let width = 0;
  let height = 0;
  let accumulator = 0;
  let visible = true;
  const last = { x: 0, y: 0, time: 0, travel: 0 };
  let lastText = "";
  // Every copy of every number. The clones are inert, so the event target cannot tell which number is
  // under the pointer – their boxes can (read only when a pill is due, a few times a second at most).
  const cells = Array.from(section.querySelectorAll<HTMLElement>("[data-stat]"));
  const statAt = (clientX: number) =>
    cells.find((cell) => {
      const box = cell.getBoundingClientRect();
      return clientX >= box.left && clientX < box.right;
    })?.dataset.stat ?? "";

  // An invisible floor along the bottom edge of the strip, far wider than the screen.
  const layout = () => {
    width = layer.clientWidth;
    height = layer.clientHeight;
    if (floor) Composite.remove(engine.world, floor);
    floor = Bodies.rectangle(width / 2, height + 50, width * 10, 100, { isStatic: true, friction: 0.8 });
    Composite.add(engine.world, floor);
  };
  layout();

  const maxPills = () => gsap.utils.clamp(6, 14, Math.round(width / 140));

  const remove = (pill: Pill) => {
    Composite.remove(engine.world, pill.body);
    pill.el.remove();
    pills.splice(pills.indexOf(pill), 1);
  };

  const spawn = (text: string, x: number, y: number, vx: number, vy: number) => {
    const el = makePill(text);
    layer.append(el);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const body = Bodies.rectangle(x, y, w, h, {
      chamfer: { radius: h / 2 }, // a capsule – the pill outline
      angle: rand(-0.3, 0.3),
      restitution: 0.35,
      friction: 0.5,
      frictionAir: 0.012,
    });
    Body.setVelocity(body, { x: gsap.utils.clamp(-18, 18, vx), y: gsap.utils.clamp(-18, 18, vy) });
    Body.setAngularVelocity(body, rand(-0.08, 0.08) + vx * 0.004);
    Composite.add(engine.world, body);
    pills.push({ el, body, w, h, dying: false });

    // Too many: the oldest living pill fades out, then leaves the simulation.
    const living = pills.filter((pill) => !pill.dying);
    if (living.length > maxPills()) {
      const oldest = living[0]!;
      oldest.dying = true;
      gsap.to(oldest.el, { opacity: 0, scale: 0.6, duration: 0.45, ease: "power2.in", onComplete: () => remove(oldest) });
    }
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const rect = layer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();
    if (last.time === 0) Object.assign(last, { x, y, time: now, travel: 0 });
    const dx = x - last.x;
    const dy = y - last.y;
    const dt = Math.max(now - last.time, 1);
    last.travel += Math.hypot(dx, dy);
    if (last.travel >= SPAWN_DISTANCE && now - last.time >= SPAWN_INTERVAL_MS) {
      // The number under the pointer picks the text – never the same one twice in a row.
      const pool = (stickers[statAt(event.clientX)] ?? []).filter((text) => text !== lastText);
      const text = pool[Math.floor(Math.random() * pool.length)];
      if (!text) return;
      lastText = text;
      // Pointer speed in px per physics step – the pill is flung the way the mouse moved.
      spawn(text, x, y, (dx / dt) * STEP_MS * 0.6, (dy / dt) * STEP_MS * 0.6);
      Object.assign(last, { x, y, time: now, travel: 0 });
    }
  };
  const onLeave = () => (last.time = 0);

  // The pills live on the strip: when it drifts or is dragged, they move with it.
  const onStripMove = (event: Event) => {
    const dx = (event as CustomEvent<number>).detail;
    for (const pill of pills) Body.translate(pill.body, { x: dx, y: 0 });
  };

  const tick = (_time: number, deltaMs: number) => {
    if (!visible || pills.length === 0) return;
    accumulator = Math.min(accumulator + deltaMs, STEP_MS * 3);
    while (accumulator >= STEP_MS) {
      Engine.update(engine, STEP_MS);
      accumulator -= STEP_MS;
    }
    for (const pill of [...pills]) {
      const { x, y } = pill.body.position;
      if (x < -pill.w || x > width + pill.w) {
        remove(pill); // carried off-screen by the strip
        continue;
      }
      pill.el.style.transform = `translate3d(${x - pill.w / 2}px, ${y - pill.h / 2}px, 0) rotate(${pill.body.angle}rad)`;
    }
  };

  const observer = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting));
  observer.observe(section);
  const resize = new ResizeObserver(layout);
  resize.observe(layer);
  section.addEventListener("pointermove", onMove, { passive: true });
  section.addEventListener("pointerleave", onLeave);
  strip.addEventListener(STRIP_MOVE_EVENT, onStripMove);
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    observer.disconnect();
    resize.disconnect();
    section.removeEventListener("pointermove", onMove);
    section.removeEventListener("pointerleave", onLeave);
    strip.removeEventListener(STRIP_MOVE_EVENT, onStripMove);
    for (const pill of [...pills]) {
      gsap.killTweensOf(pill.el);
      remove(pill);
    }
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  };
}
