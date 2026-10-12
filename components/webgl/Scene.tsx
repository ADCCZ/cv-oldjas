"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Compass } from "./Compass";
import { HeroReveal } from "./HeroReveal";
import { layer, prepareStages } from "./stage";

/**
 * Drives the canvas from gsap.ticker instead of R3F's own requestAnimationFrame loop: Lenis,
 * ScrollTrigger and HeroMotion all update on the same ticker, so every View reads DOM positions
 * that already belong to this frame – nothing lags a frame behind the scroll. This ticker callback
 * is added last, after all of them.
 *
 * When no stage needs a frame (nothing WebGL on screen, or a tab in the background – the ticker
 * then stops altogether) the canvas is cleared once and hidden, which also takes it out of
 * compositing.
 */
function Driver({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);
  const advance = useThree((state) => state.advance);
  const lost = useRef(onLost);

  useEffect(() => {
    lost.current = onLost;
  }, [onLost]);

  useEffect(() => {
    const html = document.documentElement;
    const canvas = gl.domElement;
    let idle = false;

    const setIdle = (value: boolean) => {
      idle = value;
      if (value) html.dataset.webglIdle = "";
      else delete html.dataset.webglIdle;
    };

    const tick = (time: number) => {
      const busy = prepareStages(time);
      const order = layer.under ? "under" : "over";
      if (html.dataset.webglLayer !== order) html.dataset.webglLayer = order;
      if (busy) {
        advance(time);
        if (idle) setIdle(false);
      } else if (!idle) {
        gl.setRenderTarget(null);
        gl.setScissorTest(false);
        gl.clear();
        setIdle(true);
      }
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost.current();
    };

    html.dataset.webgl = "on";
    setIdle(true);
    gsap.ticker.add(tick);
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => {
      gsap.ticker.remove(tick);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      delete html.dataset.webgl;
      delete html.dataset.webglIdle;
      delete html.dataset.webglLayer;
    };
  }, [gl, advance]);

  return null;
}

/**
 * The single, shared WebGL canvas: fixed over the viewport, transparent, never catching the
 * pointer. Effects draw into drei Views that follow DOM elements (scissored regions of this one
 * canvas – no second WebGL context). Loaded lazily by WebglRoot.
 */
export default function Scene({ onLost }: { onLost: () => void }) {
  const [settings] = useState(() => ({
    dpr: (window.matchMedia("(max-width: 767px)").matches ? [1, 1.5] : [1, 2]) as [number, number],
    // High-density screens need no multisampling – it would only cost bandwidth on a full-screen canvas.
    antialias: window.devicePixelRatio < 2,
  }));

  return (
    <Canvas
      className="webgl-layer"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100lvh", pointerEvents: "none" }}
      frameloop="never"
      flat
      dpr={settings.dpr}
      resize={{ scroll: false }}
      gl={{ alpha: true, antialias: settings.antialias, stencil: false, powerPreference: "default" }}
      aria-hidden="true"
    >
      <Driver onLost={onLost} />
      <HeroReveal />
      <Compass />
    </Canvas>
  );
}
