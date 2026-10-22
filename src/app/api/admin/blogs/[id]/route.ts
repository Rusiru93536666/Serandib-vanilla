import { NextResponse } from "next/server";
import { parseBlogPostRequest, updateBlogPosts, type BlogPost } from "@/lib/blog";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  const { id } = await params;
  let values: Awaited<ReturnType<typeof parseBlogPostRequest>>;
  try { values = await parseBlogPostRequest(req); } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid post." }, { status: 422 });
  }
  let updated: BlogPost | null = null;
  let conflict = false;
  try {
    await updateBlogPosts((all) => {
      const current = all.find((post) => post.id === id);
      if (!current) return all;
      conflict = all.some((post) => post.id !== id && (post.slug === values.slug || post.previousSlugs.includes(values.slug)));
      if (conflict) return all;
      const nextPost: BlogPost = {
        ...current,
        ...values,
        id,
        previousSlugs: current.slug === values.slug ? current.previousSlugs : [...new Set([...current.previousSlugs.filter((slug) => slug !== values.slug), current.slug])],
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };
      updated = nextPost;
      return all.map((post) => post.id === id ? nextPost : post);
    });
  } catch (e) {
    console.error("Saving blog posts failed", e);
    return NextResponse.json({ message: "Could not save to the database. Please try again." }, { status: 500 });
  }
  if (!updated) return NextResponse.json({ message: "Post not found." }, { status: 404 });
  if (conflict) return NextResponse.json({ message: "That URL slug is already in use." }, { status: 409 });
  return NextResponse.json({ post: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  const { id } = await params;
  let removed = false;
  try {
    await updateBlogPosts((posts) => {
      removed = posts.some((post) => post.id === id);
      return posts.filter((post) => post.id !== id);
    });
  } catch (e) {
    console.error("Saving blog posts failed", e);
    return NextResponse.json({ message: "Could not save to the database. Please try again." }, { status: 500 });
  }
  return removed ? NextResponse.json({ ok: true }) : NextResponse.json({ message: "Post not found." }, { status: 404 });
}
