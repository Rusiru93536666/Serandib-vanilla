import { promises as fs } from "fs";
import path from "path";
import { Schema } from "mongoose";
import { products as defaultProducts, type Product } from "@/config/site";
import { connectDb, defineModel } from "@/lib/db";
import { cloudinaryFolders, moveLocalImage } from "@/lib/cloudinary";

type ProductDoc = Product & { order: number };

const productSchema = new Schema<ProductDoc>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  short: { type: String, default: "" },
  intro: { type: String, default: "" },
  uses: { type: [String], default: [] },
  note: { type: String, default: "" },
  imageNote: { type: String, default: "" },
  specs: { type: [[String]], default: [] },
  packaging: { type: String, default: "" },
  images: { type: [{ _id: false, src: String, alt: String }], default: [] },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const ProductModel = defineModel<ProductDoc>("Product", productSchema);

const toProduct = (d: ProductDoc): Product => ({
  slug: d.slug, name: d.name, short: d.short, intro: d.intro, uses: d.uses, note: d.note, imageNote: d.imageNote,
  specs: d.specs.map(([k = "", v = ""]) => [k, v] as [string, string]), packaging: d.packaging,
  images: (d.images ?? []).map(({ src, alt }) => ({ src, alt: alt ?? "" })),
});

// Copies products saved before MongoDB was added (data/content.json), moving their local photos to Cloudinary.
async function legacyProducts(): Promise<Product[]> {
  let saved: Product[] | undefined;
  try { saved = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "content.json"), "utf8")).products; } catch {}
  return Promise.all((saved ?? defaultProducts).map(async (p) => ({
    ...p,
    images: await Promise.all((p.images ?? []).map(async (img) => ({ ...img, src: await moveLocalImage(img.src, cloudinaryFolders.products) }))),
  })));
}

let seeding: Promise<void> | undefined;
async function seedIfEmpty() {
  if (await ProductModel.estimatedDocumentCount() > 0) return;
  seeding ??= (async () => {
    const list = await legacyProducts();
    await ProductModel.bulkWrite(list.map((p, order) => ({ updateOne: { filter: { slug: p.slug }, update: { $setOnInsert: { ...p, order } }, upsert: true } })));
  })().finally(() => { seeding = undefined; });
  await seeding;
}

export async function getProducts(): Promise<Product[]> {
  await connectDb();
  await seedIfEmpty();
  const docs = await ProductModel.find().sort({ order: 1, createdAt: 1 }).lean<ProductDoc[]>();
  return docs.map(toProduct);
}

export async function saveProducts(list: Product[]) {
  await connectDb();
  const slugs = list.map((p) => p.slug);
  await ProductModel.bulkWrite([
    ...list.map((p, order) => ({ updateOne: { filter: { slug: p.slug }, update: { $set: { ...p, images: p.images ?? [], order } }, upsert: true } })),
    { deleteMany: { filter: { slug: { $nin: slugs } } } },
  ]);
}
