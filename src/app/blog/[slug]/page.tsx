import Link from "next/link";
import type { CSSProperties } from "react";
import { CtaBanner, RevealMedia, btnArrow, ctaPrimary, ctaSecondary } from "@/components/PageMotion";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPosts, isPublicPost, readingMinutes, type BlogPost } from "@/lib/blog";
import { site } from "@/config/site";
import BlogArticleContent from "@/components/BlogArticleContent";
import { BlogCard, formatPostDate } from "@/components/BlogCard";
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

function relatedPosts(current: BlogPost, all: BlogPost[]) {
  return all.filter((post) => post.id !== current.id && isPublicPost(post))
    .map((post) => ({ post, score: Number(!!current.category && post.category === current.category) + post.tags.filter((tag) => current.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score || (b.post.publishedAt ?? "").localeCompare(a.post.publishedAt ?? ""))
    .slice(0, 3).map(({ post }) => post);
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await find(slug);
  if (!post) notFound();
  if (post.slug !== slug) redirect(`/blog/${post.slug}`);
  const others = await getBlogPosts();
  const related = relatedPosts(post, others);
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
      <header className="relative overflow-hidden bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="blob absolute -left-32 top-0 h-80 w-80 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-10 text-center sm:pt-14">
          <nav aria-label="Breadcrumb" className="rise flex items-center justify-center gap-2 text-sm text-charcoal/55">
            <Link href="/blog" className="inline-flex items-center gap-1.5 hover:text-forest"><Icon name="arrowLeft" className="h-4 w-4" />All articles</Link>
            {post.category && <><span aria-hidden="true">/</span><Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-forest">{post.category}</Link></>}
          </nav>
          <h1 style={{ animationDelay: ".1s" }} className="rise mt-6 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">{post.title}</h1>
          {post.excerpt && <p style={{ animationDelay: ".2s" }} className="rise mx-auto mt-6 max-w-2xl text-lg leading-8 text-charcoal/70 sm:text-xl">{post.excerpt}</p>}
          <div style={{ animationDelay: ".3s" }} className="rise mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-charcoal/60">
            {post.author && <span className="inline-flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-forest font-serif text-ivory">{post.author.trim().charAt(0).toUpperCase()}</span>
              <span className="font-medium text-charcoal/80">{post.author}</span>
            </span>}
            {post.publishedAt && <><span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" /><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time></>}
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" />
            <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="h-4 w-4" />{readingMinutes(post.content)} min read</span>
          </div>
        </div>
      </header>

      {post.coverImage && <figure className="mx-auto max-w-5xl px-5">
        <RevealMedia><img src={post.coverImage} alt={post.coverAlt} fetchPriority="high" className="max-h-[36rem] w-full object-cover" /></RevealMedia>
      </figure>}

      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <BlogArticleContent content={post.content} />

        <footer data-reveal className="mt-14 space-y-8 border-t border-forest/10 pt-8">
          {post.tags.length > 0 && <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-charcoal/55"><Icon name="tag" className="h-4 w-4" />Tags</span>
            <ul className="flex flex-wrap gap-2" aria-label="Post tags">{post.tags.map((tag) => <li key={tag}><Link href={`/blog?tag=${encodeURIComponent(tag)}`} className="inline-block rounded-full bg-cream/45 px-3 py-1 text-sm text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-cream">{tag}</Link></li>)}</ul>
          </div>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-medium text-charcoal/70">Share this article</span>
            <ShareLinks url={canonical} title={post.title} />
          </div>
        </footer>

        <div className="mt-14">
          <CtaBanner title="Looking for a vanilla supplier?" text="Explore our products for importers and manufacturers, or tell us what your business needs.">
            <Link href="/contact" className={ctaPrimary}>Request a wholesale quote<Icon name="arrowRight" className={btnArrow} /></Link>
            <Link href="/products/vanilla-beans" className={ctaSecondary}>Explore vanilla products</Link>
          </CtaBanner>
        </div>
      </div>

      {related.length > 0 && <section className="border-t border-forest/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl sm:text-4xl">Keep reading</h2>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline underline-offset-4">All articles<Icon name="arrowRight" className="h-4 w-4" /></Link>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">{related.map((item, i) => <li key={item.id} data-reveal style={{ "--i": i } as CSSProperties} className="min-w-0"><BlogCard post={item} /></li>)}</ul>
        </div>
      </section>}
    </article>
  );
}
