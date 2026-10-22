import { z } from "zod";
import { readFileContent, type Post } from "@/lib/store";
import { safeMediaUrl } from "@/lib/media";
import { cloudinaryFolders, moveLocalImage } from "@/lib/cloudinary";
import { countPostDocs, insertPostDocs, loadPostDocs, writePostDocs } from "@/lib/blog-db";

export type BlogNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: BlogNode[];
};

export type BlogPost = Post & {
  id: string;
  previousSlugs: string[];
  status: "draft" | "published" | "scheduled";
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  content: BlogNode;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  featured: boolean;
};

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens for the URL slug.").max(80);
const dateSchema = z.string().datetime({ offset: true }).nullable();

export const blogPostSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(150),
  excerpt: z.string().trim().max(500),
  status: z.enum(["draft", "published", "scheduled"]),
  author: z.string().trim().min(1).max(100),
  category: z.string().trim().max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  coverImage: z.string().max(2048).refine((v) => !v || safeMediaUrl(v), "Cover image must be an uploaded image or a secure HTTPS URL."),
  coverAlt: z.string().trim().max(300),
  content: z.unknown(),
  publishedAt: dateSchema,
  seoTitle: z.string().trim().max(160),
  metaDescription: z.string().trim().max(300),
  canonicalUrl: z.string().max(2048).refine((v) => !v || isHttpsUrl(v), "Canonical URL must use HTTPS."),
  ogImage: z.string().max(2048).refine((v) => !v || safeMediaUrl(v), "Open Graph image must be an uploaded image or a secure HTTPS URL."),
  featured: z.boolean(),
}).superRefine((post, context) => {
  if (post.coverImage && !post.coverAlt) context.addIssue({ code: "custom", path: ["coverAlt"], message: "Add descriptive alt text for the cover image." });
});

export async function parseBlogPostRequest(req: Request): Promise<Omit<BlogPost, "id" | "previousSlugs" | "createdAt" | "updatedAt">> {
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > 160_000) throw new Error("Post content exceeds the 160 KB limit.");
  let input: unknown;
  try { input = JSON.parse(raw); } catch { throw new Error("Request body must be valid JSON."); }
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  let content;
  try { content = sanitizeBlogDocument(parsed.data.content); } catch (error) { throw new Error(error instanceof Error ? error.message : "Post content is invalid."); }
  if (parsed.data.status === "scheduled" && (!parsed.data.publishedAt || Date.parse(parsed.data.publishedAt) <= Date.now())) {
    throw new Error("Scheduled posts need a publication time in the future.");
  }
  const now = new Date().toISOString();
  const publishedAt = parsed.data.status === "published" ? (parsed.data.publishedAt && Date.parse(parsed.data.publishedAt) <= Date.now() ? parsed.data.publishedAt : now) : parsed.data.publishedAt;
  return { ...parsed.data, content, publishedAt, date: (publishedAt ?? now).slice(0, 10), body: JSON.stringify(content), published: parsed.data.status === "published" };
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}

const nodeTypes = new Set([
  "doc", "paragraph", "heading", "text", "hardBreak", "horizontalRule",
  "bulletList", "orderedList", "listItem", "blockquote", "codeBlock",
  "image", "youtube", "table", "tableRow", "tableCell", "tableHeader",
  "blogFigure", "blogGallery", "blogChart", "blogSection",
]);
const markTypes = new Set(["bold", "italic", "strike", "code", "underline", "link"]);

