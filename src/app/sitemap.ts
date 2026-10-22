import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getContent } from "@/lib/store";
import { getBlogPosts, isPublicPost } from "@/lib/blog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const blogPosts = (await getBlogPosts()).filter((post) => isPublicPost(post));
  const paths: MetadataRoute.Sitemap = ["", "/products", "/about", "/quality", "/gallery", "/blog", "/contact", ...c.products.map((p) => `/products/${p.slug}`)].map((path) => ({ url: `${site.url}${path}` }));
  return [...paths, ...blogPosts.map((post) => ({
    url: post.canonicalUrl || `${site.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }))];
}
