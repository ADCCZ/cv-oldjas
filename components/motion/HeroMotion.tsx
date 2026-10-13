"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { afterFonts, INTRO_REVEAL_EVENT, introState, MOTION_OK, rand, requestRefresh, shuffled } from "@/lib/motion";
import { HERO_READY_EVENT, heroState } from "@/lib/webgl";

/** Idle marquee speed in px/s – proportional to the viewport, so it feels the same everywhere. */
const baseSpeed = () => Math.max(40, window.innerWidth * 0.045);


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
      const letters = gsap.utils.toArray<HTMLElement>(".hero-char", section);
      if (!name || !tracks.length) return;
      const lineEls = gsap.utils.toArray<HTMLElement>("[data-hero-line]", section);
      const pops = section.querySelectorAll<HTMLElement>("[data-hero-pop]");
      const blocks = section.querySelectorAll<HTMLElement>("[data-hero-intro], [data-hero-bar]");
      const state = introState();

      // ---- 1. Velocity-driven marquee ---------------------------------------------------------
      // The CSS loop keeps running on the compositor – moving the rows from script would repaint
      // the name every frame, and Chrome counts each repaint as a new Largest Contentful Paint.
      // The ticker only sets the loop's playback rate (speed and direction). Every other row runs
      // the other way (animation-direction: reverse); rows hidden by CSS have no width and no loop.
      const rows = tracks.map((track) => ({ track, width: 0, loop: null as CSSAnimation | null, rate: 1 }));
      const drive = { slow: 1 }; // the scroll timeline brings this to 0
      let speed = -baseSpeed();
      let explode: gsap.core.Timeline | null = null;
      // Copy widths change only with the font size, the font itself and the visible rows – a
      // ResizeObserver keeps them, so the ticker never forces a layout to read them. A row that
      // reappears starts a new CSS loop, so the loops are looked up here as well.
      const resizeObserver = new ResizeObserver(() => {
        rows.forEach((row) => {
          row.width = row.track.scrollWidth / 2;
          row.loop = row.track.getAnimations().find((a): a is CSSAnimation => a instanceof CSSAnimation) ?? null;
          row.rate = 1;
        });
      });
      rows.forEach((row) => resizeObserver.observe(row.track));
      const loopMs = (loop: CSSAnimation) => Number(loop.effect?.getTiming().duration) || 60_000;
      const tick = () => {
        heroState.scatter = explode?.progress() ?? 0;
        const gone = window.scrollY > window.innerHeight * 2.2; // hero long gone – stop the rows
        const velocity = getLenis()?.velocity ?? 0;
        const direction = velocity < -0.5 ? 1 : -1;
        const target = direction * (baseSpeed() + Math.min(Math.abs(velocity) * 40, 1500));
        speed += (target - speed) * 0.06; // ease into the new speed instead of jumping
        rows.forEach((row) => {
          if (!row.loop || row.width <= 0) return;
          // px/s → rate of the CSS loop (one copy width per loop); a positive rate runs it forwards (left).
          const rate = gone ? 0 : (-speed * drive.slow * loopMs(row.loop)) / 1000 / row.width;
          if (Math.abs(rate - row.rate) < 0.01) return;
          // Running backwards, a loop would stop at its very start – whole loops later it looks the same.
          const time = Number(row.loop.currentTime ?? 0);
          if (rate < 0 && time < 2 * loopMs(row.loop)) row.loop.currentTime = time + 1000 * loopMs(row.loop);
          row.rate = rate;
          row.loop.updatePlaybackRate(rate);
        });
      };
      gsap.ticker.add(tick);


      let reveal: (() => void) | null = null;
      const settled = () => {
        heroState.ready = true;
        window.dispatchEvent(new Event(HERO_READY_EVENT));
      };

      const cancelFonts = afterFonts(() => {
        // ---- 2. Intro -------------------------------------------------------------------------
        if (state !== "skip") {
          const first = state === "play";
          name.classList.add("is-masked");
          gsap.set(letters, { yPercent: 120 });
          gsap.set(lineEls, { yPercent: 105 });
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
            gsap.to(lineEls, { yPercent: 0, duration: 1, ease: EASE.mask, stagger: 0.08, delay: first ? 0.5 : 0.2 });
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
            pinSpacer: section.parentElement, // [data-hero-spacer] from the server – no DOM move
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

        requestRefresh();
        if (state === "skip") settled();
      });

      return () => {
        heroState.ready = false;
        heroState.scatter = 0;
        cancelFonts();
        resizeObserver.disconnect();
        gsap.ticker.remove(tick);
        if (reveal) window.removeEventListener(INTRO_REVEAL_EVENT, reveal);
        explode?.scrollTrigger?.kill();
        explode?.kill();

        rows.forEach((row) => row.loop?.updatePlaybackRate(1));
        name.classList.remove("is-masked");
        gsap.set([...letters, ...lineEls, name, pops, blocks], { clearProps: "all" });
      };
    });

    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
