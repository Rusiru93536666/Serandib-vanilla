"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { GalleryItem } from "@/lib/store";
import { Icon } from "@/components/Icon";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = [...new Set(items.map((x) => x.category.trim()).filter(Boolean))].sort();
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const shown = items.filter((x) => !category || x.category.trim() === category);
  const step = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);

  const chip = (active: boolean) => `whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all duration-300 ${active ? "bg-forest text-ivory shadow-lg shadow-forest/20" : "border border-forest/15 bg-white text-charcoal/75 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"}`;
  const current = open === null ? null : shown[open];

  return <>
    {categories.length > 0 && <div role="toolbar" aria-label="Filter photos by category" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 pt-1">
      <button type="button" aria-pressed={!category} onClick={() => setCategory("")} className={chip(!category)}>All photos <span className="opacity-60">{items.length}</span></button>
      {categories.map((c) => <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)} className={chip(category === c)}>{c}</button>)}
    </div>}

    <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {shown.map((item, i) => <li key={`${category}-${item.src}-${i}`} data-reveal="scale" style={{ "--i": i % 6 } as CSSProperties} className="mb-5 break-inside-avoid">
        <button type="button" onClick={() => setOpen(i)} aria-label={`Open photo${item.caption ? `: ${item.caption}` : ""}`} data-spotlight
          className="group relative block w-full overflow-hidden rounded-3xl bg-cream/30 shadow-sm ring-1 ring-forest/10 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest">
          <img src={item.src} alt={item.alt} loading={i < 6 ? "eager" : "lazy"} className="w-full transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.07]" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(240px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(255_255_255/20%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span aria-hidden="true" className="absolute right-4 top-4 flex h-11 w-11 scale-50 items-center justify-center rounded-full bg-white/90 text-forest opacity-0 shadow-lg backdrop-blur transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-100 group-hover:opacity-100"><Icon name="plus" className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" /></span>
          {(item.caption || item.category) && <span className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-col items-start gap-1 bg-gradient-to-t from-charcoal/75 via-charcoal/30 to-transparent p-4 pt-12 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {item.category && <span className="rounded-full bg-ivory/90 px-2.5 py-0.5 text-xs font-medium text-forest">{item.category}</span>}
            {item.caption && <span className="text-sm font-medium text-ivory">{item.caption}</span>}
          </span>}
        </button>
      </li>)}
    </ul>

    {current && <div role="dialog" aria-modal="true" aria-label={current.caption || "Photo viewer"} className="lightbox-in fixed inset-0 z-[60] flex flex-col bg-charcoal/95 backdrop-blur-sm" onClick={() => setOpen(null)}>
      <div className="flex items-center justify-between px-5 py-4 text-sm text-ivory/70" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <span>{open! + 1} / {shown.length}</span>
        <button type="button" autoFocus aria-label="Close" onClick={() => setOpen(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20"><Icon name="x" className="h-5 w-5" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.stopPropagation()}>
        <img key={open} src={current.src} alt={current.alt} className="lightbox-img max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        {shown.length > 1 && <>
          <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/25 sm:left-5"><Icon name="arrowLeft" className="h-5 w-5" /></button>
          <button type="button" aria-label="Next photo" onClick={() => step(1)} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/25 sm:right-5"><Icon name="arrowRight" className="h-5 w-5" /></button>
        </>}
      </div>
      <div className="px-5 py-5 text-center" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }} onClick={(e) => e.stopPropagation()}>
        {current.category && <span className="rounded-full bg-cream/20 px-3 py-1 text-xs font-medium text-cream">{current.category}</span>}
        {current.caption && <p className="mx-auto mt-2 max-w-2xl font-serif text-xl text-ivory">{current.caption}</p>}
      </div>
    </div>}
  </>;
}
