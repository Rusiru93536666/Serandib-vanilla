import mongoose, { Schema, type Model } from "mongoose";
import { connectDb, defineModel } from "@/lib/db";
import type { Inquiry } from "@/lib/schema";

export const inquiryStatuses = ["new", "contacted", "quoted", "closed"] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];
export type StoredInquiry = Omit<Inquiry, "website" | "consent"> & {
  id: string; status: InquiryStatus; notes: string; emailed: boolean; whatsapped: boolean; read: boolean; createdAt: string; updatedAt: string;
};

const inquirySchema = new Schema({
  fullName: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  buyerType: String,
  product: String,
  quantity: String,
  unit: String,
  intendedUse: { type: String, default: "" },
  packaging: { type: String, default: "" },
  sample: { type: String, default: "no" },
  shippingTerms: { type: String, default: "Not sure" },
  targetDate: { type: String, default: "" },
  message: { type: String, default: "" },
  status: { type: String, enum: inquiryStatuses, default: "new", index: true },
  notes: { type: String, default: "" },
  emailed: { type: Boolean, default: false },
  whatsapped: { type: Boolean, default: false },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true, versionKey: false });

const InquiryModel = defineModel("Inquiry", inquirySchema) as unknown as Model<Record<string, unknown>>;

const toInquiry = ({ _id, createdAt, updatedAt, readAt, ...rest }: Record<string, unknown>) => ({
  whatsapped: false, ...rest, id: String(_id), read: !!readAt, createdAt: (createdAt as Date).toISOString(), updatedAt: (updatedAt as Date).toISOString(),
}) as StoredInquiry;

export async function createInquiry(data: Inquiry): Promise<string> {
  await connectDb();
  const { website: _honeypot, consent: _consent, ...fields } = data;
  const doc = await InquiryModel.create(fields);
  return String(doc._id);
}

export async function markNotified(id: string, sent: { emailed: boolean; whatsapped: boolean }) {
  await connectDb();
  await InquiryModel.updateOne({ _id: id }, { $set: sent });
}

export async function listInquiries(): Promise<StoredInquiry[]> {
  await connectDb();
  const docs = await InquiryModel.find().sort({ createdAt: -1 }).limit(1000).lean<Record<string, unknown>[]>();
  return docs.map(toInquiry);
}

export async function countUnread(): Promise<number> {
  await connectDb();
  return InquiryModel.countDocuments({ readAt: null });
}

export async function updateInquiry(id: string, patch: { status?: InquiryStatus; notes?: string; read?: boolean }): Promise<StoredInquiry | null> {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) return null;
  const { read, ...fields } = patch;
  const set = { ...fields, ...(read !== undefined && { readAt: read ? new Date() : null }) };
  const doc = await InquiryModel.findByIdAndUpdate(id, { $set: set }, { new: true }).lean<Record<string, unknown>>();
  return doc ? toInquiry(doc) : null;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  await connectDb();
  if (!mongoose.isValidObjectId(id)) return false;
  return (await InquiryModel.deleteOne({ _id: id })).deletedCount > 0;
}
