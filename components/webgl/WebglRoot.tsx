"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { MOTION_OK } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { HERO_READY_EVENT, heroState } from "@/lib/webgl";

// three.js, R3F and the shaders live in this chunk only – never in the first load.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * The layer renders into half-float targets (fluid and water simulations): WebGL2 + float colour
 * buffers, on a real GPU – a software renderer (SwiftShader, llvmpipe: no GPU, blocklisted driver)
 * runs the simulations at a few frames per second and blocks the main thread, so it gets the DOM
 * versions instead.
 */
function supportsWebgl(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const ok = !!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Waits until the first impression is over: the page has loaded, the hero letters have settled
 * (the intro and the letter rise must not stutter while three.js is parsed) and the main thread
 * is idle. Returns a cancel function.
 */
function whenSettled(callback: () => void): () => void {
  let cancelled = false;
  let idleId = 0;
  let timer = 0;

  const idle = () => {
    if (cancelled || idleId) return;
    window.clearTimeout(timer);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => !cancelled && callback(), { timeout: 2500 });
    }
    else timer = window.setTimeout(() => !cancelled && callback(), 300);
  };
  const afterHero = () => {
    if (heroState.ready) return idle();
    window.addEventListener(HERO_READY_EVENT, idle, { once: true });
    // A page that never shows the hero letters (or a failed split) still gets the compass and covers.
    timer = window.setTimeout(idle, 8000);
  };
  if (document.readyState === "complete") afterHero();
  else window.addEventListener("load", afterHero, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", afterHero);
    window.removeEventListener(HERO_READY_EVENT, idle);
    window.clearTimeout(timer);
    if (idleId) window.cancelIdleCallback(idleId);
  };
}

/** A failed chunk load or context creation silently leaves the page as it is. */
class Fallback extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Mounts the shared WebGL layer (components/webgl/Scene) – a bonus on top of a page that is
 * complete without it: only with full motion and a capable browser, and only after the hero text
 * (the LCP element) has been painted. Without WebGL, or after a lost context, the DOM versions of
 * the hero name, the compass and the covers simply stay.
 */
export function WebglRoot() {
  const motionOk = useMediaQuery(MOTION_OK);
  const [status, setStatus] = useState<"waiting" | "ready" | "off">("waiting");

  useEffect(() => {
    if (!motionOk || status !== "waiting") return;
    if (!supportsWebgl()) {
      setStatus("off");
      return;
    }
    return whenSettled(() => setStatus("ready"));
  }, [motionOk, status]);

  useEffect(() => {
    if (status === "off") document.documentElement.dataset.webgl = "off";
  }, [status]);

  if (!motionOk || status !== "ready") return null;
  return (
    <Fallback onError={() => setStatus("off")}>
      <Scene onLost={() => setStatus("off")} />
    </Fallback>
  );
}
