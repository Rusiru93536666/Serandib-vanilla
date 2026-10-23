import type { CSSProperties, ReactNode } from "react";
import { HeroStage } from "@/components/HeroStage";
import { Icon, type IconName } from "@/components/Icon";

// Shared animated building blocks for the inner pages (products, our story, quality, gallery).

export function PageHeader({ eyebrow, icon, title, lead, watermark, children }: { eyebrow: string; icon: IconName; title: string; lead: string; watermark: string; children?: ReactNode }) {
  return <HeroStage className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
    <div aria-hidden="true" className="blob absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
    <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
    <span aria-hidden="true" className="outline-forest rise pointer-events-none absolute -bottom-6 right-0 whitespace-nowrap font-serif text-[7rem] leading-none sm:-bottom-10 sm:text-[11rem]" style={{ animationDelay: ".3s" }}>{watermark}</span>
    <div aria-hidden="true" className="parallax absolute right-[7%] top-12 hidden w-40 lg:block xl:w-48" style={{ "--d": 30, rotate: "14deg" } as CSSProperties}>
      <div className="bloom" style={{ animationDelay: ".45s" }}><div className="float" style={{ "--dur": "8s" } as CSSProperties}><img src="/images/hero-flower.webp" alt="" width={640} height={640} className="hero-shadow w-full" /></div></div>
    </div>
    <div aria-hidden="true" className="parallax absolute bottom-10 right-[24%] hidden w-14 lg:block" style={{ "--d": -16, rotate: "58deg" } as CSSProperties}>
      <div className="bloom" style={{ animationDelay: ".7s" }}><div className="float" style={{ "--dur": "10s", "--delay": "-3s" } as CSSProperties}><img src="/images/hero-beans.webp" alt="" width={276} height={900} decoding="async" className="w-full opacity-70 blur-[1px]" /></div></div>
    </div>
    <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
      <p className="rise inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75 backdrop-blur"><Icon name={icon} className="h-3.5 w-3.5" />{eyebrow}</p>
      <h1 className="rise mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl" style={{ animationDelay: ".1s" }}>{title}</h1>
      <span aria-hidden="true" className="hero-rule mt-7 block h-px w-24 bg-gradient-to-r from-forest/50 to-transparent" />
      <p className="rise mt-6 max-w-2xl text-lg leading-8 text-charcoal/70" style={{ animationDelay: ".2s" }}>{lead}</p>
      {children && <div className="rise" style={{ animationDelay: ".3s" }}>{children}</div>}
    </div>
  </HeroStage>;
}

// Pill links that jump to sections further down the page.
export function JumpNav({ label, items }: { label: string; items: { href: string; text: string; num?: string }[] }) {
  return <nav aria-label={label} className="mt-10 flex flex-wrap gap-2">
    {items.map((it) => <a key={it.href} href={it.href} className="group inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/80 px-4 py-2 text-sm text-charcoal/75 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:bg-forest hover:text-ivory hover:shadow-lg hover:shadow-forest/15">
      {it.num && <span className="text-xs font-semibold text-forest/60 transition-colors group-hover:text-cream">{it.num}</span>}{it.text}
      <Icon name="arrowDown" className="h-3.5 w-3.5 opacity-0 transition-all duration-300 -ml-3.5 group-hover:ml-0 group-hover:opacity-100" />
    </a>)}
  </nav>;
}

// Image (or placeholder) that wipes open on scroll, zooms on hover and shows a cursor glow.
export function RevealMedia({ num, children, className = "" }: { num?: string; children: ReactNode; className?: string }) {
  return <div data-reveal="clip" className={className}>
    <div data-spotlight className="clip-target group relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-forest/15">
      <div className="clip-img"><div className="transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105">{children}</div></div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(255_255_255/22%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {num && <span aria-hidden="true" className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 font-serif text-sm text-forest shadow backdrop-blur">{num}</span>}
    </div>
  </div>;
}

// Small section label with a drawn line, e.g. "— 01".
export function SectionNum({ num }: { num: string }) {
  return <p data-reveal className="inline-flex items-center gap-3 text-sm font-semibold tracking-[.2em] text-[#B07D22]"><span className="h-px w-10 bg-[#B07D22]/50" />{num}</p>;
}

// Dark closing call-to-action banner with drifting glows and a cursor spotlight.
export function CtaBanner({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return <div data-reveal>
    <aside data-spotlight className="group relative overflow-hidden rounded-[2rem] bg-forest px-6 py-14 text-ivory sm:px-12 sm:py-16">
      <div aria-hidden="true" className="blob absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-cream/15 blur-3xl" />
      <div aria-hidden="true" className="blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2f5a43]/70 blur-3xl" style={{ animationDelay: "-8s" }} />
      <div aria-hidden="true" className="absolute inset-0 opacity-[.07] [background-image:radial-gradient(rgb(233_215_165)_1px,transparent_1px)] [background-size:26px_26px]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(233_215_165/16%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <img aria-hidden="true" src="/images/hero-beans.webp" alt="" width={276} height={900} loading="lazy" className="pointer-events-none absolute -right-4 top-1/2 hidden w-16 -translate-y-1/2 rotate-[62deg] opacity-25 transition-transform duration-1000 group-hover:rotate-[70deg] lg:block" />
      <div className="relative flex flex-wrap items-center justify-between gap-8 lg:pr-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl !text-ivory sm:text-4xl">{title}</h2>
          <p className="mt-3 leading-7 text-ivory/80">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </aside>
  </div>;
}

export const ctaPrimary = "group/btn inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory";
export const ctaSecondary = "rounded-full border border-ivory/40 px-6 py-3 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory/10";
export const btnPrimary = "group/btn inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-ivory shadow-lg shadow-forest/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-xl";
export const btnSecondary = "rounded-full border border-forest/25 bg-white/80 px-6 py-3 text-sm text-forest transition-all duration-300 hover:-translate-y-0.5 hover:border-forest";
export const btnArrow = "h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1";
