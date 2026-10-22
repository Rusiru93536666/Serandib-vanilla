import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";
export const metadata: Metadata = { title: "Vanilla products", description: "Vanilla beans, vanilla powder and vanilla tea from Sri Lanka for wholesale and manufacturing.", alternates: { canonical: "/products" } };

export const dynamic = "force-dynamic";
export default async function Products() {
  const { products } = await getContent();
  return (
    <div>
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="leaf" className="h-3.5 w-3.5" />From Sri Lanka</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Our products</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">Vanilla beans, vanilla powder, and vanilla tea for importers, manufacturers, and private-label buyers.</p>
          <nav aria-label="Products" className="mt-10 flex flex-wrap gap-2">
            {products.map((p) => <a key={p.slug} href={`#${p.slug}`} className="rounded-full border border-forest/15 bg-white px-4 py-2 text-sm text-charcoal/75 transition-colors hover:border-forest/40 hover:text-forest">{p.name}</a>)}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-20 px-5 py-16 sm:space-y-28 sm:py-24">
        {products.map((p, i) => {
          const photo = p.images?.[0];
          return <article key={p.slug} id={p.slug} className="grid scroll-mt-24 items-center gap-10 md:grid-cols-2 lg:gap-16">
            <Link href={`/products/${p.slug}`} className={`group block overflow-hidden rounded-3xl shadow-xl shadow-forest/10 ${i % 2 ? "md:order-2" : ""}`} tabIndex={-1} aria-hidden="true">
              {photo
                ? <img src={photo.src} alt="" loading={i === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                : <ProductPlaceholder name={p.name} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />}
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[.2em] text-[#B07D22]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl"><Link href={`/products/${p.slug}`} className="hover:underline underline-offset-4">{p.name}</Link></h2>
              {p.short && <p className="mt-3 text-lg font-medium text-forest/80">{p.short}</p>}
              <p className="mt-4 leading-8 text-charcoal/70">{p.intro}</p>
              {p.uses.length > 0 && <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${p.name} uses`}>
                {p.uses.map((u) => <li key={u} className="rounded-full bg-cream/45 px-3 py-1 text-sm text-forest">{u}</li>)}
              </ul>}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-ivory hover:bg-charcoal">View details<Icon name="arrowRight" /></Link>
                <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="rounded-full border border-forest/25 bg-white px-6 py-3 text-sm text-forest hover:border-forest">Request a quote</Link>
              </div>
            </div>
          </article>;
        })}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <aside className="relative overflow-hidden rounded-3xl bg-forest px-6 py-12 text-ivory sm:px-12">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cream/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl text-ivory sm:text-4xl">Looking for something specific?</h2>
              <p className="mt-3 leading-7 text-ivory/80">Tell us the product, quantity, and packaging you need, and we will reply with terms for your order.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest hover:bg-ivory">Request a quote<Icon name="arrowRight" /></Link>
              <Link href="/quality" className="rounded-full border border-ivory/40 px-6 py-3 text-sm hover:bg-ivory/10">Quality & documents</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
