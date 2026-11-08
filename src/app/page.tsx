import Link from "next/link";
import { site } from "@/config/site";
import { getContent } from "@/lib/store";
import { Icon, type IconName } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";
import { HeroStage } from "@/components/HeroStage";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import type { CSSProperties, ReactNode } from "react";
export const dynamic = "force-dynamic";

// [left %, top %, drift duration s, delay s] for the floating pollen sparks in the hero.
const sparks = [[8, 30, 7, 0], [88, 22, 9, -3], [72, 64, 8, -5], [20, 78, 10, -2], [55, 8, 7.5, -6], [94, 52, 9.5, -1]];

// A hero layer that shifts with the pointer: higher `depth` moves further (negative moves against the cursor).
function Depth({ depth, rotate = 0, delay, decorative = true, className = "", style, children }: { depth: number; rotate?: number; delay?: number; decorative?: boolean; className?: string; style?: CSSProperties; children: ReactNode }) {
  return <div aria-hidden={decorative || undefined} className={`parallax absolute ${className}`} style={{ "--d": depth, rotate: `${rotate}deg`, ...style } as CSSProperties}>
    <div className={delay === undefined ? undefined : "bloom"} style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}>{children}</div>
  </div>;
}

const cardIcons: Record<string, IconName> = { "/quality": "shield", "/contact": "send", "/products": "leaf", "/gallery": "image", "/about": "leaf", "/blog": "file" };

