"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/config/site";
import { Icon } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";

const AUTO_SPEED = 0.035; // px per ms of continuous drift

// Endless product strip: drifts on its own, eases to a stop on hover, and can be dragged/flicked (with momentum)
// using the mouse, touch or a horizontal trackpad swipe. Four cards are visible on desktop.
export function ProductCarousel({ products }: { products: Product[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const copies = Math.max(3, Math.ceil(8 / Math.max(products.length, 1)));

  useEffect(() => {
    const el = wrap.current, list = track.current;
    if (!el || !list || products.length === 0) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0, speed = reduce ? 0 : AUTO_SPEED, momentum = 0, last = performance.now(), frame = 0;
    let hovering = false, focused = false, drag: { x: number; t: number; startX: number; id: number } | null = null;

    const setWidth = () => (list.children[products.length] as HTMLElement | undefined)?.offsetLeft ?? list.scrollWidth;
    const render = () => {
      const w = setWidth();
      offset = ((offset % w) + w) % w;
      list.style.transform = `translate3d(${-offset}px,0,0)`;
    };
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64); last = now;
      if (!drag) {
        const target = reduce || hovering || focused ? 0 : AUTO_SPEED;
        speed += (target - speed) * Math.min(dt / 400, 1);
        offset += (speed + momentum) * dt;
        momentum *= Math.pow(.94, dt / 16);
        if (Math.abs(momentum) < .001) momentum = 0;
      }
      render();
      frame = requestAnimationFrame(tick);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x: e.clientX, t: performance.now(), startX: e.clientX, id: e.pointerId };
      moved.current = false; momentum = 0;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      cursor.current?.style.setProperty("translate", `${e.clientX - r.left}px ${e.clientY - r.top}px`);
      if (!drag) return;
      if (!moved.current && Math.abs(e.clientX - drag.startX) > 6) {
        moved.current = true; setDragging(true);
        el.setPointerCapture(drag.id);
      }
      if (!moved.current) return;
      const now = performance.now(), dx = e.clientX - drag.x;
      offset -= dx;
      momentum = -dx / Math.max(now - drag.t, 1);
      drag.x = e.clientX; drag.t = now;
    };
    const up = () => {
      if (!drag) return;
      if (performance.now() - drag.t > 80) momentum = 0;
      momentum = Math.max(-3, Math.min(3, momentum));
      drag = null; setDragging(false);
    };
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      offset += e.deltaX;
    };
    const enter = () => { hovering = true; setHover(true); };
    const leave = () => { hovering = false; setHover(false); };
    const focusIn = () => { focused = true; };
    const focusOut = (e: FocusEvent) => { if (!el.contains(e.relatedTarget as Node)) focused = false; };

    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: .2 });
    io.observe(el);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); io.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
    };
  }, [products.length]);

  const items = Array.from({ length: copies }, (_, c) => products.map((p, i) => ({ p, c, i }))).flat();
  return <div ref={wrap} className={`relative -my-6 select-none overflow-hidden py-6 [touch-action:pan-y] [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [@media(pointer:fine)]:cursor-none`}
    onClickCapture={(e) => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } }}>
    <ul ref={track} className="flex gap-5 will-change-transform" aria-label="Products">
      {items.map(({ p, c, i }) => <li key={`${c}-${p.slug}`} aria-hidden={c > 0 || undefined}
        className={`carousel-card w-[72%] shrink-0 sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] ${visible ? "is-in" : ""}`}
        style={{ transitionDelay: `${Math.min(i, 3) * 110}ms` }}>
        <Link href={`/products/${p.slug}`} draggable={false} tabIndex={c > 0 ? -1 : undefined}
          className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-forest/15 [@media(pointer:fine)]:cursor-none ${dragging ? "pointer-events-none" : ""}`}>
          <div className="relative overflow-hidden">
            {p.images?.[0]
              ? <img src={p.images[0].src} alt="" loading="lazy" draggable={false} className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.08]" />
              : <ProductPlaceholder name={p.name} className="aspect-[4/3] w-full transition-transform duration-[900ms] group-hover:scale-[1.08]" />}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/45 via-forest/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-0.5 font-serif text-xs text-forest backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-xl">{p.name}</h3>
            <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-charcoal/70">{p.short}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-forest">
              <span className="relative">View details<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-forest transition-transform duration-500 group-hover:scale-x-100" /></span>
              <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
            </span>
          </div>
        </Link>
      </li>)}
    </ul>
    <div ref={cursor} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 hidden [@media(pointer:fine)]:block">
      <span className={`-ml-10 -mt-10 flex h-20 w-20 items-center justify-center gap-1 rounded-full bg-forest/90 text-xs font-medium uppercase tracking-[.16em] text-ivory shadow-xl shadow-forest/25 backdrop-blur transition-[scale,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${hover ? (dragging ? "scale-75 opacity-100" : "scale-100 opacity-100") : "scale-0 opacity-0"}`}>
        <Icon name="arrowLeft" className="h-3 w-3" />Drag<Icon name="arrowRight" className="h-3 w-3" />
      </span>
    </div>
  </div>;
}
