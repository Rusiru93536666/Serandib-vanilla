"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { HomeStep } from "@/lib/defaults";
import { Icon } from "@/components/Icon";

// Home page "From farm to export" steps as a vertical timeline. The centre line fills as the visitor scrolls,
// and each step's marker lights up once it passes the middle of the screen. Images wipe open via [data-reveal="clip"].
export function ProcessTimeline({ steps }: { steps: HomeStep[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight * .55;
      const box = list.getBoundingClientRect();
      setProgress(Math.min(1, Math.max(0, (mid - box.top) / box.height)));
      let reached = -1;
      list.querySelectorAll<HTMLElement>("[data-step-node]").forEach((node, i) => { if (node.getBoundingClientRect().top < mid) reached = i; });
      setActive(reached);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);

  return <ol ref={ref} className="relative mt-16 space-y-14 sm:space-y-20 lg:mt-20 lg:space-y-24">
    {/* Track and scroll-linked fill, centred on the step markers (left on mobile, middle on desktop). */}
    <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-px -translate-x-1/2 bg-ivory/10 lg:left-1/2">
      <span className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-cream via-cream/80 to-[#D29A31]" style={{ transform: `scaleY(${progress})` }} />
      <span className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_0_6px_rgb(233_215_165/15%),0_0_24px_4px_rgb(233_215_165/45%)] transition-opacity duration-300" style={{ top: `${progress * 100}%`, opacity: progress > 0 && progress < 1 ? 1 : 0 }} />
    </span>

    {steps.map((s, i) => {
      const flip = i % 2 === 1;
      const on = i <= active;
      const num = String(i + 1).padStart(2, "0");
      return <li key={i} className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 gap-y-6 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] lg:items-center lg:gap-x-0">
        <div className="relative z-10 col-start-1 row-start-1 flex justify-center lg:col-start-2">
          <span data-step-node className={`relative flex h-12 w-12 items-center justify-center rounded-full border font-serif text-lg shadow-[0_0_0_8px_rgb(24_58_44)] transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${on ? "scale-110 border-cream bg-cream text-forest" : "border-ivory/25 bg-forest text-ivory/60"}`}>
            {on && <span aria-hidden="true" className="absolute inset-0 rounded-full motion-safe:animate-ping border border-cream/60 [animation-iteration-count:2]" />}
            {i + 1}
          </span>
        </div>

        <div data-reveal="clip" className={`col-start-2 row-start-1 min-w-0 lg:row-start-1 ${flip ? "lg:col-start-3" : "lg:col-start-1"}`}>
          <div className="clip-target group/media relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/30 ring-1 ring-ivory/10">
            <div className="clip-img">
              {s.image
                ? <img src={s.image} alt={s.imageAlt ?? ""} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/media:scale-105" />
                : <div aria-hidden="true" className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#21493a]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgb(233 215 165 / 22%), transparent 55%), repeating-linear-gradient(135deg, transparent 0 22px, rgb(233 215 165 / 5%) 22px 23px)" }}>
                    <Icon name="leaf" className="h-16 w-16 text-cream/30" />
                    <span className="outline-num absolute bottom-3 right-5 font-serif text-8xl leading-none">{num}</span>
                  </div>}
            </div>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 text-xs font-semibold uppercase tracking-[.16em] text-forest shadow-sm backdrop-blur">Step {num}</span>
          </div>
        </div>

        <div data-reveal={flip ? "left" : "right"} style={{ "--i": 1 } as CSSProperties} className={`col-start-2 row-start-2 min-w-0 lg:row-start-1 ${flip ? "lg:col-start-1" : "lg:col-start-3"}`}>
          <div className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] sm:p-9 ${on ? "border-cream/30 bg-ivory/[.08] shadow-2xl shadow-black/20" : "border-ivory/10 bg-ivory/[.03]"} ${flip ? "lg:text-right" : ""}`}>
            <span aria-hidden="true" className={`absolute top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-cream/70 to-transparent transition-transform duration-1000 ${flip ? "right-0" : "left-0"} ${on ? "scale-x-100" : "scale-x-0"}`} />
            <span aria-hidden="true" className={`outline-num pointer-events-none absolute -bottom-4 font-serif text-[7rem] leading-none transition-transform duration-700 group-hover:-translate-y-1.5 ${flip ? "left-4" : "right-4"}`}>{num}</span>
            <p className={`relative text-xs font-semibold uppercase tracking-[.22em] transition-colors duration-700 ${on ? "text-cream" : "text-cream/50"}`}>Step {num} of {String(steps.length).padStart(2, "0")}</p>
            <h3 className="relative mt-3 text-2xl !text-ivory sm:text-3xl">{s.title}</h3>
            {s.text && <p className="relative mt-3 max-w-md leading-7 text-ivory/70 lg:max-w-none">{s.text}</p>}
          </div>
        </div>
      </li>;
    })}
  </ol>;
}
