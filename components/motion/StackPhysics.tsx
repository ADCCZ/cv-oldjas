"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonContent } from "@/components/ui/ButtonContent";
import { EASE, gsap, loadFlip, ScrollTrigger } from "@/lib/gsap";
import { MD_UP, MOTION_OK, rand } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Props = {
  /** Id of the tile container ([data-stack-pile]) – the button controls it. */
  controls: string;
  sortLabel: string;
  scatterLabel: string;
};

type Pile = { sort: () => Promise<void>; scatter: () => void; destroy: () => void };

/**
 * Stack as a physics pile (matter-js). The section starts sorted – the category grid with the
 * legend; "Scatter" tosses the technology tiles into a box where, with a mouse, they can be grabbed,
 * dragged and thrown and bounce off the walls. "Sort" flies them (GSAP Flip) back into the grid.
 *
 * The box is exactly as tall as the sorted grid, so switching never changes the page height –
 * anchors further down (including the old #education, #experience, #leadership) stay put.
 * The tiles are the real TechPill elements (tooltips, links, keyboard) – the physics only moves
 * them. Phones and reduced motion keep the plain grid; touch tablets get the pile without dragging.
 */
export function StackPhysics({ controls, sortLabel, scatterLabel }: Props) {
  const enabled = useMediaQuery(`${MOTION_OK} and ${MD_UP}`);
  const rootRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<Pile | null>(null);
  const [ready, setReady] = useState(false);
  const [sorted, setSorted] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const section = rootRef.current?.closest("section");
    const container = section?.querySelector<HTMLElement>("[data-stack-pile]");
    if (!enabled || !section || !container) return;

    let cancelled = false;
    const start = async () => {
      // Flip comes along now, so the first Sort does not wait for the network.
      const [Matter] = await Promise.all([import("matter-js"), document.fonts.ready, loadFlip()]);
      if (cancelled) return;
      pileRef.current = createPile(Matter, container);
      setReady(true);
    };
    // Load matter-js a screen ahead, so the tiles are ready to fall when the box arrives.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void start();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      pileRef.current?.destroy();
      pileRef.current = null;
      setReady(false);
      setSorted(true);
    };
  }, [enabled]);

  const toggle = async () => {
    const pile = pileRef.current;
    if (!pile || busy) return;
    setBusy(true);
    if (sorted) pile.scatter();
    else await pile.sort();
    setSorted(!sorted);
    setBusy(false);
  };

  // Rendered on the server too, so its row is reserved from the first paint (no layout shift);
  // the button itself appears once matter-js is loaded.
  return (
    <div ref={rootRef} className="col-span-12 hidden h-10 justify-end md:flex motion-reduce:hidden">
      <button
        type="button"
        onClick={toggle}
        aria-controls={controls}
        disabled={!ready}
        className={`btn btn-primary btn-sm transition-opacity duration-500 ${ready ? "opacity-100" : "invisible opacity-0"}`}
      >
        <ButtonContent label={sorted ? scatterLabel : sortLabel} icon={sorted ? "↑" : "↓"} />
      </button>
    </div>
  );
}

/** One physics step (matter-js is tuned for 60 Hz); faster screens just step less often. */
const STEP_MS = 1000 / 60;
/** Speed cap in px per step – anything faster could tunnel through a wall in one step. */
const MAX_SPEED = 30;
/** Thickness of the invisible walls. */
const WALL = 200;

type Grab = { body: Matter.Body; constraint: Matter.Constraint; tile: HTMLElement; x0: number; y0: number; moved: boolean };

/** The tile button carries the rotation, so the tooltip next to it stays upright. */
const face = (tile: HTMLElement) => tile.firstElementChild as HTMLElement;

