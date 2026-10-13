"use client";

import { useRef } from "react";
import { siC, siGit, siJavascript, siMysql, siPhp, siPython, siReact, siVuedotjs } from "simple-icons";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { afterFonts, INTRO_REVEAL_EVENT, introState } from "@/lib/motion";

/** Flipbook frames in the loader window – the stack I use most, as monochrome logos. */
const FRAMES = [siPython, siPhp, siJavascript, siReact, siVuedotjs, siC, siMysql, siGit].map((icon) => icon.path);
const SESSION_KEY = "cv:intro";

/**
 * Intro loader (noth.in style), once per tab session.
 *
 * "OJ" rises out of a mask and "Š" pops in, the window between them opens and flips through
 * technology logos while the counter runs 100 → 000, then everything folds back and the red
 * curtain lifts (clip-path) – on that cue the hero letters rise (INTRO_REVEAL_EVENT).
 * Any wheel, touch, key or click speeds the whole thing up 3×, so nobody has to wait.
 * Whether it plays at all is decided before first paint by the inline script in the layout.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || introState() !== "play") return;

      const oj = el.querySelector("[data-intro-oj]");
      const s = el.querySelector("[data-intro-s]");
      const win = el.querySelector("[data-intro-window]");
      const count = el.querySelector<HTMLElement>("[data-intro-count]");
      const frames = gsap.utils.toArray<SVGElement>("[data-intro-frame]", el);

      // Lenis starts in a parent effect – lock on the next frame, when it exists.
      const lockId = requestAnimationFrame(lockScroll);
      let flipTimer = 0;
      let current = 0;
      let flipStart = 0;
      const FLIP_MS = 2000;

      // Flipbook: slow → fast → slow, like a reel spinning up and settling. Frames change faster
      // than one fades in, so hiding a frame first stops its fade – or it lights up again. (Only that
      // tween: the timeline's own "out" step still has to shrink the last frame.)
      let flipping = true;
      let fadeIn: gsap.core.Tween | null = null;
      const flip = () => {
        if (!flipping) return;
        const t = Math.min((performance.now() - flipStart) / FLIP_MS, 1);
        fadeIn?.kill();
        gsap.set(frames[current]!, { opacity: 0 });
        current = (current + 1) % frames.length;
        fadeIn = gsap.fromTo(frames[current]!, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.2)" });
        if (t < 1) flipTimer = window.setTimeout(flip, 80 + 300 * (1 - Math.sin(t * Math.PI)));
      };
      // The timer runs in real time – a hurried (3×) intro reaches the end of the reel first.
      const stopFlipping = () => {
        flipping = false;
        window.clearTimeout(flipTimer);
        fadeIn?.kill();
      };

      const counter = { v: 100 };
      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode – the intro simply plays again next time */
        }
        document.documentElement.dataset.intro = "done";
      };

      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.mask }, onComplete: finish });
      tl.from(oj, { yPercent: 110, duration: 0.9 })
        .from(s, { scale: 0, duration: 0.9 }, "<")
        .to(win, { width: "1.5em", duration: 1 }, "-=0.15")
        .fromTo(
          frames[0]!,
          { opacity: 0, scale: 0, rotate: -25 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.6,
            ease: "back.out(1)",
            onComplete: () => {
              flipStart = performance.now();
              flipTimer = window.setTimeout(flip, 250);
            },
          },
          "-=0.45",
        )
        .to(
          counter,
          {
            v: 0,
            duration: 2.4,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count) count.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          "<",
        )
        .addLabel("out", ">-0.1")
        .add(stopFlipping, "out")
        .to(frames, { scale: 0, duration: 0.45 }, "out")
        .to(win, { width: "0.12em", duration: 0.7 }, "out")
        .to(oj, { yPercent: 110, duration: 0.8 }, "out+=0.15")
        .to(s, { scale: 0, duration: 0.8 }, "<")
        // Slides out of its mask instead of fading – half-transparent text would fail contrast checks.
        .to(count, { yPercent: 110, duration: 0.4 }, "<")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.25 }, "-=0.35")
        .add(() => {
          unlockScroll();
          window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));
        }, "<0.1");

      const hurry = () => tl.timeScale(3);
      const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      events.forEach((type) => window.addEventListener(type, hurry, { once: true, passive: true }));

      // Start only with the real font – the letters must not swap mid-animation.
      const cancelFonts = afterFonts(() => tl.play());

      return () => {
        cancelFonts();
        cancelAnimationFrame(lockId);
        window.clearTimeout(flipTimer);
        events.forEach((type) => window.removeEventListener(type, hurry));
        tl.kill();
        unlockScroll();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="intro fixed inset-0 z-[150] items-center justify-center bg-red-950 text-cream"
    >
      <div className="flex items-center text-[clamp(4.5rem,13vw,11rem)] leading-none font-black tracking-display">
        <span className="overflow-clip py-[0.08em]">
          <span data-intro-oj className="block">
            OJ
          </span>
        </span>
        <span data-intro-window className="relative mx-[0.06em] h-[0.78em] w-[0.12em] overflow-hidden bg-red-800">
          {FRAMES.map((path, i) => (
            <svg
              key={i}
              data-intro-frame
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute inset-0 m-auto size-[0.42em] opacity-0"
            >
              <path d={path} />
            </svg>
          ))}
        </span>
        <span data-intro-s className="block">
          Š
        </span>
      </div>
      <span className="absolute bottom-8 left-1/2 -translate-x-1/2 overflow-clip">
        <span data-intro-count className="block font-label text-sm tabular-nums">
          100
        </span>
      </span>
    </div>
  );
}
