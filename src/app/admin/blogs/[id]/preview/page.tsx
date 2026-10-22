import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getBlogPosts } from "@/lib/blog";
import BlogArticleContent from "@/components/BlogArticleContent";
import { Icon, StatusBadge } from "@/components/AdminUi";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private blog preview", robots: { index: false, follow: false, noarchive: true } };

export default async function BlogPreview({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const post = (await getBlogPosts()).find((item) => item.id === id);
  if (!post) notFound();
  return <article className="mx-auto max-w-3xl px-5 py-12">
    <div className="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-600/25 bg-amber-50 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-amber-900"><Icon name="eye" />Private preview — only admins can see this page. <StatusBadge status={post.status} /></span>
      <Link className="inline-flex items-center gap-1.5 rounded-md bg-forest px-3 py-1.5 text-ivory hover:bg-charcoal" href={`/admin/blogs/${encodeURIComponent(post.id)}/edit`}><Icon name="edit" />Edit post</Link>
    </div>
    {post.coverImage && <img src={post.coverImage} alt={post.coverAlt} className="mb-8 max-h-[28rem] w-full rounded-lg object-cover" />}
    <p className="text-sm text-charcoal/65">{post.category}{post.category && post.author ? " · " : ""}{post.author}</p>
    <h1 className="mt-3 text-5xl">{post.title}</h1>
    <p className="mt-4 text-xl leading-8 text-charcoal/75">{post.excerpt}</p>
    <BlogArticleContent content={post.content} />
  </article>;
}
