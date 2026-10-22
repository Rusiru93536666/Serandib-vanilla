import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getBlogPosts } from "@/lib/blog";
import AdminBlogList from "@/components/AdminBlogList";
import { Icon } from "@/components/AdminUi";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog management", robots: { index: false, follow: false } };

export default async function AdminBlogs() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await getBlogPosts();
  return <div className="mx-auto max-w-5xl px-5 py-10 sm:py-12">
    <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-charcoal/65 hover:text-forest"><Icon name="arrowLeft" />Main admin</Link>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-4xl">Blog posts</h1><p className="mt-2 text-sm text-charcoal/65">Manage drafts, scheduled articles, and published posts.</p></div>
      <Link href="/admin/blogs/new" className="inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-ivory shadow-sm hover:bg-charcoal"><Icon name="plus" />New post</Link>
    </div>
    <AdminBlogList initialPosts={posts} />
  </div>;
}
