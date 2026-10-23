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
    ? <img src={post.coverImage} alt={post.coverAlt} loading="lazy" className={`${className} object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.07]`} />
    : <div className={`${className} flex items-center justify-center bg-forest font-serif text-2xl text-cream/80`} style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgb(233 215 165 / 18%), transparent 55%)" }}>{site.brand}</div>;
}

export function BlogCard({ post }: { post: BlogPost }) {
  return <article data-spotlight className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1.5 hover:border-forest/20 hover:shadow-2xl hover:shadow-forest/15">
    <span aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />
    <div className="relative overflow-hidden">
      <Cover post={post} className="aspect-[16/10] w-full" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {post.category && <span className="absolute left-4 top-4 rounded-full bg-ivory/95 px-3 py-1 text-xs font-medium text-forest shadow-sm backdrop-blur">{post.category}</span>}
      <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white/90 text-forest opacity-0 shadow-lg backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><Icon name="arrowRight" className="h-4 w-4 -rotate-45" /></span>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <PostMeta post={post} className="relative" />
      <h3 className="mt-3 text-2xl leading-snug">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:underline">{post.title}</Link>
      </h3>
      {post.excerpt && <p className="relative mt-3 line-clamp-3 flex-1 text-sm leading-6 text-charcoal/70">{post.excerpt}</p>}
      <span aria-hidden="true" className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest">
        <span className="relative">Read article<span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-forest transition-transform duration-500 group-hover:scale-x-100" /></span>
        <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
      </span>
    </div>
  </article>;
}

export function FeaturedCard({ post }: { post: BlogPost }) {
  return <article data-spotlight className="group relative grid overflow-hidden rounded-[2rem] border border-forest/10 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest/15 md:grid-cols-[1.25fr_1fr]">
    <div className="relative overflow-hidden">
      <Cover post={post} className="aspect-[16/10] h-full w-full md:aspect-auto md:min-h-[26rem]" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(300px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(255_255_255/20%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
    <div className="flex flex-col justify-center p-7 sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-forest"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest/50" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-forest" /></span>{post.featured ? "Featured" : "Latest"}</span>
        {post.category && <span className="text-xs font-medium text-charcoal/55">{post.category}</span>}
      </div>
      <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus:outline-none focus-visible:underline">{post.title}</Link>
      </h2>
      {post.excerpt && <p className="mt-4 line-clamp-4 leading-7 text-charcoal/70">{post.excerpt}</p>}
      <PostMeta post={post} className="mt-5" />
      <span aria-hidden="true" className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm text-ivory shadow-lg shadow-forest/20 transition-all duration-300 group-hover:bg-charcoal group-hover:shadow-xl">Read the story<Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
    </div>
  </article>;
}
