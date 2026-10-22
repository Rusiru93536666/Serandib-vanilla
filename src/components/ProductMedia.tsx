"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Photo = { src: string; alt: string };

export function ProductPlaceholder({ name, className = "" }: { name: string; className?: string }) {
  return <div aria-hidden="true" className={`relative flex items-end overflow-hidden bg-forest p-7 ${className}`}
    style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgb(233 215 165 / 28%), transparent 50%), repeating-linear-gradient(135deg, transparent 0 22px, rgb(233 215 165 / 5%) 22px 23px)" }}>
    <Icon name="leaf" className="absolute right-7 top-7 h-16 w-16 text-cream/25" />
    <span className="font-serif text-3xl leading-tight text-cream/90">{name}</span>
  </div>;
}

export function ProductGallery({ images, name }: { images: Photo[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return <ProductPlaceholder name={name} className="aspect-square w-full rounded-3xl shadow-2xl shadow-forest/20" />;
  const current = images[Math.min(active, images.length - 1)];
  return <div>
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-forest/15">
      <img src={current.src} alt={current.alt || name} className="aspect-square w-full object-cover" />
      {images.length > 1 && <>
        <button type="button" aria-label="Previous photo" onClick={() => setActive((active - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-forest shadow-md hover:bg-white"><Icon name="arrowLeft" /></button>
        <button type="button" aria-label="Next photo" onClick={() => setActive((active + 1) % images.length)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-forest shadow-md hover:bg-white"><Icon name="arrowRight" /></button>
        <span className="absolute bottom-3 right-3 rounded-full bg-charcoal/60 px-2.5 py-1 text-xs text-ivory">{active + 1} / {images.length}</span>
      </>}
    </div>
    {images.length > 1 && <ul className="mt-4 grid grid-cols-5 gap-2.5" aria-label="Product photos">
      {images.map((img, i) => <li key={`${img.src}-${i}`}>
        <button type="button" onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === active}
          className={`block w-full overflow-hidden rounded-xl ring-2 transition ${i === active ? "ring-forest" : "ring-transparent opacity-70 hover:opacity-100"}`}>
          <img src={img.src} alt="" className="aspect-square w-full object-cover" />
        </button>
      </li>)}
    </ul>}
  </div>;
}
