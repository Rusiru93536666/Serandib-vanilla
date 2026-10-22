"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { Icon, StatusBadge, formatDate } from "@/components/AdminUi";

const input = "rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";
const filters = [["all", "All"], ["published", "Published"], ["draft", "Drafts"], ["scheduled", "Scheduled"]] as const;

export default function AdminBlogList({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const visible = useMemo(() => posts.filter((post) => {
    const matchesStatus = filter === "all" || post.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [post.title, post.slug, post.category, post.author, ...post.tags].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  }), [filter, posts, search]);

  async function duplicate(post: BlogPost) {
    setBusy(post.id);
    setError("");
    try {
      const copy = {
        slug: `${post.slug}-copy`,
        title: `${post.title} (copy)`,
        excerpt: post.excerpt,
        status: "draft",
        author: post.author,
        category: post.category,
        tags: post.tags,
        coverImage: post.coverImage,
        coverAlt: post.coverAlt,
        content: post.content,
        publishedAt: null,
        seoTitle: post.seoTitle,
        metaDescription: post.metaDescription,
        canonicalUrl: "",
        ogImage: post.ogImage,
        featured: false,
      };
      const response = await fetch("/api/admin/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(copy) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not duplicate post.");
      setPosts((existing) => [data.post, ...existing]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not duplicate post.");
    } finally {
      setBusy("");
    }
  }

  async function remove(post: BlogPost) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(post.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/blogs/${encodeURIComponent(post.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not delete post.");
      setPosts((existing) => existing.filter((item) => item.id !== post.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete post.");
    } finally {
      setBusy("");
    }
  }

  const counts = { all: posts.length, published: 0, draft: 0, scheduled: 0 } as Record<string, number>;
  posts.forEach((post) => { counts[post.status] += 1; });
  const action = "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-charcoal/75 hover:bg-forest/5 hover:text-forest disabled:opacity-50";

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-lg bg-forest/5 p-1">
          {filters.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${filter === value ? "bg-white text-forest shadow-sm" : "text-charcoal/65 hover:text-forest"}`}>
            {label}<span className={`rounded-full px-1.5 text-xs tabular-nums ${filter === value ? "bg-forest text-ivory" : "bg-charcoal/10"}`}>{counts[value]}</span>
          </button>)}
        </div>
        <label className="relative lg:w-80">
          <span className="sr-only">Search posts</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-charcoal/40"><Icon name="search" /></span>
          <input className={`${input} w-full pl-9`} type="search" placeholder="Search title, slug, author, tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {visible.length === 0 ? <div className="rounded-xl border border-dashed border-forest/30 bg-white/60 px-6 py-14 text-center">
        <p className="font-serif text-2xl text-forest">{posts.length === 0 ? "No posts yet" : "Nothing matches"}</p>
        <p className="mt-2 text-sm text-charcoal/65">{posts.length === 0 ? "Create your first blog post to get started." : "Try a different search term or status filter."}</p>
        {posts.length === 0
          ? <Link href="/admin/blogs/new" className="mt-5 inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm text-ivory hover:bg-charcoal"><Icon name="plus" />Create a post</Link>
          : <button type="button" className="mt-5 text-sm text-forest underline underline-offset-4" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</button>}
      </div> : (
        <ul className="divide-y divide-forest/10 overflow-hidden rounded-xl border border-forest/15 bg-white shadow-sm">
          {visible.map((post) => {
            const editHref = `/admin/blogs/${encodeURIComponent(post.id)}/edit`;
            return <li key={post.id} className="group grid gap-4 p-4 transition-colors hover:bg-ivory/60 sm:grid-cols-[8.5rem_1fr] sm:p-5">
              <Link href={editHref} tabIndex={-1} aria-hidden="true" className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-cream/30 text-charcoal/35 ring-1 ring-forest/10">
                {post.coverImage ? <img src={post.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <Icon name="image" className="h-7 w-7" />}
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
                  <StatusBadge status={post.status} />
                  {post.featured && <span className="inline-flex items-center gap-1 text-amber-700"><Icon name="star" className="h-3.5 w-3.5" />Featured</span>}
                  {post.category && <span>{post.category}</span>}
                </div>
                <h2 className="mt-2 truncate text-xl sm:text-2xl"><Link href={editHref} className="hover:underline underline-offset-4">{post.title || "Untitled post"}</Link></h2>
                {post.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-6 text-charcoal/70">{post.excerpt}</p>}
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-charcoal/55">
                  <span>By {post.author || "—"}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="calendar" className="h-3.5 w-3.5" />{post.publishedAt ? `${post.status === "scheduled" ? "Scheduled for" : "Published"} ${formatDate(post.publishedAt)}` : "Not published"}</span>
                  <span className="truncate font-mono">/blog/{post.slug}</span>
                </p>
                <div className="-ml-2.5 mt-3 flex flex-wrap items-center gap-1">
                  <Link className={`${action} font-medium text-forest`} href={editHref}><Icon name="edit" />Edit</Link>
                  <Link className={action} href={`/admin/blogs/${encodeURIComponent(post.id)}/preview`} target="_blank"><Icon name="eye" />Preview</Link>
                  <button type="button" className={action} disabled={!!busy} onClick={() => void duplicate(post)}><Icon name="copy" />{busy === post.id ? "Working…" : "Duplicate"}</button>
                  {post.status === "published" && <Link className={action} href={`/blog/${encodeURIComponent(post.slug)}`} target="_blank"><Icon name="external" />Public page</Link>}
                  <button type="button" className={`${action} text-red-700 hover:bg-red-50 hover:text-red-800 sm:ml-auto`} disabled={!!busy} onClick={() => void remove(post)}><Icon name="trash" />Delete</button>
                </div>
              </div>
            </li>;
          })}
        </ul>
      )}
    </div>
  );
}
