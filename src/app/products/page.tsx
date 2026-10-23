import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getContent } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { ProductPlaceholder } from "@/components/ProductMedia";
import { CtaBanner, JumpNav, PageHeader, RevealMedia, SectionNum, btnArrow, btnPrimary, btnSecondary, ctaPrimary, ctaSecondary } from "@/components/PageMotion";
export const metadata: Metadata = { title: "Vanilla products", description: "Vanilla beans, vanilla powder and vanilla tea from Sri Lanka for wholesale and manufacturing.", alternates: { canonical: "/products" } };

export const dynamic = "force-dynamic";
export default async function Products() {
  const { products } = await getContent();
  return (
    <div>
      <PageHeader eyebrow="From Sri Lanka" icon="leaf" title="Our products" watermark="VANILLA"
        lead="Vanilla beans, vanilla powder, and vanilla tea for importers, manufacturers, and private-label buyers.">
        <JumpNav label="Products" items={products.map((p, i) => ({ href: `#${p.slug}`, text: p.name, num: String(i + 1).padStart(2, "0") }))} />
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-24 px-5 py-20 sm:space-y-32 sm:py-28">
        {products.map((p, i) => {
          const photo = p.images?.[0];
          const num = String(i + 1).padStart(2, "0");
          return <article key={p.slug} id={p.slug} className="grid scroll-mt-24 items-center gap-10 md:grid-cols-2 lg:gap-16">
            <RevealMedia num={num} className={i % 2 ? "md:order-2" : ""}>
              <Link href={`/products/${p.slug}`} tabIndex={-1} aria-hidden="true" className="block">
                {photo
                  ? <img src={photo.src} alt="" loading={i === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover" />
                  : <ProductPlaceholder name={p.name} className="aspect-[4/3] w-full" />}
              </Link>
            </RevealMedia>
            <div className="relative min-w-0">
              <span aria-hidden="true" className="outline-forest pointer-events-none absolute -top-16 right-0 font-serif text-[9rem] leading-none">{num}</span>
              <div className="relative">
                <SectionNum num={num} />
                <h2 data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-3 text-3xl leading-tight sm:text-4xl"><Link href={`/products/${p.slug}`} className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_1px]">{p.name}</Link></h2>
                {p.short && <p data-reveal style={{ "--i": 2 } as CSSProperties} className="mt-3 text-lg font-medium text-forest/80">{p.short}</p>}
                <p data-reveal style={{ "--i": 3 } as CSSProperties} className="mt-4 leading-8 text-charcoal/70">{p.intro}</p>
                {p.uses.length > 0 && <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${p.name} uses`}>
                  {p.uses.map((u, j) => <li key={u} data-reveal="scale" style={{ "--i": 4 + j * .5 } as CSSProperties} className="rounded-full bg-cream/45 px-3 py-1 text-sm text-forest transition-colors duration-300 hover:bg-cream">{u}</li>)}
                </ul>}
                <div data-reveal style={{ "--i": 5 } as CSSProperties} className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/products/${p.slug}`} className={btnPrimary}>View details<Icon name="arrowRight" className={btnArrow} /></Link>
                  <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className={btnSecondary}>Request a quote</Link>
                </div>
              </div>
            </div>
          </article>;
        })}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <CtaBanner title="Looking for something specific?" text="Tell us the product, quantity, and packaging you need, and we will reply with terms for your order.">
          <Link href="/contact" className={ctaPrimary}>Request a quote<Icon name="arrowRight" className={btnArrow} /></Link>
          <Link href="/quality" className={ctaSecondary}>Quality & documents</Link>
        </CtaBanner>
      </div>
    </div>
  );
}
