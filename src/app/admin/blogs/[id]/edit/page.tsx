import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getBlogPosts } from "@/lib/blog";
import BlogPostEditor from "@/components/BlogPostEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit blog post", robots: { index: false, follow: false } };

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const post = (await getBlogPosts()).find((item) => item.id === id);
  if (!post) notFound();
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><BlogPostEditor initial={post} id={post.id} /></div>;
}
