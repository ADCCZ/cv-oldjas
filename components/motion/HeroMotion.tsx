"use client";

import { useRef } from "react";
import { EASE, gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { afterFonts, INTRO_REVEAL_EVENT, introState, MOTION_OK, rand, shuffled } from "@/lib/motion";
import { HERO_READY_EVENT, heroState } from "@/lib/webgl";

/** Idle marquee speed in px/s – proportional to the viewport, so it feels the same everywhere. */
const baseSpeed = () => Math.max(40, window.innerWidth * 0.045);

/** Start of every word of the name as a fraction of the copy's width (layout scales with the font). */
function measureWordStarts(copy: HTMLElement | null): number[] {
  const text = copy?.firstChild;
  if (!copy || !(text instanceof Text)) return [0];
  const box = copy.getBoundingClientRect();
  const range = document.createRange();
  const starts = [0];
  for (let i = 1; i < text.length; i++) {
    if (text.data[i - 1] !== " " || text.data[i] === " ") continue;
    range.setStart(text, i);
    range.setEnd(text, i + 1);
    const rect = range.getBoundingClientRect();
    if (box.width > 0) starts.push((rect.left - box.left) / box.width);
  }
  return starts;
}

/**
 * Hero choreography (renders nothing, drives the server-rendered hero):
 * 1. Infinite name – speed and direction follow the scroll velocity
 *    (scrolling down = faster to the left, scrolling up = to the right).
 * 2. Intro – after the loader (or right away on a repeat visit) the letters rise from below
 *    the line in random order, the tagline lines slide out of their masks, the rest fades up.
 * 3. Scroll – the hero is pinned while About slides over it (pinSpacing: false); the marquee
 *    slows to a stop and every letter flies off in its own direction with a random 3D spin.
 *    About's heading assembles from the same kind of scatter (AboutMotion).
 * The WebGL reveal (components/webgl/HeroReveal) reads `heroState`: whether the letters stand in
 * place and how far the scatter got – it draws the name only while the DOM letters are at rest.
 */
export function HeroMotion() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = marker.current?.closest<HTMLElement>("#top");
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const name = section.querySelector<HTMLElement>("[data-hero-name]");
      const tracks = gsap.utils.toArray<HTMLElement>("[data-marquee-track]", section);
      if (!name || !tracks.length) return;
      const lineEls = section.querySelectorAll<HTMLElement>("[data-hero-line]");
      const pops = section.querySelectorAll<HTMLElement>("[data-hero-pop]");
      const blocks = section.querySelectorAll<HTMLElement>("[data-hero-intro], [data-hero-bar]");
      const state = introState();

      // ---- 1. Velocity-driven marquee ---------------------------------------------------------
      // Every other row runs the other way. Rows hidden by CSS (wide screens) report no width.
      const rows = tracks.map((track, index) => {
        track.classList.add("is-driven");
        return { track, x: 0, direction: index % 2 ? -1 : 1, setX: gsap.quickSetter(track, "x", "px") };
      });
      const drive = { slow: 1 }; // the scroll timeline brings this to 0
      let speed = -baseSpeed();
      let explode: gsap.core.Timeline | null = null;
      // Where each word starts, as a fraction of one copy – rows begin at different words, so a
      // tall screen shows "OLDŘICH" above "ŠVEHLA" instead of the same letters twice.
      let wordStarts: number[] = [0];
      let placedRows = 0;
      const tick = (_time: number, deltaMs: number) => {
        heroState.scatter = explode?.progress() ?? 0;
        if (window.scrollY > window.innerHeight * 2.2) return; // hero long gone – save the frames
        const velocity = getLenis()?.velocity ?? 0;
        const direction = velocity < -0.5 ? 1 : -1;
        const target = direction * (baseSpeed() + Math.min(Math.abs(velocity) * 40, 1500));
        speed += (target - speed) * 0.06; // ease into the new speed instead of jumping
        const widths = rows.map((row) => row.track.scrollWidth / 2);
        const visible = widths.filter((w) => w > 0).length;
        if (visible !== placedRows) {
          placedRows = visible;
          rows.forEach((row, i) => {
            const word = wordStarts[Math.round((i * wordStarts.length) / Math.max(1, visible))] ?? 0;
            row.x = -word * widths[i]!;
          });
        }
        rows.forEach((row, i) => {
          const copyWidth = widths[i]!;
          if (copyWidth <= 0) return;
          row.x = gsap.utils.wrap(-copyWidth, 0, row.x + (row.direction * speed * drive.slow * deltaMs) / 1000);
          row.setX(row.x);
        });
      };
      gsap.ticker.add(tick);

      let chars: SplitText | null = null;
      let lines: SplitText | null = null;
      let reveal: (() => void) | null = null;
      const settled = () => {
        heroState.ready = true;
        window.dispatchEvent(new Event(HERO_READY_EVENT));
      };

      const cancelFonts = afterFonts(() => {
        wordStarts = measureWordStarts(section.querySelector<HTMLElement>("[data-marquee-copy]"));
        placedRows = 0;
        chars = SplitText.create(section.querySelectorAll("[data-marquee-copy]"), {
          type: "chars",
          charsClass: "hero-char",
          aria: "none",
        });
        lines = SplitText.create(lineEls, { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" });
        const letters = chars.chars;

        // ---- 2. Intro -------------------------------------------------------------------------
        if (state !== "skip") {
          const first = state === "play";
          name.classList.add("is-masked");
          gsap.set(letters, { yPercent: 120 });
          gsap.set(lines.lines, { yPercent: 105 });
          gsap.set(pops, { autoAlpha: 0, y: 24 });
          gsap.set(name, { visibility: "visible" });

          reveal = () => {
            gsap.to(shuffled(letters), {
              yPercent: 0,
              duration: first ? 1.6 : 1.1,
              ease: EASE.mask,
              stagger: first ? 0.025 : 0.012,
              onComplete: () => {
                name.classList.remove("is-masked");
                settled();
              },
            });
            gsap.to(lines!.lines, { yPercent: 0, duration: 1, ease: EASE.mask, stagger: 0.08, delay: first ? 0.5 : 0.2 });
            gsap.to(pops, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.reveal, stagger: 0.06, delay: first ? 0.8 : 0.35 });
          };
          if (first) window.addEventListener(INTRO_REVEAL_EVENT, reveal, { once: true });
          else reveal();
        }

        // ---- 3. Scroll: pin + letters scatter in 3D -------------------------------------------
        explode = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=100%",
            pin: true,
            pinSpacing: false, // About slides over the pinned hero
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        explode
          .to(drive, { slow: 0, duration: 0.3, ease: "power1.out" }, 0)
          .to(
            letters,
            {
              x: () => rand(-0.55, 0.55) * window.innerWidth,
              y: () => rand(-0.65, 0.4) * window.innerHeight,
              z: () => rand(-600, 300),
              rotation: () => rand(-120, 120),
              rotationX: () => rand(-80, 80),
              transformPerspective: 900,
              opacity: 0,
              ease: "power2.in",
              duration: 0.7,
              stagger: { each: 0.005, from: "random" },
            },
            0.05,
          )
          .to(blocks, { y: () => -window.innerHeight * 0.12, autoAlpha: 0, ease: "power2.in", duration: 0.32, stagger: 0.06 }, 0);

        ScrollTrigger.refresh();
        if (state === "skip") settled();
      });

      return () => {
        heroState.ready = false;
        heroState.scatter = 0;
        cancelFonts();
        gsap.ticker.remove(tick);
        if (reveal) window.removeEventListener(INTRO_REVEAL_EVENT, reveal);
        explode?.scrollTrigger?.kill();
        explode?.kill();
        chars?.revert();
        lines?.revert();
        tracks.forEach((track) => track.classList.remove("is-driven"));
        name.classList.remove("is-masked");
        gsap.set([...tracks, name, pops, blocks], { clearProps: "all" });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
