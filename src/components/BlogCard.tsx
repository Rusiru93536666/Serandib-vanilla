import Link from "next/link";
import { readingMinutes, type BlogPost } from "@/lib/blog";
import { Icon } from "@/components/Icon";
import { site } from "@/config/site";

export const formatPostDate = (value: string | null) => value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export function PostMeta({ post, className = "" }: { post: BlogPost; className?: string }) {
  return <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/55 ${className}`}>
    {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" />
    <span className="inline-flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" />{readingMinutes(post.content)} min read</span>
  </p>;
}

function Cover({ post, className }: { post: BlogPost; className: string }) {
  return post.coverImage
    ? <img src={post.coverImage} alt={post.coverAlt} loading="lazy" className={`${className} object-cover transition-transform duration-500 group-hover:scale-105`} />
    : <div className={`${className} flex items-center justify-center bg-forest font-serif text-2xl text-cream/80`} style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgb(233 215 165 / 18%), transparent 55%)" }}>{site.brand}</div>;
}

export function BlogCard({ post }: { post: BlogPost }) {
  return <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10">
    <div className="relative overflow-hidden">
      <Cover post={post} className="aspect-[16/10] w-full" />
      {post.category && <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 text-xs font-medium text-forest shadow-sm backdrop-blur">{post.category}</span>}
    </div>
    <div className="flex flex-1 flex-col p-6">
      <PostMeta post={post} />
      <h3 className="mt-3 text-2xl leading-snug">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:underline">{post.title}</Link>
      </h3>
      {post.excerpt && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-charcoal/70">{post.excerpt}</p>}
      <span aria-hidden="true" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest">Read article<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </div>
  </article>;
}

export function FeaturedCard({ post }: { post: BlogPost }) {
  return <article className="group relative grid overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-forest/10 md:grid-cols-[1.25fr_1fr]">
    <div className="overflow-hidden"><Cover post={post} className="aspect-[16/10] h-full w-full md:aspect-auto md:min-h-[24rem]" /></div>
    <div className="flex flex-col justify-center p-7 sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-cream/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-forest">{post.featured ? "Featured" : "Latest"}</span>
        {post.category && <span className="text-xs font-medium text-charcoal/55">{post.category}</span>}
      </div>
      <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:underline">{post.title}</Link>
      </h2>
      {post.excerpt && <p className="mt-4 line-clamp-4 leading-7 text-charcoal/70">{post.excerpt}</p>}
      <PostMeta post={post} className="mt-5" />
      <span aria-hidden="true" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm text-ivory transition-colors group-hover:bg-charcoal">Read the story<Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </div>
  </article>;
}