function createPile(Matter: typeof import("matter-js"), container: HTMLElement): Pile {
  const { Bodies, Body, Composite, Constraint, Engine, Sleeping } = Matter;
  const tiles = Array.from(container.querySelectorAll<HTMLElement>("[data-tile]"));
  const headings = container.querySelectorAll<HTMLElement>("[data-stack-heading]");
  const engine = Engine.create({ enableSleeping: true });
  const world = engine.world;
  const bodies = new Map<HTMLElement, Matter.Body>();
  const sizes = new Map<HTMLElement, { w: number; h: number }>();
  let walls: Matter.Body[] = [];
  let ceiling: Matter.Body | null = null;
  let width = 0;
  let height = 0;
  let running = false; // false while the tiles sit in the sorted grid
  let visible = true;
  let accumulator = 0;
  let flip: gsap.core.Timeline | null = null;
  let grab: Grab | null = null;
  let suppressClickUntil = 0;
  const pointer = { x: 0, y: 0 };

  const sync = (tile: HTMLElement, body: Matter.Body) => {
    const { w, h } = sizes.get(tile)!;
    tile.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0)`;
    face(tile).style.transform = `rotate(${body.angle}rad)`;
  };

  const makeCeiling = () => Bodies.rectangle(width / 2, -WALL / 2, width + WALL * 2, WALL, { isStatic: true });

  // Floor and walls hug the box; the walls reach high above it so tiles falling in cannot slip past.
  const buildWalls = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    Composite.remove(world, walls);
    walls = [
      Bodies.rectangle(width / 2, height + WALL / 2, width + WALL * 2, WALL, { isStatic: true }),
      Bodies.rectangle(-WALL / 2, height / 2 - 1000, WALL, height + 2000, { isStatic: true }),
      Bodies.rectangle(width + WALL / 2, height / 2 - 1000, WALL, height + 2000, { isStatic: true }),
    ];
    Composite.add(world, walls);
    if (ceiling) {
      Composite.remove(world, ceiling);
      Composite.add(world, (ceiling = makeCeiling()));
    }
  };

  /** Grid → box: the box keeps the grid's height, tiles leave the flow (CSS, data-mode="pile"). */
  const enterPile = () => {
    // The exact, fractional height – a rounded one would still move the page by a pixel.
    container.style.height = `${container.getBoundingClientRect().height}px`;
    container.dataset.mode = "pile";
    for (const tile of tiles) {
      sizes.set(tile, { w: tile.offsetWidth, h: tile.offsetHeight });
      face(tile).dataset.cursor = "drag";
    }
    buildWalls();
  };

  const addBody = (tile: HTMLElement, x: number, y: number, angle: number) => {
    const { w, h } = sizes.get(tile)!;
    const body = Bodies.rectangle(x, y, w, h, { angle, restitution: 0.2, friction: 0.4, frictionAir: 0.015 });
    bodies.set(tile, body);
    Composite.add(world, body);
    tile.dataset.live = "";
    sync(tile, body);
    return body;
  };

  const toBox = () => {
    const box = container.getBoundingClientRect();
    return { x: pointer.x - box.left, y: pointer.y - box.top };
  };

  const tick = (_time: number, deltaMs: number) => {
    if (!running || !visible) return;
    accumulator = Math.min(accumulator + deltaMs, STEP_MS * 3);
    while (accumulator >= STEP_MS) {
      if (grab) grab.constraint.pointA = toBox(); // also follows when the page scrolls under the mouse
      for (const body of bodies.values()) {
        if (body.speed > MAX_SPEED) Body.setVelocity(body, Matter.Vector.mult(body.velocity, MAX_SPEED / body.speed));
      }
      Engine.update(engine, STEP_MS);
      accumulator -= STEP_MS;
    }

    let inside = true;
    for (const [tile, body] of bodies) {
      const { x, y } = body.position;
      // Safety net: anything that escaped the box is put back inside, under the lid.
      if (y > height + 200 || x < -200 || x > width + 200) {
        Body.setPosition(body, { x: width / 2, y: sizes.get(tile)!.h });
        Body.setVelocity(body, { x: 0, y: 0 });
      }
      if (body.position.y < sizes.get(tile)!.h / 2) inside = false;
      if (!body.isSleeping) sync(tile, body);
    }
    // Once everything is inside, the box gets a lid – thrown tiles bounce back instead of flying off.
    if (!ceiling && inside && bodies.size === tiles.length) Composite.add(world, (ceiling = makeCeiling()));
  };

  // ---- Mouse: grab, drag, throw (a spring between the pointer and the grabbed point) ----------
  const release = () => {
    if (!grab) return;
    Composite.remove(world, grab.constraint);
    if (grab.moved) suppressClickUntil = performance.now() + 150; // it was a throw, not a click
    delete grab.tile.dataset.grabbed;
    delete container.dataset.dragging;
    grab = null;
  };
  const onDown = (event: PointerEvent) => {
    if (!running || event.button !== 0 || event.pointerType === "touch") return;
    const tile = (event.target as Element).closest<HTMLElement>("[data-tile]");
    const body = tile ? bodies.get(tile) : undefined;
    if (!tile || !body) return;
    event.preventDefault(); // no text selection; the click (tooltip) still follows
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const at = toBox();
    const constraint = Constraint.create({
      pointA: at,
      bodyB: body,
      pointB: { x: at.x - body.position.x, y: at.y - body.position.y },
      stiffness: 0.2,
      damping: 0.1,
      length: 0,
    });
    Composite.add(world, constraint);
    Sleeping.set(body, false);
    grab = { body, constraint, tile, x0: event.clientX, y0: event.clientY, moved: false };
    tile.dataset.grabbed = "";
    container.dataset.dragging = "";
  };
  const onMove = (event: PointerEvent) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (grab && !grab.moved && Math.hypot(event.clientX - grab.x0, event.clientY - grab.y0) > 5) grab.moved = true;
  };
  const onClick = (event: MouseEvent) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const observer = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting));
  observer.observe(container);
  const resize = new ResizeObserver(() => {
    if (!running) return;
    buildWalls();
    for (const [tile, body] of bodies) {
      const { w } = sizes.get(tile)!;
      if (body.position.x > width - w / 2) Body.setPosition(body, { x: width - w / 2, y: body.position.y });
    }
  });
  resize.observe(container);
  container.addEventListener("pointerdown", onDown);
  container.addEventListener("click", onClick, true);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  gsap.ticker.add(tick);

  /** Removes every tile body and the lid; floor and walls stay for the next scatter. */
  const clearBodies = () => {
    Composite.remove(world, [...bodies.values()]);
    bodies.clear();
    if (ceiling) Composite.remove(world, ceiling);
    ceiling = null;
  };

  /** Box → grid: the tiles return to the flow of their category lists. */
  const leavePile = () => {
    container.dataset.mode = "grid";
    container.style.height = "";
    for (const tile of tiles) {
      tile.style.transform = "";
      face(tile).style.transform = "";
      delete face(tile).dataset.cursor;
      delete tile.dataset.live;
    }
  };

  /** Flip: record where every tile lies in the box, put it in the grid, animate from there. */
  const sort = async () => {
    const Flip = await loadFlip();
    release();
    running = false;
    const faces = tiles.map(face);
    const state = Flip.getState(faces);
    const from = container.getBoundingClientRect().height;
    clearBodies();
    leavePile();
    const to = container.getBoundingClientRect().height; // differs only if the columns changed meanwhile
    await new Promise<void>((resolve) => {
      flip = gsap.timeline({ onComplete: resolve });
      flip.add(Flip.from(state, { targets: faces, duration: 1.1, ease: EASE.inOut, stagger: { amount: 0.25, from: "random" } }), 0);
      if (Math.abs(from - to) > 0.5) {
        flip.fromTo(container, { height: from }, { height: to, duration: 1.1, ease: EASE.inOut, clearProps: "height" }, 0);
      }
      flip.fromTo(
        headings,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.reveal, stagger: 0.05, clearProps: "opacity,visibility,transform" },
        0.55,
      );
    });
    if (Math.abs(from - to) > 0.5) ScrollTrigger.refresh();
  };

  /** Every tile becomes a body where it sits in the grid and is tossed up into the box. */
  const scatter = () => {
    flip?.progress(1).kill();
    const box = container.getBoundingClientRect();
    const starts = tiles.map((tile) => {
      const rect = tile.getBoundingClientRect();
      return { tile, x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
    });
    enterPile();
    Composite.add(world, (ceiling = makeCeiling()));
    for (const { tile, x, y } of starts) {
      const body = addBody(tile, x, y, 0);
      Body.setVelocity(body, { x: rand(-7, 7), y: rand(-14, -5) });
      Body.setAngularVelocity(body, rand(-0.2, 0.2));
    }
    running = true;
  };

  const destroy = () => {
    gsap.ticker.remove(tick);
    flip?.kill();
    release();
    observer.disconnect();
    resize.disconnect();
    container.removeEventListener("pointerdown", onDown);
    container.removeEventListener("click", onClick, true);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", release);
    clearBodies();
    Composite.clear(world, false);
    Engine.clear(engine);
    leavePile();
    delete container.dataset.mode;
    gsap.set(headings, { clearProps: "opacity,visibility,transform" });
  };

  return { sort, scatter, destroy };
}
