import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts, isPublicPost } from "@/lib/blog";
import { BlogCard, FeaturedCard } from "@/components/BlogCard";
import { Icon } from "@/components/Icon";
import type { CSSProperties } from "react";
import { CtaBanner, PageHeader, btnArrow, btnPrimary, ctaPrimary, ctaSecondary } from "@/components/PageMotion";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vanilla insights and news", description: "Explore practical guides, origin stories, and news about Sri Lankan vanilla for importers, manufacturers, and wholesale buyers.", alternates: { canonical: "/blog" } };
const perPage = 9;

type Search = { page?: string; category?: string; tag?: string };

export default async function Blog({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const pageParam = Number(params.page ?? 1);
  const page = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const posts = (await getBlogPosts()).filter((post) => isPublicPost(post)).sort((a, b) => Number(b.featured) - Number(a.featured) || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))].sort();
  const category = categories.includes(params.category ?? "") ? params.category! : "";
  const tag = params.tag?.trim() ?? "";
  const filtered = posts.filter((post) => (!category || post.category === category) && (!tag || post.tags.includes(tag)));
  const hero = !category && !tag ? filtered[0] : undefined;
  const rest = hero ? filtered.slice(1) : filtered;
  const pageCount = Math.max(1, Math.ceil(rest.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const pagePosts = rest.slice((currentPage - 1) * perPage, currentPage * perPage);
  const href = (next: Search) => {
    const query = new URLSearchParams(Object.entries({ category, tag, ...next }).filter(([key, value]) => value && !(key === "page" && value === "1")) as [string, string][]);
    return query.size ? `/blog?${query}` : "/blog";
  };
  const chip = (active: boolean) => `whitespace-nowrap rounded-full px-4 py-2 text-sm backdrop-blur transition-all duration-300 ${active ? "bg-forest text-ivory shadow-lg shadow-forest/20" : "border border-forest/15 bg-white/80 text-charcoal/75 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"}`;

  return (
    <div>
      <PageHeader eyebrow="Notes from Sri Lanka" icon="file" title="Vanilla insights" watermark="JOURNAL"
        lead="Practical information about vanilla products, sourcing, and working with a wholesale supplier.">
        {categories.length > 0 && <nav aria-label="Filter articles by category" className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 pt-1">
          <Link href="/blog" aria-current={!category && !tag ? "page" : undefined} className={chip(!category && !tag)}>All articles</Link>
          {categories.map((name) => <Link key={name} href={href({ category: name, tag: "", page: "" })} aria-current={category === name ? "page" : undefined} className={chip(category === name)}>{name}</Link>)}
        </nav>}
      </PageHeader>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        {tag && <div data-reveal className="mb-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/50 px-3 py-1.5 text-forest"><Icon name="tag" className="h-3.5 w-3.5" />Tagged “{tag}”</span>
          <Link href={href({ tag: "", page: "" })} className="inline-flex items-center gap-1 text-charcoal/60 hover:text-forest"><Icon name="x" className="h-3.5 w-3.5" />Clear</Link>
        </div>}

        {filtered.length === 0 ? <div data-reveal className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-20 text-center">
          <p className="font-serif text-3xl text-forest">{posts.length === 0 ? "Stories are on their way" : "No articles here yet"}</p>
          <p className="mt-3 text-charcoal/65">{posts.length === 0 ? "We haven't published any articles yet. Check back soon." : "Try another category or browse all articles."}</p>
          {posts.length > 0 && <Link href="/blog" className={`mt-6 ${btnPrimary}`}>Browse all articles<Icon name="arrowRight" className={btnArrow} /></Link>}
        </div> : <>
          {hero && currentPage === 1 && <div data-reveal><FeaturedCard post={hero} /></div>}
          {pagePosts.length > 0 && <>
            {hero && currentPage === 1 && <h2 data-reveal className="mb-8 mt-20 flex items-center gap-4 text-3xl sm:text-4xl">More articles<span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-forest/25 to-transparent" /></h2>}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {pagePosts.map((post, i) => <li key={post.id} data-reveal style={{ "--i": i % 3 } as CSSProperties} className="min-w-0"><BlogCard post={post} /></li>)}
            </ul>
          </>}
        </>}

        {pageCount > 1 && <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pages">
          {currentPage > 1
            ? <Link className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:shadow-md" href={href({ page: String(currentPage - 1) })}><Icon name="arrowLeft" className="h-4 w-4" />Previous</Link>
            : <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-charcoal/35"><Icon name="arrowLeft" className="h-4 w-4" />Previous</span>}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => <Link key={n} href={href({ page: String(n) })} aria-current={n === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm ${n === currentPage ? "bg-forest text-ivory shadow-lg shadow-forest/20" : "transition-colors hover:bg-forest/10"}`}>{n}</Link>)}
          {currentPage < pageCount
            ? <Link className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:shadow-md" href={href({ page: String(currentPage + 1) })}>Next<Icon name="arrowRight" className="h-4 w-4" /></Link>
            : <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-charcoal/35">Next<Icon name="arrowRight" className="h-4 w-4" /></span>}
        </nav>}

        <div className="mt-24">
          <CtaBanner title="Sourcing vanilla for your business?" text="Talk with us about wholesale supply, product specifications, and samples for your import or manufacturing needs.">
            <Link href="/contact" className={ctaPrimary}>Request a wholesale quote<Icon name="arrowRight" className={btnArrow} /></Link>
            <Link href="/products/vanilla-beans" className={ctaSecondary}>Explore vanilla products</Link>
          </CtaBanner>
        </div>
      </div>
    </div>
  );
}
