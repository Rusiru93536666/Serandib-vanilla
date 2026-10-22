import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { saveKey } from "@/lib/store";
import { safeMediaUrl } from "@/lib/media";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers and hyphens").max(80);
const sec = z.object({
  h: z.string().trim().min(1, "Every section needs a heading").max(150),
  p: z.string().max(4000),
  items: z.array(z.string().max(300)).max(30).optional(),
  image: z.string().max(2048).refine((v) => !v || safeMediaUrl(v), "Section images must be uploaded images or secure HTTPS URLs.").optional(),
  imageAlt: z.string().trim().max(300).optional(),
});
const prod = z.object({ slug, name: z.string().trim().min(1).max(100), short: z.string().max(300), intro: z.string().max(2000), uses: z.array(z.string().max(200)).max(20), note: z.string().max(500), imageNote: z.string().max(300), specs: z.array(z.tuple([z.string().max(100), z.string().max(300)])).max(30), packaging: z.string().max(2000),
  images: z.array(z.object({ src: z.string().max(2048).refine(safeMediaUrl, "Product images must be uploaded images or secure HTTPS URLs."), alt: z.string().trim().max(300) })).max(8).optional() });
const photo = z.object({
  src: z.string().max(2048).refine(safeMediaUrl, "Gallery images must be uploaded images or secure HTTPS URLs."),
  alt: z.string().trim().max(300),
  caption: z.string().trim().max(300),
  category: z.string().trim().max(60),
});
const text = (max: number) => z.string().trim().max(max);
const image = z.string().max(2048).refine((v) => !v || safeMediaUrl(v), "Images must be uploaded images or secure HTTPS URLs.");
const home = z.object({
  hero: z.object({ eyebrow: text(80), title: text(150).min(1, "The hero needs a title"), text: text(600), image, imageAlt: text(300), primaryLabel: text(40), secondaryLabel: text(40) }),
  products: z.object({ title: text(120), text: text(400) }),
  why: z.object({ title: text(150), text: text(3000), image, imageAlt: text(300) }),
  process: z.object({ title: text(150), text: text(400), steps: z.array(z.object({ title: text(80).min(1, "Every step needs a title"), text: text(400) })).max(8) }),
  applications: z.object({ title: text(120), items: z.array(text(60).min(1)).max(16) }),
  highlights: z.array(z.object({ title: text(120).min(1, "Every card needs a title"), text: text(500), linkLabel: text(60), linkHref: z.string().regex(/^\/[a-z0-9/-]*$/, "Card links must be site pages, e.g. /quality") })).max(4),
  cta: z.object({ title: text(150), text: text(400), buttonLabel: text(40) }),
});
const schemas = { home, products: z.array(prod).min(1).max(20), story: z.array(sec).max(30), quality: z.array(sec).max(30), gallery: z.array(photo).max(200) };

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { key?: unknown; value?: unknown };
  const keyResult = z.enum(["home", "products", "story", "quality", "gallery"]).safeParse(body.key);
  if (!keyResult.success) return NextResponse.json({ message: "Unknown content type." }, { status: 400 });
  const key = keyResult.data;
  const r = schemas[key].safeParse(body.value);
  if (!r.success) return NextResponse.json({ message: r.error.issues[0].message + (r.error.issues[0].path.length ? ` (${r.error.issues[0].path.join(" › ")})` : "") }, { status: 422 });
  const slugs = Array.isArray(r.data) ? (r.data as { slug?: string }[]).map((x) => x.slug).filter(Boolean) : [];
  if (new Set(slugs).size !== slugs.length) return NextResponse.json({ message: "Slugs must be unique." }, { status: 422 });
  try {
    await saveKey(key, r.data as never);
  } catch (e) {
    console.error(`Saving ${key} failed`, e);
    return NextResponse.json({ message: "Could not save to the database. Check MONGODB_URI and try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
