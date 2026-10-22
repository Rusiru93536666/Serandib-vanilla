import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getBlogPosts, parseBlogPostRequest, updateBlogPosts, type BlogPost } from "@/lib/blog";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  return NextResponse.json({ posts: await getBlogPosts() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  let values;
  try { values = await parseBlogPostRequest(req); } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid post." }, { status: 422 });
  }
  const now = new Date().toISOString();
  const post: BlogPost = { ...values, id: randomUUID(), previousSlugs: [], createdAt: now, updatedAt: now };
  let conflict = false;
  try {
    await updateBlogPosts((posts) => {
      conflict = posts.some((existing) => existing.slug === post.slug || existing.previousSlugs.includes(post.slug));
      return conflict ? posts : [post, ...posts];
    });
  } catch (e) {
    console.error("Saving blog posts failed", e);
    return NextResponse.json({ message: "Could not save to the database. Please try again." }, { status: 500 });
  }
  if (conflict) return NextResponse.json({ message: "That URL slug is already in use." }, { status: 409 });
  return NextResponse.json({ post }, { status: 201 });
}
