import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/store";
import GalleryGrid from "@/components/GalleryGrid";
import { Icon } from "@/components/Icon";
import { CtaBanner, PageHeader, btnArrow, btnPrimary, ctaPrimary } from "@/components/PageMotion";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery", description: "Photos of our vanilla products, sourcing, and packaging from Sri Lanka.", alternates: { canonical: "/gallery" } };

export default async function Gallery() {
  const { gallery } = await getContent();
  return (
    <div>
      <PageHeader eyebrow="Gallery" icon="image" title="A closer look" watermark="GALLERY"
        lead="Photos of our vanilla products, sourcing, and packaging. Select any photo to view it larger." />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        {gallery.length === 0
          ? <div data-reveal className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-20 text-center">
              <span className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="image" className="h-7 w-7" /></span>
              <p className="mt-5 font-serif text-3xl text-forest">Photos coming soon</p>
              <p className="mt-3 text-charcoal/65">We are preparing our gallery. In the meantime, explore our products.</p>
              <Link href="/products" className={`mt-6 ${btnPrimary}`}>View products<Icon name="arrowRight" className={btnArrow} /></Link>
            </div>
          : <GalleryGrid items={gallery} />}

        <div className="mt-24">
          <CtaBanner title="Like what you see?" text="Ask us about samples, specifications, and wholesale terms for your business.">
            <Link href="/contact" className={ctaPrimary}>Request a quote<Icon name="arrowRight" className={btnArrow} /></Link>
          </CtaBanner>
        </div>
      </div>
    </div>
  );
}