export default async function Home() {
  const { home, products } = await getContent();
  const { hero, why, process, applications, highlights, cta } = home;
  // Admin-chosen home products (up to 4, in order); falls back to the first 4 when none are chosen.
  const chosen = home.products.featured.map((slug) => products.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  const featured = (chosen.length ? chosen : products).slice(0, 4);
  const storeLabel = home.products.storeLabel || "Visit store";
  const banner = home.banner;
  return (
    <>
      <HeroStage className="relative overflow-hidden bg-gradient-to-b from-cream/45 via-ivory to-ivory">
        <div aria-hidden="true" className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-cream/60 blur-3xl" />
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 sm:pt-20 lg:grid-cols-2 lg:gap-16">
          <div>
            {hero.eyebrow && <p className="rise inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="leaf" className="h-3.5 w-3.5" />{hero.eyebrow}</p>}
            <h1 className="rise mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl" style={{ animationDelay: ".12s" }}>{hero.title}</h1>
            <span aria-hidden="true" className="hero-rule mt-7 block h-px w-24 bg-gradient-to-r from-forest/50 to-transparent" />
            {hero.text && <p className="rise mt-6 max-w-xl text-lg leading-8 text-charcoal/70" style={{ animationDelay: ".24s" }}>{hero.text}</p>}
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: ".36s" }}>
              {hero.primaryLabel && <Link href="/products" className="group inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-medium text-ivory shadow-lg shadow-forest/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-xl">{hero.primaryLabel}<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>}
              {hero.secondaryLabel && <Link href="/contact" className="rounded-full border border-forest/25 bg-white/80 px-7 py-3.5 text-sm text-forest transition-all duration-300 hover:-translate-y-0.5 hover:border-forest">{hero.secondaryLabel}</Link>}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Depth depth={-14} className="-left-8 bottom-16 hidden w-14 sm:block" rotate={-34} delay={.75}>
              <div className="float" style={{ "--dur": "9s", "--delay": "-2s" } as CSSProperties}><img src="/images/hero-beans.webp" alt="" width={276} height={900} decoding="async" className="w-full opacity-80 blur-[1px]" /></div>
            </Depth>
            <Depth depth={-20} className="-left-16 top-6 hidden w-24 sm:block" rotate={-22} delay={.6}>
              <div className="float" style={{ "--dur": "10s", "--delay": "-4s" } as CSSProperties}><img src="/images/hero-flower.webp" alt="" width={640} height={640} decoding="async" className="w-full opacity-90 blur-[1.5px]" /></div>
            </Depth>

            <div className="parallax tilt relative" style={{ "--d": 10 } as CSSProperties}>
              <div className="rise relative overflow-hidden rounded-[2rem] shadow-2xl shadow-forest/20" style={{ animationDelay: ".2s" }}>
                {hero.image
                  ? <img src={hero.image} alt={hero.imageAlt} fetchPriority="high" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
                  : <ProductPlaceholder name={site.brand} className="aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]" />}
                <div aria-hidden="true" className="card-sheen pointer-events-none absolute inset-0" />
              </div>
            </div>

            <Depth depth={38} className="-right-4 -top-12 w-36 sm:-right-8 sm:w-48 lg:w-56" rotate={14} delay={.5}>
              <div className="float" style={{ "--dur": "8s" } as CSSProperties}><img src="/images/hero-flower.webp" alt="" width={640} height={640} className="hero-shadow w-full" /></div>
            </Depth>
            <Depth depth={28} className="-bottom-10 right-10 w-20 sm:right-6 sm:w-24 lg:w-28" rotate={62} delay={.85}>
              <div className="sway"><img src="/images/hero-beans.webp" alt="" width={276} height={900} decoding="async" className="hero-shadow w-full" /></div>
            </Depth>
            {sparks.map(([x, y, d, delay], i) => <Depth key={i} depth={55} className="h-1.5 w-1.5 motion-reduce:hidden" style={{ left: `${x}%`, top: `${y}%` }}>
              <span className="spark block h-full w-full rounded-full bg-cream shadow-[0_0_8px_2px_rgb(233_215_165/.8)]" style={{ "--dur": `${d}s`, "--delay": `${delay}s` } as CSSProperties} />
            </Depth>)}

            <Depth depth={18} decorative={false} className="-bottom-6 left-6" delay={1}>
              <div className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-white/95 p-4 pr-6 shadow-xl shadow-forest/10 backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/60 text-forest"><Icon name="leaf" className="h-5 w-5" /></span>
                <span className="text-sm leading-5"><span className="block font-medium text-charcoal">{products.length} product{products.length === 1 ? "" : "s"}</span><span className="text-charcoal/60">From Sri Lanka</span></span>
              </div>
            </Depth>
          </div>
        </div>
      </HeroStage>

      {banner.image && <section aria-label={banner.imageAlt || "Banner"} className="w-full">
        <img src={banner.image} alt={banner.imageAlt} className="block aspect-[4/5] w-full bg-forest object-cover sm:aspect-[16/9] lg:aspect-auto lg:h-[min(42vw,46rem)]" />
      </section>}

      {featured.length > 0 && <section aria-labelledby="home-products" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#B07D22]">Featured products</p>
            <h2 id="home-products" className="mt-3 text-4xl sm:text-5xl">{home.products.title}</h2>
            {home.products.text && <p className="mt-3 text-lg text-charcoal/65">{home.products.text}</p>}
          </div>
          <Link href="/products" className="group/btn inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-ivory shadow-lg shadow-forest/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-xl">
            <Icon name="leaf" className="h-4 w-4" />{storeLabel}<Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>

        <ul className={`mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6 ${featured.length >= 4 ? "lg:grid-cols-4" : featured.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {featured.map((p, i) => <li key={p.slug} data-reveal style={{ "--i": i } as CSSProperties} className="min-w-0">
            <Link href={`/products/${p.slug}`} data-spotlight className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-forest/10 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2 hover:border-forest/20 hover:shadow-2xl hover:shadow-forest/15">
              <div className="relative overflow-hidden">
                {p.images?.[0]
                  ? <img src={p.images[0].src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.08]" />
                  : <ProductPlaceholder name={p.name} className="aspect-[4/5] w-full transition-transform duration-1000 group-hover:scale-[1.08]" />}
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/0 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(255_255_255/22%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-serif text-sm text-forest shadow-sm backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-cream text-forest opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><Icon name="arrowRight" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" /></span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl leading-snug">{p.name}</h3>
                {p.short && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-charcoal/70">{p.short}</p>}
                <span className="mt-5 inline-flex items-center gap-2 border-t border-forest/10 pt-4 text-sm font-medium text-forest">
                  <span className="relative">View details<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-forest transition-transform duration-500 group-hover:scale-x-100" /></span>
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          </li>)}
        </ul>

        <div data-reveal className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-forest/10 bg-gradient-to-r from-cream/40 via-ivory to-cream/30 px-6 py-5 sm:flex-row sm:px-8">
          <p className="text-center text-sm text-charcoal/70 sm:text-left">
            {products.length > featured.length
              ? <>Showing {featured.length} of <span className="font-semibold text-forest">{products.length} products</span>. Browse the full range, specifications and wholesale options.</>
              : <>Browse full specifications, packaging and wholesale options for every product.</>}
          </p>
          <Link href="/products" className="group/link inline-flex shrink-0 items-center gap-2 text-sm font-medium text-forest">
            <span className="relative">{storeLabel}<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-forest transition-transform duration-500 group-hover/link:scale-x-100" /></span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/25 transition-all duration-300 group-hover/link:border-forest group-hover/link:bg-forest group-hover/link:text-ivory"><Icon name="arrowRight" className="h-4 w-4" /></span>
          </Link>
        </div>
      </section>}

      <section className="why relative overflow-hidden border-y border-forest/10 bg-white/60">
        <span aria-hidden="true" className="why-watermark pointer-events-none absolute -bottom-8 left-0 whitespace-nowrap font-serif text-[9rem] leading-none text-transparent [-webkit-text-stroke:1px_rgb(24_58_44/8%)] sm:text-[13rem]">CEYLON · CEYLON · CEYLON</span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:py-28 md:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div aria-hidden="true" data-reveal="frame" className="absolute -inset-3 rounded-[2.25rem] border border-forest/15 sm:-inset-4" />
            <div data-reveal="clip"><div data-spotlight className="clip-target group relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-forest/15">
              <div className="clip-img transition-transform duration-[1.6s] ease-[cubic-bezier(.2,.8,.2,1)]">
                {why.image
                  ? <img src={why.image} alt={why.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105" />
                  : <ProductPlaceholder name="Sri Lanka" className="aspect-[4/3] w-full" />}
              </div>
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(255_255_255/22%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-forest shadow-lg backdrop-blur">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest/50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-forest" /></span>
                7.87° N, 80.77° E
              </span>
            </div></div>
            <div aria-hidden="true" data-reveal="scale" style={{ "--i": 4 } as CSSProperties} className="absolute -right-5 -top-8 sm:-right-8">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-forest text-cream shadow-xl shadow-forest/25 sm:h-32 sm:w-32">
                <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full">
                  <defs><path id="why-ring" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" /></defs>
                  <text className="fill-cream/85 text-[9.5px] uppercase tracking-[.32em]"><textPath href="#why-ring">Ceylon origin · Sri Lanka ·</textPath></text>
                </svg>
                <Icon name="leaf" className="h-7 w-7" />
              </div>
            </div>
          </div>
          <div>
            <p data-reveal className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[.22em] text-forest/60"><span className="h-px w-10 bg-forest/40" />Origin</p>
            <h2 data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-4 text-4xl leading-tight sm:text-5xl">{why.title}</h2>
            <div className="mt-6 space-y-4 text-lg leading-8 text-charcoal/70">
              {why.text.split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i} data-reveal style={{ "--i": i + 2 } as CSSProperties} className={i === 0 ? "text-xl leading-9 text-charcoal/80" : ""}>{para}</p>)}
            </div>
            <div data-reveal style={{ "--i": 4 } as CSSProperties}>
              <Link href="/about" className="group mt-9 inline-flex items-center gap-3 text-sm font-medium text-forest">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 transition-all duration-500 group-hover:border-forest group-hover:bg-forest group-hover:text-ivory"><Icon name="arrowRight" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" /></span>
                <span className="relative">Read our story<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-forest transition-transform duration-500 group-hover:scale-x-100" /></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {process.steps.length > 0 && <section className="relative overflow-hidden bg-forest py-20 text-ivory sm:py-28">
        <div aria-hidden="true" className="blob absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cream/10 blur-3xl" />
        <div aria-hidden="true" className="blob absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-[#2f5a43]/60 blur-3xl" style={{ animationDelay: "-9s" }} />
        <div aria-hidden="true" className="absolute inset-0 opacity-[.07] [background-image:radial-gradient(rgb(233_215_165)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-ivory/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[.22em] text-cream/80 backdrop-blur"><Icon name="leaf" className="h-3.5 w-3.5" />{process.steps.length} steps</p>
            <h2 className="mt-5 text-4xl !text-ivory sm:text-5xl lg:text-6xl">{process.title}</h2>
            {process.text && <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ivory/70">{process.text}</p>}
          </div>
          <ProcessTimeline steps={process.steps} />
        </div>
      </section>}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        {applications.items.length > 0 && <>
          <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl sm:text-5xl">{applications.title}</h2>
            <p className="text-sm text-charcoal/55">{applications.items.length} industries we supply</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {applications.items.map((a, i) => <li key={a} data-reveal="scale" style={{ "--i": i } as CSSProperties}>
              <div data-spotlight className="group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-3xl border border-forest/10 bg-white p-5 shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:border-forest/25 hover:shadow-xl hover:shadow-forest/10">
                <span aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/50 text-forest transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-forest group-hover:text-cream"><Icon name="check" className="h-4 w-4" /></span>
                  <span className="font-serif text-sm text-forest/35">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="relative mt-6 font-serif text-lg leading-snug text-forest">{a}</span>
              </div>
            </li>)}
          </ul>
        </>}
        {highlights.length > 0 && <div className={`grid gap-6 md:grid-cols-2 ${applications.items.length > 0 ? "mt-20" : ""}`}>
          {highlights.map((h, i) => {
            const icon = cardIcons[h.linkHref] ?? "leaf";
            return <div key={i} data-reveal={i % 2 ? "right" : "left"} style={{ "--i": i } as CSSProperties}><Link href={h.linkHref} data-spotlight
              className="group relative block h-full overflow-hidden rounded-[2rem] border border-forest/10 bg-gradient-to-br from-white to-cream/30 p-8 shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:border-forest/25 hover:shadow-2xl hover:shadow-forest/15 sm:p-10">
              <span aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <Icon name={icon} className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 text-forest/[.05] transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-rotate-12 group-hover:scale-110" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><Icon name={icon} className="h-6 w-6" /></span>
              <h3 className="relative mt-7 text-3xl sm:text-4xl">{h.title}</h3>
              {h.text && <p className="relative mt-3 max-w-md leading-7 text-charcoal/70">{h.text}</p>}
              {h.linkLabel && <span className="relative mt-8 inline-flex items-center gap-3 text-sm font-medium text-forest">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 transition-all duration-500 group-hover:border-forest group-hover:bg-forest group-hover:text-ivory"><Icon name="arrowRight" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" /></span>
                {h.linkLabel}
              </span>}
            </Link></div>;
          })}
        </div>}
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <section className="relative overflow-hidden rounded-[2rem] bg-cream/50 px-6 py-16 text-center sm:px-12">
          <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/50 blur-2xl" />
          <div aria-hidden="true" className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-forest/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl">{cta.title}</h2>
            {cta.text && <p className="mx-auto mt-4 max-w-lg text-lg leading-8 text-charcoal/70">{cta.text}</p>}
            {cta.buttonLabel && <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-ivory shadow-lg shadow-forest/20 hover:bg-charcoal">{cta.buttonLabel}<Icon name="arrowRight" /></Link>}
          </div>
        </section>
      </div>
    </>
  );
}
