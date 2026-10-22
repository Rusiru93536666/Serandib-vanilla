import { promises as fs } from "fs";
import path from "path";
import { Schema } from "mongoose";
import { withHomeDefaults, type HomeContent } from "@/lib/defaults";
import { connectDb, defineModel } from "@/lib/db";
import { cloudinaryFolders, moveLocalImage } from "@/lib/cloudinary";

// The home page is one document. Its content is validated by the API before saving, so it is stored as given.
type HomeDoc = { key: "home"; content: HomeContent };

const homeSchema = new Schema<HomeDoc>({
  key: { type: String, required: true, unique: true },
  content: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true, minimize: false });

const HomeModel = defineModel<HomeDoc>("HomePage", homeSchema);
const KEY = "home";

// Copies home content saved before MongoDB was added (data/content.json), moving its local photos to Cloudinary.
async function legacyHome(): Promise<HomeContent> {
  let saved: Partial<HomeContent> | undefined;
  try { saved = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "content.json"), "utf8")).home; } catch {}
  const home = withHomeDefaults(saved);
  const folder = cloudinaryFolders.home;
  return {
    ...home,
    hero: { ...home.hero, image: await moveLocalImage(home.hero.image, folder) },
    why: { ...home.why, image: await moveLocalImage(home.why.image, folder) },
  };
}

let seeding: Promise<HomeDoc | null> | undefined;

export async function getHome(): Promise<HomeContent> {
  await connectDb();
  let doc = await HomeModel.findOne({ key: KEY }).lean<HomeDoc>();
  if (!doc) {
    seeding ??= legacyHome()
      .then((content) => HomeModel.findOneAndUpdate({ key: KEY }, { $setOnInsert: { key: KEY, content } }, { upsert: true, new: true }).lean<HomeDoc>())
      .finally(() => { seeding = undefined; });
    doc = await seeding;
  }
  return withHomeDefaults(doc?.content);
}

export async function saveHome(content: HomeContent) {
  await connectDb();
  await HomeModel.updateOne({ key: KEY }, { $set: { content } }, { upsert: true });
}
