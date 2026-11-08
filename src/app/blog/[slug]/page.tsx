import Link from "next/link";
import type { CSSProperties } from "react";
import { CtaBanner, RevealMedia, btnArrow, ctaPrimary, ctaSecondary } from "@/components/PageMotion";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPosts, isPublicPost, readingMinutes, type BlogPost } from "@/lib/blog";
import { site } from "@/config/site";
import BlogArticleContent, { articleHeadings } from "@/components/BlogArticleContent";
import { BlogCard, PostMeta, formatPostDate } from "@/components/BlogCard";
import { ReadingProgress, ShareLinks } from "@/components/BlogClient";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
async function find(slug: string) {
  const posts = (await getBlogPosts()).filter((post) => isPublicPost(post));
  return posts.find((post) => post.slug === slug) ?? posts.find((post) => post.previousSlugs.includes(slug));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await find(slug);
  if (!post) return { title: "Post not found" };
  if (post.slug !== slug) redirect(`/blog/${post.slug}`);
  const url = post.canonicalUrl || `${site.url}/blog/${post.slug}`;
  const image = post.ogImage || post.coverImage;
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image, alt: post.coverAlt || post.title }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

const byDate = (a: BlogPost, b: BlogPost) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");

function relatedPosts(current: BlogPost, all: BlogPost[]) {
  return all.filter((post) => post.id !== current.id)
    .map((post) => ({ post, score: Number(!!current.category && post.category === current.category) + post.tags.filter((tag) => current.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score || byDate(a.post, b.post))
    .slice(0, 4).map(({ post }) => post);
}

// Full-width page container shared by every band of the article.
const shell = "mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12";
const railTitle = "text-xs font-semibold uppercase tracking-[.18em] text-charcoal/50";

function SidePost({ post }: { post: BlogPost }) {
  return <li className="group relative flex gap-4">
    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-forest">
      {post.coverImage && <img src={post.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
    </div>
    <div className="min-w-0 self-center">
      <h3 className="line-clamp-2 font-serif text-lg leading-snug transition-colors group-hover:text-forest">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
      </h3>
      <PostMeta post={post} className="mt-1.5" />
    </div>
  </li>;
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await find(slug);
  if (!post) notFound();
  if (post.slug !== slug) redirect(`/blog/${post.slug}`);
  const published = (await getBlogPosts()).filter((item) => isPublicPost(item)).sort(byDate);
  const related = relatedPosts(post, published);
  const latest = published.filter((item) => item.id !== post.id && !related.includes(item)).slice(0, 4);
  const sidebarPosts = latest.length ? latest : related;
  const categories = [...published.reduce((map, item) => item.category ? map.set(item.category, (map.get(item.category) ?? 0) + 1) : map, new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const headings = articleHeadings(post.content);
  const hasCover = !!post.coverImage;
  const canonical = post.canonicalUrl || `${site.url}/blog/${post.slug}`;
  const articleJson = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author || site.brand },
    publisher: { "@type": "Organization", name: site.brand, url: site.url },
    mainEntityOfPage: canonical,
    ...(post.ogImage || post.coverImage ? { image: post.ogImage || post.coverImage } : {}),
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJson).replace(/</g, "\\u003c") }} />
      <ReadingProgress />
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="blob absolute -left-32 top-0 h-80 w-80 rounded-full bg-cream/50 blur-3xl" />
        <div className={`${shell} relative grid items-center gap-10 py-10 sm:py-14 lg:py-16 ${hasCover ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-16" : ""}`}>
          <div className={hasCover ? "" : "mx-auto max-w-4xl text-center"}>
            <nav aria-label="Breadcrumb" className={`rise flex items-center gap-2 text-sm text-charcoal/55 ${hasCover ? "" : "justify-center"}`}>
              <Link href="/blog" className="inline-flex items-center gap-1.5 hover:text-forest"><Icon name="arrowLeft" className="h-4 w-4" />All articles</Link>
              {post.category && <><span aria-hidden="true">/</span><Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-forest">{post.category}</Link></>}
            </nav>
            <h1 style={{ animationDelay: ".1s" }} className="rise mt-6 text-4xl leading-[1.1] sm:text-5xl xl:text-6xl">{post.title}</h1>
            {post.excerpt && <p style={{ animationDelay: ".2s" }} className={`rise mt-6 max-w-2xl text-lg leading-8 text-charcoal/70 sm:text-xl ${hasCover ? "" : "mx-auto"}`}>{post.excerpt}</p>}
            <div style={{ animationDelay: ".3s" }} className={`rise mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-charcoal/60 ${hasCover ? "" : "justify-center"}`}>
              {post.author && <span className="inline-flex items-center gap-2.5">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest font-serif text-ivory">{post.author.trim().charAt(0).toUpperCase()}</span>
                <span className="font-medium text-charcoal/80">{post.author}</span>
              </span>}
              {post.publishedAt && <><span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" /><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time></>}
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" />
              <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />{readingMinutes(post.content)} min read</span>
            </div>
          </div>
          {hasCover && <figure>
            <RevealMedia><img src={post.coverImage} alt={post.coverAlt} fetchPriority="high" className="aspect-[16/10] w-full object-cover" /></RevealMedia>
          </figure>}
        </div>
      </header>

      <div className={`${shell} grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14 2xl:grid-cols-[minmax(0,1fr)_24rem]`}>
        <div className="min-w-0">
          {/* Reading area: a framed "paper" card with a gold accent bar, so the article stands out from the page. */}
          <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-xl shadow-forest/[.07] ring-1 ring-cream/60 ring-offset-4 ring-offset-ivory">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-forest via-[#D29A31] to-cream" />
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cream/30 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 bg-ivory/60 px-6 py-4 sm:px-10">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-forest"><Icon name="file" className="h-4 w-4 text-[#B07D22]" />Article</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-charcoal/55"><Icon name="clock" className="h-3.5 w-3.5" />{readingMinutes(post.content)} min read</span>
            </div>
          <div className="relative mx-auto max-w-[60rem] px-6 py-10 sm:px-10 sm:py-14">
            <BlogArticleContent content={post.content} />

            <footer data-reveal className="mt-14 space-y-8 border-t border-forest/10 pt-8">
              {post.tags.length > 0 && <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-charcoal/55"><Icon name="tag" className="h-4 w-4" />Tags</span>
                <ul className="flex flex-wrap gap-2" aria-label="Post tags">{post.tags.map((tag) => <li key={tag}><Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="inline-block rounded-full bg-cream/45 px-3 py-1 text-sm text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-cream">{tag}</Link></li>)}</ul>
              </div>}
              <div className="flex flex-wrap items-center justify-between gap-4 lg:hidden">
                <span className="text-sm font-medium text-charcoal/70">Share this article</span>
                <ShareLinks url={canonical} title={post.title} />
              </div>
            </footer>
          </div>
          </div>
        </div>

        <aside aria-label="More from the blog" className="min-w-0">
          {/* Sticky framed sidebar matching the article frame; its body scrolls on its own when taller than the screen. */}
          <div className="lg:sticky lg:top-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-xl shadow-forest/[.07] ring-1 ring-cream/60 ring-offset-4 ring-offset-ivory">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-cream via-[#D29A31] to-forest" />
            <div className="flex items-center gap-2 border-b border-forest/10 bg-ivory/60 px-6 py-4 text-xs font-semibold uppercase tracking-[.18em] text-forest"><Icon name="leaf" className="h-4 w-4 text-[#B07D22]" />Explore</div>
            <div className="divide-y divide-forest/10 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:[scrollbar-width:thin]">
            <section aria-label="Article tools" className="hidden p-6 lg:block">
              {headings.length > 0 && <nav aria-label="Table of contents" className="mb-6 border-b border-dashed border-forest/15 pb-6">
                <p className={railTitle}>On this page</p>
                <ol className="mt-4 border-l border-forest/15">{headings.map((heading, i) => <li key={`${heading.id}-${i}`}>
                  <a href={`#${heading.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm leading-snug text-charcoal/65 transition-colors hover:border-forest hover:text-forest">{heading.text}</a>
                </li>)}</ol>
              </nav>}
              <p className={railTitle}>Share this article</p>
              <div className="mt-4"><ShareLinks url={canonical} title={post.title} /></div>
            </section>
            {sidebarPosts.length > 0 && <section className="p-6">
              <h2 className={railTitle}>Latest articles</h2>
              <ul className="mt-5 space-y-5">{sidebarPosts.map((item) => <SidePost key={item.id} post={item} />)}</ul>
              <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest underline-offset-4 hover:underline">View all articles<Icon name="arrowRight" className="h-4 w-4" /></Link>
            </section>}
            {categories.length > 0 && <section className="p-6">
              <h2 className={railTitle}>Categories</h2>
              <ul className="mt-4 divide-y divide-forest/10">{categories.map(([name, count]) => <li key={name}>
                <Link href={`/blog?category=${encodeURIComponent(name)}`} className={`flex items-center justify-between py-2.5 text-sm transition-colors hover:text-forest ${name === post.category ? "font-medium text-forest" : "text-charcoal/75"}`}>
                  {name}<span className="rounded-full bg-cream/50 px-2.5 py-0.5 text-xs text-forest">{count}</span>
                </Link>
              </li>)}</ul>
            </section>}
            <div className="p-4">
              <section className="relative overflow-hidden rounded-3xl bg-forest p-6 text-ivory">
                <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cream/15 blur-3xl" />
                <h2 className="relative text-2xl !text-ivory">Need a vanilla supplier?</h2>
                <p className="relative mt-2 text-sm leading-6 text-ivory/80">Wholesale vanilla from Sri Lanka for importers and manufacturers.</p>
                <Link href="/contact" className={`${ctaPrimary} relative mt-5`}>Request a quote<Icon name="arrowRight" className={btnArrow} /></Link>
              </section>
            </div>
            </div>
          </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && <section className="border-t border-forest/10 bg-white/50">
        <div className={`${shell} py-14 sm:py-16`}>
          <div data-reveal className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl sm:text-4xl">Keep reading</h2>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-forest underline-offset-4 hover:underline">All articles<Icon name="arrowRight" className="h-4 w-4" /></Link>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-4">{related.map((item, i) => <li key={item.id} data-reveal style={{ "--i": i } as CSSProperties} className="min-w-0"><BlogCard post={item} /></li>)}</ul>
        </div>
      </section>}

      <div className={`${shell} py-14 sm:py-16`}>
        <CtaBanner title="Looking for a vanilla supplier?" text="Explore our products for importers and manufacturers, or tell us what your business needs.">
          <Link href="/contact" className={ctaPrimary}>Request a wholesale quote<Icon name="arrowRight" className={btnArrow} /></Link>
          <Link href="/products/vanilla-beans" className={ctaSecondary}>Explore vanilla products</Link>
        </CtaBanner>
      </div>
    </article>
  );
}
