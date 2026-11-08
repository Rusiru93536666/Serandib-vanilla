import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getContent } from "@/lib/store";
import { Icon, type IconName } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";
import { CtaBanner, JumpNav, PageHeader, btnArrow, ctaPrimary, ctaSecondary, shell } from "@/components/PageMotion";
export const metadata: Metadata = { title: "Vanilla products", description: "Vanilla beans, vanilla powder and vanilla tea from Sri Lanka for wholesale and manufacturing.", alternates: { canonical: "/products" } };

const highlights: { icon: IconName; title: string; text: string }[] = [
  { icon: "leaf", title: "Direct from Sri Lanka", text: "Vanilla sourced and prepared in Sri Lanka for international buyers." },
  { icon: "shield", title: "Lot documents", text: "Quality documents are shared per lot when available." },
  { icon: "file", title: "Wholesale & private label", text: "Supply for importers, manufacturers and private-label brands." },
  { icon: "send", title: "Quick quotes", text: "Share your quantity and requirements and we reply by email with terms." },
];

export const dynamic = "force-dynamic";
export default async function Products() {
  const { products } = await getContent();
  // Spec rows shared by at least two products make a fair side-by-side comparison.
  const specCounts = new Map<string, number>();
  products.forEach((p) => new Set(p.specs.map(([k]) => k).filter(Boolean)).forEach((k) => specCounts.set(k, (specCounts.get(k) ?? 0) + 1)));
  const compareKeys = [...specCounts].filter(([, n]) => n > 1 || products.length === 1).map(([k]) => k).slice(0, 5);
  const specValue = (specs: [string, string][], key: string) => specs.find(([k]) => k === key)?.[1] || "—";

  return (
    <div>
      <PageHeader wide eyebrow="From Sri Lanka" icon="leaf" title="Our products" watermark="VANILLA"
        lead="Vanilla beans, vanilla powder, and vanilla tea for importers, manufacturers, and private-label buyers.">
        <JumpNav label="Products" items={products.map((p, i) => ({ href: `#${p.slug}`, text: p.name, num: String(i + 1).padStart(2, "0") }))} />
      </PageHeader>

      <section aria-labelledby="range" className={`${shell} py-16 sm:py-20`}>
        <div data-reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-forest/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#B07D22]">Product range</p>
            <h2 id="range" className="mt-2 text-3xl sm:text-4xl">Wholesale vanilla products</h2>
          </div>
          <p className="text-sm text-charcoal/60">{products.length} {products.length === 1 ? "product" : "products"} available</p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {products.map((p, i) => {
            const photo = p.images?.[0];
            const num = String(i + 1).padStart(2, "0");
            const keySpecs = p.specs.filter(([k]) => k).slice(0, 4);
            return <li key={p.slug} id={p.slug} data-reveal style={{ "--i": i } as CSSProperties} className="min-w-0 scroll-mt-28">
              <article data-spotlight className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:border-forest/20 hover:shadow-2xl hover:shadow-forest/15">
                <div className="relative overflow-hidden">
                  {photo
                    ? <img src={photo.src} alt={photo.alt || p.name} loading={i < 3 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.06]" />
                    : <ProductPlaceholder name={p.name} className="aspect-[4/3] w-full" />}
                  <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 font-serif text-sm text-forest shadow-sm backdrop-blur">{num}</span>
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-forest/85 px-3 py-1 text-xs font-medium text-ivory backdrop-blur"><Icon name="leaf" className="h-3.5 w-3.5" />Wholesale</span>
                  {p.video && <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-charcoal/75 px-3 py-1 text-xs font-medium text-ivory backdrop-blur"><Icon name="video" className="h-3.5 w-3.5" />Video</span>}
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="text-2xl leading-snug sm:text-[1.75rem]">
                    <Link href={`/products/${p.slug}`} className="focus:outline-none focus-visible:underline">{p.name}</Link>
                  </h3>
                  {p.short && <p className="mt-2 font-medium text-forest/80">{p.short}</p>}
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-charcoal/70">{p.intro}</p>

                  {p.uses.length > 0 && <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${p.name} uses`}>
                    {p.uses.slice(0, 3).map((u) => <li key={u} className="rounded-full bg-cream/45 px-3 py-1 text-xs text-forest">{u}</li>)}
                    {p.uses.length > 3 && <li className="rounded-full border border-forest/15 px-3 py-1 text-xs text-charcoal/60">+{p.uses.length - 3} more</li>}
                  </ul>}

                  {keySpecs.length > 0 && <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-forest/10 bg-forest/10">
                    {keySpecs.map(([k, v]) => <div key={k} className="min-w-0 bg-ivory/60 px-4 py-3 last:odd:col-span-2">
                      <dt className="truncate text-[0.6875rem] font-medium uppercase tracking-[.12em] text-charcoal/50">{k}</dt>
                      <dd className="mt-0.5 truncate text-sm text-charcoal/85">{v || "—"}</dd>
                    </div>)}
                  </dl>}

                  <div className="mt-auto grid grid-cols-2 gap-3 pt-7">
                    <Link href={`/products/${p.slug}`} className="group/btn inline-flex items-center justify-center gap-2 rounded-full bg-forest px-4 py-3 text-sm font-medium text-ivory shadow-lg shadow-forest/20 transition-colors hover:bg-charcoal">Details<Icon name="arrowRight" className={btnArrow} /></Link>
                    <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="inline-flex items-center justify-center rounded-full border border-forest/25 px-4 py-3 text-sm text-forest transition-colors hover:border-forest hover:bg-forest/5">Get a quote</Link>
                  </div>
                </div>
              </article>
            </li>;
          })}
        </ul>
      </section>

      {products.length > 1 && <section aria-labelledby="compare" className="border-y border-forest/10 bg-white/50">
        <div className={`${shell} py-16 sm:py-20`}>
          <div data-reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#B07D22]">At a glance</p>
            <h2 id="compare" className="mt-2 text-3xl sm:text-4xl">Compare products</h2>
            <p className="mt-3 leading-7 text-charcoal/65">Key details side by side. Full specifications are on each product page and are confirmed per lot.</p>
          </div>
          <div data-reveal className="mt-10 overflow-x-auto rounded-3xl border border-forest/10 bg-white shadow-sm">
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-forest/10 bg-forest text-ivory">
                  <th scope="col" className="w-48 px-6 py-4 text-xs font-semibold uppercase tracking-[.14em] text-cream/80">Product</th>
                  {products.map((p) => <th key={p.slug} scope="col" className="px-6 py-4 font-serif text-lg font-normal">
                    <Link href={`/products/${p.slug}`} className="hover:underline underline-offset-4">{p.name}</Link>
                  </th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                <tr className="align-top">
                  <th scope="row" className="bg-ivory/60 px-6 py-4 font-medium text-charcoal/80">Best for</th>
                  {products.map((p) => <td key={p.slug} className="px-6 py-4 text-charcoal/70">{p.uses.length ? p.uses.join(", ") : "—"}</td>)}
                </tr>
                {compareKeys.map((key) => <tr key={key} className="align-top">
                  <th scope="row" className="bg-ivory/60 px-6 py-4 font-medium text-charcoal/80">{key}</th>
                  {products.map((p) => <td key={p.slug} className="px-6 py-4 text-charcoal/70">{specValue(p.specs, key)}</td>)}
                </tr>)}
                <tr>
                  <th scope="row" className="bg-ivory/60 px-6 py-4"><span className="sr-only">Actions</span></th>
                  {products.map((p) => <td key={p.slug} className="px-6 py-4">
                    <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="inline-flex items-center gap-1.5 font-medium text-forest hover:underline underline-offset-4">Request a quote<Icon name="arrowRight" className="h-4 w-4" /></Link>
                  </td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>}

      <section aria-label="Why buy from us" className={`${shell} py-16 sm:py-20`}>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((h, i) => <li key={h.title} data-reveal style={{ "--i": i } as CSSProperties} className="flex gap-4 rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest"><Icon name={h.icon} className="h-5 w-5" /></span>
            <div>
              <h3 className="text-xl">{h.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-charcoal/65">{h.text}</p>
            </div>
          </li>)}
        </ul>
      </section>

      <div className={`${shell} pb-20`}>
        <CtaBanner title="Looking for something specific?" text="Tell us the product, quantity, and packaging you need, and we will reply with terms for your order.">
          <Link href="/contact" className={ctaPrimary}>Request a quote<Icon name="arrowRight" className={btnArrow} /></Link>
          <Link href="/quality" className={ctaSecondary}>Quality & documents</Link>
        </CtaBanner>
      </div>
    </div>
  );
}
