import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContent } from "@/lib/store";
import QuoteForm from "@/components/QuoteForm";
import { Icon } from "@/components/Icon";
import { ProductGallery, ProductPlaceholder } from "@/components/ProductMedia";
import { shell } from "@/components/PageMotion";
import BlogArticleContent from "@/components/BlogArticleContent";
import { youtubeId } from "@/lib/media";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getContent();
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  const image = p.images?.[0];
  return {
    title: `${p.name} supplier from Sri Lanka`,
    description: p.short,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: image ? { images: [{ url: image.src, alt: image.alt || p.name }] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getContent();
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = products.filter((x) => x.slug !== p.slug);
  const keyFacts = p.specs.filter(([k]) => k).slice(0, 4);
  const videoId = p.video ? youtubeId(p.video) : "";
  const hasOverview = !!p.description || !!videoId;
  const card = "rounded-3xl border border-forest/10 bg-white p-6 shadow-sm sm:p-8";
  const eyebrow = "text-xs font-semibold uppercase tracking-[.18em] text-[#B07D22]";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div className={`${shell} relative pb-16 pt-10 sm:pt-12`}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-charcoal/55">
            <Link href="/" className="hover:text-forest">Home</Link>
            <span aria-hidden="true">/</span><Link href="/products" className="hover:text-forest">Products</Link>
            <span aria-hidden="true">/</span><span className="text-charcoal/80">{p.name}</span>
          </nav>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 xl:gap-20">
            <ProductGallery images={p.images ?? []} name={p.name} />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="leaf" className="h-3.5 w-3.5" />Sri Lankan vanilla</p>
              <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl">{p.name}</h1>
              {p.short && <p className="mt-5 text-xl leading-8 text-forest/85">{p.short}</p>}
              <p className="mt-5 leading-8 text-charcoal/70">{p.intro}</p>
              {keyFacts.length > 0 && <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-forest/10 bg-forest/10">
                {keyFacts.map(([k, v]) => <div key={k} className="min-w-0 bg-white/90 px-5 py-4 last:odd:col-span-2">
                  <dt className="truncate text-xs font-medium uppercase tracking-[.12em] text-charcoal/50">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-charcoal/85">{v || "—"}</dd>
                </div>)}
              </dl>}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <a href="#inquiry" className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-ivory shadow-lg shadow-forest/20 transition-colors hover:bg-charcoal"><Icon name="send" />Request a quote</a>
                {videoId
                  ? <a href="#overview" className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/25 bg-white px-6 py-3.5 text-sm text-forest transition-colors hover:border-forest"><Icon name="video" />Watch video</a>
                  : <a href="#specifications" className="inline-flex items-center justify-center rounded-full border border-forest/25 bg-white px-6 py-3.5 text-sm text-forest transition-colors hover:border-forest">View specifications</a>}
              </div>
              <Link href="/quality" className="mt-6 inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-forest"><Icon name="shield" className="h-4 w-4" />Quality documents are shared per lot when available</Link>
            </div>
          </div>
        </div>
      </section>

      <div className={`${shell} space-y-16 py-16 sm:space-y-20 sm:py-20`}>
        {hasOverview && <section id="overview" aria-labelledby="overview-title" className="scroll-mt-28">
          <div className="border-b border-forest/10 pb-6">
            <p className={eyebrow}>In depth</p>
            <h2 id="overview-title" className="mt-2 text-3xl sm:text-4xl">Product overview</h2>
          </div>
          <div className={`mt-10 grid items-start gap-10 xl:gap-16 ${p.description && videoId ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""}`}>
            {p.description && <div className={`min-w-0 ${videoId ? "" : "max-w-4xl"}`}><BlogArticleContent content={p.description} /></div>}
            {videoId && <figure className={`min-w-0 ${p.description ? "lg:sticky lg:top-28 lg:order-last" : "mx-auto w-full max-w-5xl"}`}>
              <div className="aspect-video overflow-hidden rounded-3xl bg-charcoal shadow-2xl shadow-forest/20 ring-1 ring-forest/10">
                <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={`${p.name} video`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
              </div>
              <figcaption className="mt-3 inline-flex items-center gap-2 text-sm text-charcoal/60"><Icon name="video" className="h-4 w-4" />{p.name} on video</figcaption>
            </figure>}
          </div>
        </section>}

        <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
          <section id="specifications" className={`${card} scroll-mt-28 lg:col-span-2`}>
            <p className={eyebrow}>Technical data</p>
            <h2 className="mt-2 text-3xl">Specifications</h2>
            {p.specs.length > 0
              ? <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-forest/10 bg-forest/10 sm:grid-cols-2">{p.specs.map(([k, v]) => <div key={k} className="min-w-0 bg-white px-5 py-4 sm:last:odd:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-[.12em] text-charcoal/50">{k}</dt>
                  <dd className="mt-1 text-sm text-charcoal/85">{v || "—"}</dd>
                </div>)}</dl>
              : <p className="mt-4 text-charcoal/60">Specifications are shared on request for each lot.</p>}
          </section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
            {p.uses.length > 0 && <section className={card}>
              <p className={eyebrow}>Applications</p>
              <h2 className="mt-2 text-2xl">Uses</h2>
              <ul className="mt-5 space-y-3">{p.uses.map((u) => <li key={u} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="check" className="h-3.5 w-3.5" /></span>{u}</li>)}</ul>
              {p.note && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm italic text-amber-900 ring-1 ring-amber-600/15">Editor note: {p.note}</p>}
            </section>}
            {p.packaging && <section className={card}>
              <p className={eyebrow}>Supply</p>
              <h2 className="mt-2 text-2xl">Packaging</h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-charcoal/75">{p.packaging}</p>
            </section>}
          </div>
        </div>

        <section id="inquiry" className="scroll-mt-28 overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="relative bg-forest p-8 text-ivory sm:p-10">
            <div aria-hidden="true" className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cream/15 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl !text-ivory">Request a quote for {p.name}</h2>
              <p className="mt-4 leading-7 text-ivory/75">Share your quantity and requirements. We reply by email with terms for your order.</p>
              <ul className="mt-8 space-y-3 text-sm text-ivory/85">
                {["Wholesale and private-label orders", "Documents shared per lot when available", "Reply by email with terms"].map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream/20 text-cream"><Icon name="check" className="h-3 w-3" /></span>{t}</li>)}
              </ul>
              <Link href="/contact" className="mt-8 inline-flex items-center gap-1.5 text-sm text-cream hover:underline underline-offset-4">More ways to contact us<Icon name="arrowRight" className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="p-6 sm:p-10"><QuoteForm products={products.map((x) => x.name)} defaultProduct={p.name} /></div>
        </section>

        {related.length > 0 && <section>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-forest/10 pb-6">
            <div>
              <p className={eyebrow}>More from our range</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Other products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline underline-offset-4">All products<Icon name="arrowRight" className="h-4 w-4" /></Link>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
            {related.map((r) => <li key={r.slug}>
              <Link href={`/products/${r.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10">
                <div className="overflow-hidden">
                  {r.images?.[0]
                    ? <img src={r.images[0].src} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    : <ProductPlaceholder name={r.name} className="aspect-[16/10] w-full" />}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-2xl">{r.name}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-charcoal/70">{r.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest">View details<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </li>)}
          </ul>
        </section>}
      </div>
    </div>
  );
}
