import { promises as fs } from "fs";
import path from "path";
import { Schema } from "mongoose";
import { connectDb, defineModel } from "@/lib/db";
import { cloudinaryFolders, moveLocalImage } from "@/lib/cloudinary";

export type GalleryItem = { src: string; alt: string; caption: string; category: string };
// The whole gallery is one document, so a save replaces every photo and its order atomically.
type GalleryDoc = { key: "gallery"; items: GalleryItem[] };

const itemSchema = new Schema<GalleryItem>({
  src: { type: String, required: true },
  alt: { type: String, default: "" },
  caption: { type: String, default: "" },
  category: { type: String, default: "" },
}, { _id: false });

const gallerySchema = new Schema<GalleryDoc>({
  key: { type: String, required: true, unique: true },
  items: { type: [itemSchema], default: [] },
}, { timestamps: true });

const GalleryModel = defineModel<GalleryDoc>("Gallery", gallerySchema);
const KEY = "gallery";

// Copies photos saved before MongoDB was added (data/content.json), moving local files to Cloudinary.
async function legacyGallery(): Promise<GalleryItem[]> {
  let saved: GalleryItem[] | undefined;
  try { saved = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "content.json"), "utf8")).gallery; } catch {}
  return Promise.all((saved ?? []).map(async (item) => ({ ...item, src: await moveLocalImage(item.src, cloudinaryFolders.gallery) })));
}

let seeding: Promise<GalleryDoc | null> | undefined;

export async function getGallery(): Promise<GalleryItem[]> {
  await connectDb();
  let doc = await GalleryModel.findOne({ key: KEY }).lean<GalleryDoc>();
  if (!doc) {
    seeding ??= legacyGallery()
      .then((items) => GalleryModel.findOneAndUpdate({ key: KEY }, { $setOnInsert: { key: KEY, items } }, { upsert: true, new: true }).lean<GalleryDoc>())
      .finally(() => { seeding = undefined; });
    doc = await seeding;
  }
  return (doc?.items ?? []).map(({ src, alt, caption, category }) => ({ src, alt: alt ?? "", caption: caption ?? "", category: category ?? "" }));
}

export async function saveGallery(items: GalleryItem[]) {
  await connectDb();
  await GalleryModel.updateOne({ key: KEY }, { $set: { items } }, { upsert: true });
}