export function sanitizeBlogDocument(input: unknown): BlogNode {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Post content must be a rich-text document.");
  let count = 0;
  const clean = (raw: unknown, depth: number): BlogNode => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || depth > 24 || ++count > 1200) throw new Error("Post content is invalid or too large.");
    const node = raw as Record<string, unknown>;
    if (typeof node.type !== "string" || !nodeTypes.has(node.type)) throw new Error("Post contains an unsupported content block.");
    const result: BlogNode = { type: node.type };
    if (node.type === "text") {
      if (typeof node.text !== "string" || node.text.length > 30000) throw new Error("Text block is too long.");
      result.text = node.text;
    }
    if (node.marks !== undefined) {
      if (!Array.isArray(node.marks) || node.marks.length > 12) throw new Error("Text formatting is invalid.");
      result.marks = node.marks.map((rawMark) => {
        if (!rawMark || typeof rawMark !== "object") throw new Error("Text formatting is invalid.");
        const mark = rawMark as Record<string, unknown>;
        if (typeof mark.type !== "string" || !markTypes.has(mark.type)) throw new Error("Unsupported text formatting.");
        if (mark.type === "link") {
          const href = (mark.attrs as Record<string, unknown> | undefined)?.href;
          if (typeof href !== "string" || !safeLink(href)) throw new Error("Links must use HTTPS or mailto.");
          return { type: "link", attrs: { href } };
        }
        return { type: mark.type };
      });
    }
    if (node.attrs !== undefined) {
      if (!node.attrs || typeof node.attrs !== "object" || Array.isArray(node.attrs)) throw new Error("Block attributes are invalid.");
      const attrs = node.attrs as Record<string, unknown>;
      if (node.type === "heading") result.attrs = { level: attrs.level === 2 || attrs.level === 3 ? attrs.level : 2 };
      if (node.type === "orderedList") result.attrs = { start: Number.isSafeInteger(attrs.start) && Number(attrs.start) > 0 ? Number(attrs.start) : 1 };
      if (node.type === "image" || node.type === "blogFigure") {
        if (typeof attrs.src !== "string" || !safeMediaUrl(attrs.src)) throw new Error("Images must use an uploaded image or a secure HTTPS URL.");
        result.attrs = { src: attrs.src, alt: boundedString(attrs.alt, 300), ...(node.type === "blogFigure" ? { caption: boundedString(attrs.caption, 500) } : { title: boundedString(attrs.title, 300) }) };
      }
      if (node.type === "youtube") {
        if (typeof attrs.src !== "string" || !isSafeYoutubeUrl(attrs.src)) throw new Error("Only YouTube video URLs can be embedded.");
        if (attrs.start !== undefined && (!Number.isSafeInteger(attrs.start) || Number(attrs.start) < 0 || Number(attrs.start) > 604800)) throw new Error("YouTube start time is invalid.");
        result.attrs = { src: attrs.src, start: attrs.start ?? 0 };
      }
      if (node.type === "blogGallery") {
        if (!Array.isArray(attrs.images) || attrs.images.length < 1 || attrs.images.length > 12) throw new Error("A gallery needs 1 to 12 images.");
        result.attrs = { images: attrs.images.map((image) => {
          if (!image || typeof image !== "object") throw new Error("Gallery image is invalid.");
          const item = image as Record<string, unknown>;
          if (typeof item.src !== "string" || !safeMediaUrl(item.src)) throw new Error("Gallery images must use an uploaded image or a secure HTTPS URL.");
          return { src: item.src, alt: boundedString(item.alt, 300), caption: boundedString(item.caption, 300) };
        }) };
      }
      if (node.type === "blogChart") {
        const chartType = attrs.chartType;
        const config = attrs.config;
        if (!["bar", "line", "doughnut"].includes(String(chartType)) || !config || typeof config !== "object" || Array.isArray(config)) throw new Error("Chart settings are invalid.");
        const data = config as Record<string, unknown>;
        if (!Array.isArray(data.labels) || data.labels.length < 1 || data.labels.length > 12 || !Array.isArray(data.datasets) || data.datasets.length < 1 || data.datasets.length > 4) throw new Error("Charts support up to 12 labels and 4 datasets.");
        const labels = data.labels.map((x) => boundedString(x, 40));
        const datasets = data.datasets.map((rawSet) => {
          if (!rawSet || typeof rawSet !== "object") throw new Error("Chart dataset is invalid.");
          const set = rawSet as Record<string, unknown>;
          if (!Array.isArray(set.values) || set.values.length !== labels.length || set.values.some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000_000)) throw new Error("Chart values must be non-negative numbers matching the labels.");
          return { label: boundedString(set.label, 60), values: set.values as number[] };
        });
        result.attrs = { chartType, config: { title: boundedString(data.title, 120), labels, datasets } };
      }
      if (node.type === "blogSection") result.attrs = { title: boundedString(attrs.title, 150) };
      if (node.type === "heading" && attrs.level !== undefined && ![2, 3].includes(Number(attrs.level))) throw new Error("Only level 2 or 3 headings are allowed in post content.");
    }
    if (node.content !== undefined) {
      if (!Array.isArray(node.content)) throw new Error("Post content children are invalid.");
      result.content = node.content.map((child) => clean(child, depth + 1));
    }
    return result;
  };
  const doc = clean(input, 0);
  if (doc.type !== "doc") throw new Error("Post content must start with a document.");
  return doc;
}

function boundedString(value: unknown, max: number) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > max) throw new Error(`Text must be ${max} characters or fewer.`);
  return value;
}

function safeLink(value: string) {
  return value.startsWith("mailto:") && value.length < 255 || isHttpsUrl(value);
}

function isSafeYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && ["youtube.com", "www.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function legacyPost(post: Post, index: number): BlogPost {
  const old = post as Post & Partial<BlogPost>;
  let content: BlogNode;
  try {
    content = sanitizeBlogDocument(old.content ?? JSON.parse(old.body));
  } catch {
    content = { type: "doc", content: old.body ? old.body.split(/\n\s*\n/).map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })) : [] };
  }
  const publishedAt = old.publishedAt ?? (old.date ? new Date(`${old.date}T00:00:00.000Z`).toISOString() : null);
  return {
    ...post,
    id: old.id ?? `legacy-${index}-${post.slug}`,
    previousSlugs: old.previousSlugs ?? [],
    status: old.status ?? (post.published ? "published" : "draft"),
    author: old.author ?? "",
    category: old.category ?? "",
    tags: old.tags ?? [],
    coverImage: old.coverImage ?? "",
    coverAlt: old.coverAlt ?? "",
    content,
    createdAt: old.createdAt ?? publishedAt ?? new Date(0).toISOString(),
    updatedAt: old.updatedAt ?? publishedAt ?? new Date(0).toISOString(),
    publishedAt,
    seoTitle: old.seoTitle ?? "",
    metaDescription: old.metaDescription ?? "",
    canonicalUrl: old.canonicalUrl ?? "",
    ogImage: old.ogImage ?? "",
    featured: old.featured ?? false,
  };
}

const normalize = (posts: BlogPost[]) => posts.map((post) => post.status === "scheduled" && isPublicPost(post) ? { ...post, status: "published" as const, published: true } : post);

async function filePosts(): Promise<BlogPost[]> {
  const { blogs } = await readFileContent();
  return blogs.map(legacyPost);
}

// Moves a post's local images (cover, Open Graph, and images inside the article) to Cloudinary.
async function moveImages(post: BlogPost): Promise<BlogPost> {
  const move = (src: unknown) => typeof src === "string" ? moveLocalImage(src, cloudinaryFolders.blog) : Promise.resolve(src);
  const walk = async (node: BlogNode): Promise<BlogNode> => {
    const attrs = node.attrs && { ...node.attrs };
    if (attrs && "src" in attrs) attrs.src = await move(attrs.src);
    if (attrs && Array.isArray(attrs.images)) attrs.images = await Promise.all(attrs.images.map(async (img: { src: string }) => ({ ...img, src: await move(img.src) })));
    return { ...node, ...(attrs && { attrs }), ...(node.content && { content: await Promise.all(node.content.map(walk)) }) };
  };
  return { ...post, coverImage: String(await move(post.coverImage)), ogImage: String(await move(post.ogImage)), content: await walk(post.content) };
}

// Copies posts saved before MongoDB was added (data/content.json) the first time the collection is empty.
let seeding: Promise<void> | undefined;
async function seedIfEmpty() {
  if (await countPostDocs() > 0) return;
  seeding ??= filePosts().then((posts) => Promise.all(posts.map(moveImages))).then(insertPostDocs).finally(() => { seeding = undefined; });
  await seeding;
}

async function loadPosts() {
  await seedIfEmpty();
  return normalize(await loadPostDocs());
}

export async function getBlogPosts() {
  try {
    return await loadPosts();
  } catch (e) {
    console.error("Could not load blog posts from MongoDB; showing the file copy.", e);
    return normalize(await filePosts());
  }
}

// Saves run one at a time so concurrent edits cannot overwrite each other.
let writeQueue: Promise<void> = Promise.resolve();

export async function updateBlogPosts(update: (posts: BlogPost[]) => BlogPost[]) {
  const write = writeQueue.then(async () => {
    const current = await loadPosts();
    await writePostDocs(current, await Promise.all(update(current).map(moveImages)));
  });
  writeQueue = write.catch(() => {});
  await write;
}

export function isPublicPost(post: BlogPost, now = Date.now()) {
  if (post.status === "draft") return false;
  if (!post.publishedAt) return post.status === "published";
  const timestamp = Date.parse(post.publishedAt);
  return Number.isFinite(timestamp) && timestamp <= now;
}

export function readingMinutes(content: BlogNode) {
  const text = (node: BlogNode): string => (node.text ?? "") + " " + (node.content ?? []).map(text).join(" ");
  return Math.max(1, Math.round(text(content).trim().split(/\s+/).filter(Boolean).length / 220));
}

export function publicStatus(post: BlogPost, now = Date.now()): BlogPost["status"] {
  return post.status === "scheduled" && isPublicPost(post, now) ? "published" : post.status;
}
