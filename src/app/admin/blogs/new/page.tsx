import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import BlogPostEditor from "@/components/BlogPostEditor";

export const metadata = { title: "New blog post", robots: { index: false, follow: false } };

export default async function NewBlogPost() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10"><BlogPostEditor initial={null} /></div>;
}
