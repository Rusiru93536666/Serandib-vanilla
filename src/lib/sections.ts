import { promises as fs } from "fs";
import path from "path";
import { Schema } from "mongoose";
import { storyDefault, qualityDefault, type Section } from "@/lib/defaults";
import { connectDb, defineModel } from "@/lib/db";
import { cloudinaryFolders, moveLocalImage } from "@/lib/cloudinary";

// Section-based pages (Our Story, Quality). One document per page, so a save replaces all sections atomically.
export type SectionPage = "story" | "quality";
type PageDoc = { page: SectionPage; sections: Section[] };

const defaults: Record<SectionPage, Section[]> = { story: storyDefault, quality: qualityDefault };

const sectionSchema = new Schema<Section>({
  h: { type: String, required: true },
  p: { type: String, default: "" },
  items: { type: [String], default: undefined },
  image: { type: String, default: undefined },
  imageAlt: { type: String, default: undefined },
}, { _id: false });

const pageSchema = new Schema<PageDoc>({
  page: { type: String, required: true, unique: true },
  sections: { type: [sectionSchema], default: [] },
}, { timestamps: true });

const PageModel = defineModel<PageDoc>("Page", pageSchema);

const toSection = (s: Section): Section => ({
  h: s.h, p: s.p ?? "",
  ...(s.items?.length ? { items: s.items } : {}),
  ...(s.image ? { image: s.image, imageAlt: s.imageAlt ?? "" } : {}),
});

// Copies sections saved before MongoDB was added (data/content.json), moving their local photos to Cloudinary.
async function legacySections(page: SectionPage): Promise<Section[]> {
  let saved: Section[] | undefined;
  try { saved = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "content.json"), "utf8"))[page]; } catch {}
  return Promise.all((saved ?? defaults[page]).map(async (s) => (s.image ? { ...s, image: await moveLocalImage(s.image, cloudinaryFolders[page]) } : s)));
}

const seeding = new Map<SectionPage, Promise<PageDoc | null>>();

export async function getSections(page: SectionPage): Promise<Section[]> {
  await connectDb();
  let doc = await PageModel.findOne({ page }).lean<PageDoc>();
  if (!doc) {
    if (!seeding.has(page)) {
      seeding.set(page, legacySections(page)
        .then((sections) => PageModel.findOneAndUpdate({ page }, { $setOnInsert: { page, sections } }, { upsert: true, new: true }).lean<PageDoc>())
        .finally(() => seeding.delete(page)));
    }
    doc = await seeding.get(page)!;
  }
  return (doc?.sections ?? []).map(toSection);
}

export async function saveSections(page: SectionPage, sections: Section[]) {
  await connectDb();
  await PageModel.updateOne({ page }, { $set: { sections } }, { upsert: true });
}
