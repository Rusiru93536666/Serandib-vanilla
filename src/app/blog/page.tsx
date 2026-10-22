import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts, isPublicPost } from "@/lib/blog";
import { BlogCard, FeaturedCard } from "@/components/BlogCard";
import { Icon } from "@/components/Icon";

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
  const chip = (active: boolean) => `whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${active ? "bg-forest text-ivory shadow-sm" : "border border-forest/15 bg-white text-charcoal/75 hover:border-forest/40 hover:text-forest"}`;

  return (
    <div>
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-16 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75">Notes from Sri Lanka</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Vanilla insights</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">Practical information about vanilla products, sourcing, and working with a wholesale supplier.</p>
          {categories.length > 0 && <nav aria-label="Filter articles by category" className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1">
            <Link href="/blog" aria-current={!category && !tag ? "page" : undefined} className={chip(!category && !tag)}>All articles</Link>
            {categories.map((name) => <Link key={name} href={href({ category: name, tag: "", page: "" })} aria-current={category === name ? "page" : undefined} className={chip(category === name)}>{name}</Link>)}
          </nav>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {tag && <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/50 px-3 py-1.5 text-forest"><Icon name="tag" className="h-3.5 w-3.5" />Tagged “{tag}”</span>
          <Link href={href({ tag: "", page: "" })} className="inline-flex items-center gap-1 text-charcoal/60 hover:text-forest"><Icon name="x" className="h-3.5 w-3.5" />Clear</Link>
        </div>}

        {filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-20 text-center">
          <p className="font-serif text-3xl text-forest">{posts.length === 0 ? "Stories are on their way" : "No articles here yet"}</p>
          <p className="mt-3 text-charcoal/65">{posts.length === 0 ? "We haven't published any articles yet. Check back soon." : "Try another category or browse all articles."}</p>
          {posts.length > 0 && <Link href="/blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm text-ivory hover:bg-charcoal">Browse all articles<Icon name="arrowRight" /></Link>}
        </div> : <>
          {hero && currentPage === 1 && <FeaturedCard post={hero} />}
          {pagePosts.length > 0 && <>
            {hero && currentPage === 1 && <h2 className="mb-6 mt-16 text-3xl">More articles</h2>}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {pagePosts.map((post) => <li key={post.id} className="min-w-0"><BlogCard post={post} /></li>)}
            </ul>
          </>}
        </>}

        {pageCount > 1 && <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pages">
          {currentPage > 1
            ? <Link className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm hover:border-forest" href={href({ page: String(currentPage - 1) })}><Icon name="arrowLeft" className="h-4 w-4" />Previous</Link>
            : <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-charcoal/35"><Icon name="arrowLeft" className="h-4 w-4" />Previous</span>}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => <Link key={n} href={href({ page: String(n) })} aria-current={n === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm ${n === currentPage ? "bg-forest text-ivory" : "hover:bg-forest/10"}`}>{n}</Link>)}
          {currentPage < pageCount
            ? <Link className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm hover:border-forest" href={href({ page: String(currentPage + 1) })}>Next<Icon name="arrowRight" className="h-4 w-4" /></Link>
            : <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-charcoal/35">Next<Icon name="arrowRight" className="h-4 w-4" /></span>}
        </nav>}

        <aside className="relative mt-20 overflow-hidden rounded-3xl bg-forest px-6 py-12 text-ivory sm:px-12">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cream/15 blur-2xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl text-ivory sm:text-4xl">Sourcing vanilla for your business?</h2>
            <p className="mt-3 leading-7 text-ivory/80">Talk with us about wholesale supply, product specifications, and samples for your import or manufacturing needs.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-sm font-medium text-forest hover:bg-ivory">Request a wholesale quote<Icon name="arrowRight" /></Link>
              <Link href="/products/vanilla-beans" className="rounded-full border border-ivory/40 px-5 py-3 text-sm hover:bg-ivory/10">Explore vanilla products</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
