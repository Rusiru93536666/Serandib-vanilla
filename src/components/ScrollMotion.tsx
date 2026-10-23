"use client";

import { useEffect } from "react";

// Site-wide motion helpers, mounted once in the root layout:
// - elements with [data-reveal] get `.is-in` when scrolled into view (styles in globals.css, stagger via --i);
//   elements added later (client navigation, gallery filters) are picked up by a MutationObserver
// - elements with [data-spotlight] receive the pointer position as --sx/--sy for a cursor-following glow
export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    const watch = (scope: ParentNode) => scope.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    watch(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches("[data-reveal]:not(.is-in)")) io.observe(n);
        watch(n);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const move = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-spotlight]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => { io.disconnect(); mo.disconnect(); document.removeEventListener("pointermove", move); root.classList.remove("motion-ready"); };
  }, []);
  return null;
}
