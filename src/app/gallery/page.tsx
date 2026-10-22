import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/store";
import GalleryGrid from "@/components/GalleryGrid";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery", description: "Photos of our vanilla products, sourcing, and packaging from Sri Lanka.", alternates: { canonical: "/gallery" } };

export default async function Gallery() {
  const { gallery } = await getContent();
  return (
    <div>
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-16 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="image" className="h-3.5 w-3.5" />Gallery</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">A closer look</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">Photos of our vanilla products, sourcing, and packaging. Select any photo to view it larger.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {gallery.length === 0
          ? <div className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-20 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="image" className="h-7 w-7" /></span>
              <p className="mt-5 font-serif text-3xl text-forest">Photos coming soon</p>
              <p className="mt-3 text-charcoal/65">We are preparing our gallery. In the meantime, explore our products.</p>
              <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm text-ivory hover:bg-charcoal">View products<Icon name="arrowRight" /></Link>
            </div>
          : <GalleryGrid items={gallery} />}

        <aside className="relative mt-20 overflow-hidden rounded-3xl bg-forest px-6 py-12 text-ivory sm:px-12">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cream/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl text-ivory sm:text-4xl">Like what you see?</h2>
              <p className="mt-3 leading-7 text-ivory/80">Ask us about samples, specifications, and wholesale terms for your business.</p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest hover:bg-ivory">Request a quote<Icon name="arrowRight" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
