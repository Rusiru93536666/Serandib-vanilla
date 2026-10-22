import Link from "next/link";
import { site } from "@/config/site";
import { getContent } from "@/lib/store";
import { Icon, type IconName } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";
export const dynamic = "force-dynamic";

const cardIcons: Record<string, IconName> = { "/quality": "shield", "/contact": "send", "/products": "leaf", "/gallery": "image", "/about": "leaf", "/blog": "file" };

export default async function Home() {
  const { home, products } = await getContent();
  const { hero, why, process, applications, highlights, cta } = home;
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-cream/45 via-ivory to-ivory">
        <div aria-hidden="true" className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-cream/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-2 lg:gap-16">
          <div className="rise">
            {hero.eyebrow && <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="leaf" className="h-3.5 w-3.5" />{hero.eyebrow}</p>}
            <h1 className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{hero.title}</h1>
            {hero.text && <p className="mt-6 max-w-xl text-lg leading-8 text-charcoal/70">{hero.text}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              {hero.primaryLabel && <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-medium text-ivory shadow-lg shadow-forest/20 hover:bg-charcoal">{hero.primaryLabel}<Icon name="arrowRight" /></Link>}
              {hero.secondaryLabel && <Link href="/contact" className="rounded-full border border-forest/25 bg-white/80 px-7 py-3.5 text-sm text-forest hover:border-forest">{hero.secondaryLabel}</Link>}
            </div>
          </div>
          <div className="relative">
            {hero.image
              ? <img src={hero.image} alt={hero.imageAlt} fetchPriority="high" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl shadow-forest/20 sm:aspect-[5/4] lg:aspect-[4/5]" />
              : <ProductPlaceholder name={site.brand} className="aspect-[4/5] w-full rounded-[2rem] shadow-2xl shadow-forest/20 sm:aspect-[5/4] lg:aspect-[4/5]" />}
            <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl border border-forest/10 bg-white/95 p-4 pr-6 shadow-xl shadow-forest/10 backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/60 text-forest"><Icon name="leaf" className="h-5 w-5" /></span>
              <span className="text-sm leading-5"><span className="block font-medium text-charcoal">{products.length} product{products.length === 1 ? "" : "s"}</span><span className="text-charcoal/60">From Sri Lanka</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl"><h2 className="text-4xl sm:text-5xl">{home.products.title}</h2>{home.products.text && <p className="mt-3 text-lg text-charcoal/65">{home.products.text}</p>}</div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline underline-offset-4">All products<Icon name="arrowRight" className="h-4 w-4" /></Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <li key={p.slug}>
            <Link href={`/products/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10">
              <div className="overflow-hidden">
                {p.images?.[0]
                  ? <img src={p.images[0].src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  : <ProductPlaceholder name={p.name} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-charcoal/70">{p.short}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest">View details<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </li>)}
        </ul>
      </section>

      <section className="border-y border-forest/10 bg-white/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-24 md:grid-cols-2 lg:gap-16">
          {why.image
            ? <img src={why.image} alt={why.imageAlt} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-forest/10" />
            : <ProductPlaceholder name="Sri Lanka" className="aspect-[4/3] w-full rounded-3xl shadow-xl shadow-forest/10" />}
          <div>
            <h2 className="text-4xl leading-tight sm:text-5xl">{why.title}</h2>
            <div className="mt-6 space-y-4 text-lg leading-8 text-charcoal/70">{why.text.split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}</div>
            <Link href="/about" className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline underline-offset-4">Read our story<Icon name="arrowRight" className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {process.steps.length > 0 && <section className="relative overflow-hidden bg-forest py-20 text-ivory sm:py-24">
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cream/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="text-4xl !text-ivory sm:text-5xl">{process.title}</h2>
          {process.text && <p className="mt-3 max-w-xl text-ivory/70">{process.text}</p>}
          <ol className={`mt-12 grid gap-4 sm:grid-cols-2 ${process.steps.length >= 5 ? "lg:grid-cols-5" : process.steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {process.steps.map((s, i) => <li key={i} className="rounded-2xl border border-ivory/10 bg-ivory/5 p-5 backdrop-blur transition-colors hover:bg-ivory/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream font-serif text-lg text-forest">{i + 1}</span>
              <h3 className="mt-4 text-xl !text-ivory">{s.title}</h3>
              {s.text && <p className="mt-2 text-sm leading-6 text-ivory/70">{s.text}</p>}
            </li>)}
          </ol>
        </div>
      </section>}

      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        {applications.items.length > 0 && <>
          <h2 className="text-4xl sm:text-5xl">{applications.title}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {applications.items.map((a) => <li key={a} className="flex flex-col items-start gap-3 rounded-2xl border border-forest/10 bg-white p-5 shadow-sm transition-colors hover:border-forest/30">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/50 text-forest"><Icon name="check" className="h-4 w-4" /></span>
              <span className="font-serif text-lg leading-snug text-forest">{a}</span>
            </li>)}
          </ul>
        </>}
        {highlights.length > 0 && <div className={`grid gap-6 md:grid-cols-2 ${applications.items.length > 0 ? "mt-16" : ""}`}>
          {highlights.map((h, i) => <Link key={i} href={h.linkHref} className="group relative overflow-hidden rounded-3xl border border-forest/10 bg-gradient-to-br from-white to-cream/30 p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-forest/10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-cream"><Icon name={cardIcons[h.linkHref] ?? "leaf"} className="h-6 w-6" /></span>
            <h3 className="mt-6 text-3xl">{h.title}</h3>
            {h.text && <p className="mt-3 leading-7 text-charcoal/70">{h.text}</p>}
            {h.linkLabel && <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest">{h.linkLabel}<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>}
          </Link>)}
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
