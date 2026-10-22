import { promises as fs } from "fs";
import path from "path";
import { products as defaultProducts, type Product } from "@/config/site";
import { storyDefault, qualityDefault, withHomeDefaults, type Section, type HomeContent } from "./defaults";
import { getHome, saveHome } from "./home";
import { getProducts, saveProducts } from "./products";
import { getSections, saveSections } from "./sections";
import { getGallery, saveGallery, type GalleryItem } from "./gallery";
import { cloudinaryFolders, moveLocalImagesDeep, type CloudinaryDest } from "./cloudinary";

export type Post = { slug: string; title: string; excerpt: string; body: string; date: string; published: boolean };
export type { GalleryItem };
export type Content = { home: HomeContent; products: Product[]; story: Section[]; quality: Section[]; gallery: GalleryItem[]; blogs: Post[] };
export type Key = keyof Content;
// All site content lives in MongoDB with images on Cloudinary (blog posts: lib/blog.ts).
// data/content.json is the original file copy: it seeds the database once and is the fallback if MongoDB is unreachable.
const file = path.join(process.cwd(), "data", "content.json");

export async function readFileContent(): Promise<Content> {
  let s: Partial<Content> = {};
  try { s = JSON.parse(await fs.readFile(file, "utf8")); } catch {}
  return { home: withHomeDefaults(s.home), products: s.products ?? defaultProducts, story: s.story ?? storyDefault, quality: s.quality ?? qualityDefault, gallery: s.gallery ?? [], blogs: s.blogs ?? [] };
}
// Falls back to the file copy so pages keep working if MongoDB is unreachable.
async function fromDb<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (e) {
    console.error(`Could not load ${label} from MongoDB; showing the file copy.`, e);
    return fallback;
  }
}

export async function getContent(): Promise<Content> {
  const content = await readFileContent();
  const [home, products, story, quality, gallery] = await Promise.all([
    fromDb("home page", getHome, content.home),
    fromDb("products", getProducts, content.products),
    fromDb("our story", () => getSections("story"), content.story),
    fromDb("quality", () => getSections("quality"), content.quality),
    fromDb("gallery", getGallery, content.gallery),
  ]);
  return { ...content, home, products, story, quality, gallery };
}

export async function saveKey<K extends Key>(key: K, input: Content[K]) {
  const value = key in cloudinaryFolders ? await moveLocalImagesDeep(input, cloudinaryFolders[key as CloudinaryDest]) : input;
  if (key === "home") return saveHome(value as HomeContent);
  if (key === "products") return saveProducts(value as Product[]);
  if (key === "story" || key === "quality") return saveSections(key, value as Section[]);
  if (key === "gallery") return saveGallery(value as GalleryItem[]);
  await updateContent((cur) => ({ ...cur, [key]: value }));
}

let writeQueue: Promise<void> = Promise.resolve();

export async function updateContent(update: (content: Content) => Content) {
  const write = writeQueue.then(async () => {
    const next = update(await readFileContent());
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2));
    await fs.rename(tmp, file);
  });
  writeQueue = write.catch(() => {});
  await write;
}
