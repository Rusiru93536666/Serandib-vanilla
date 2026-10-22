import { Schema, type Model } from "mongoose";
import { connectDb, defineModel } from "@/lib/db";
import type { BlogPost } from "@/lib/blog";

// One document per post; the post id is the document _id. Posts are validated by the API before saving,
// so the schema only declares the fields used for lookups and stores the rest as given.
const postSchema = new Schema({
  _id: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  status: { type: String, index: true },
  publishedAt: { type: String, default: null },
  content: { type: Schema.Types.Mixed },
}, { strict: false, minimize: false, versionKey: false, id: false });

const PostModel = defineModel("BlogPost", postSchema) as unknown as Model<Record<string, unknown>>;

const toPost = ({ _id, ...rest }: Record<string, unknown>) => ({ ...rest, id: String(_id) }) as BlogPost;
const toDoc = ({ id, ...rest }: BlogPost) => ({ _id: id, ...rest });

export async function countPostDocs() {
  await connectDb();
  return PostModel.estimatedDocumentCount();
}

export async function loadPostDocs(): Promise<BlogPost[]> {
  await connectDb();
  const docs = await PostModel.find().sort({ createdAt: -1 }).lean<Record<string, unknown>[]>();
  return docs.map(toPost);
}

// Writes only what changed between two versions of the post list.
export async function writePostDocs(before: BlogPost[], after: BlogPost[]) {
  await connectDb();
  const old = new Map(before.map((p) => [p.id, JSON.stringify(p)]));
  const keep = new Set(after.map((p) => p.id));
  const ops = [
    ...after.filter((p) => old.get(p.id) !== JSON.stringify(p)).map((p) => ({ replaceOne: { filter: { _id: p.id }, replacement: toDoc(p), upsert: true } })),
    ...before.filter((p) => !keep.has(p.id)).map((p) => ({ deleteOne: { filter: { _id: p.id } } })),
  ];
  if (ops.length) await PostModel.bulkWrite(ops as never);
}

export async function insertPostDocs(posts: BlogPost[]) {
  await connectDb();
  if (posts.length) await PostModel.bulkWrite(posts.map((p) => ({ updateOne: { filter: { _id: p.id }, update: { $setOnInsert: toDoc(p) }, upsert: true } })) as never);
}
