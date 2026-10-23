"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Tracks the pointer over the hero and exposes it as CSS variables (--mx/--my in -1..1, --gx/--gy in px),
// eased with requestAnimationFrame. Layers read these through the `.parallax`, `.tilt` and `.hero-glow` classes.
export function HeroStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cur = { x: 0, y: 0, gx: el.clientWidth * .75, gy: el.clientHeight * .35 };
    const target = { ...cur };
    let frame = 0;
    const tick = () => {
      let moving = false;
      for (const k of ["x", "y", "gx", "gy"] as const) {
        cur[k] += (target[k] - cur[k]) * .08;
        if (Math.abs(target[k] - cur[k]) > (k.startsWith("g") ? .5 : .001)) moving = true;
      }
      el.style.setProperty("--mx", cur.x.toFixed(4));
      el.style.setProperty("--my", cur.y.toFixed(4));
      el.style.setProperty("--gx", `${cur.gx.toFixed(1)}px`);
      el.style.setProperty("--gy", `${cur.gy.toFixed(1)}px`);
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      target.gx = e.clientX - r.left;
      target.gy = e.clientY - r.top;
      kick();
    };
    const leave = () => { target.x = 0; target.y = 0; kick(); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <section ref={ref} className={className}>{children}</section>;
}
