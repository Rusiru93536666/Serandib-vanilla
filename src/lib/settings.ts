import { Schema } from "mongoose";
import { z } from "zod";
import { site } from "@/config/site";
import { connectDb, defineModel } from "@/lib/db";

// Contact details and social links shown in the footer and on the contact page.
export type ContactSettings = { email: string; whatsapp: string; address: string; facebook: string; instagram: string; tiktok: string };

export const contactDefaults: ContactSettings = {
  email: site.email, whatsapp: site.whatsapp, address: site.address,
  facebook: site.social.facebook ?? "", instagram: site.social.instagram ?? "", tiktok: site.social.tiktok ?? "",
};

const profileUrl = (hosts: string[], label: string) => z.string().trim().max(300).refine((v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch { return false; }
}, `Enter the full ${label} link, starting with https://`);

export const contactSchema = z.object({
  email: z.string().trim().max(150).refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address."),
  whatsapp: z.string().trim().transform((v) => v.replace(/[\s()+-]/g, "")).refine((v) => !v || /^\d{7,15}$/.test(v), "Enter the WhatsApp number with country code, digits only (e.g. 94771234567)."),
  address: z.string().trim().max(300),
  facebook: profileUrl(["facebook.com", "fb.com"], "Facebook"),
  instagram: profileUrl(["instagram.com"], "Instagram"),
  tiktok: profileUrl(["tiktok.com"], "TikTok"),
});

type SettingsDoc = { key: "contact"; value: ContactSettings };
const SettingsModel = defineModel<SettingsDoc>("Setting", new Schema<SettingsDoc>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true, minimize: false }));

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    await connectDb();
    const doc = await SettingsModel.findOne({ key: "contact" }).lean<SettingsDoc>();
    return { ...contactDefaults, ...doc?.value };
  } catch (e) {
    console.error("Could not load contact settings from MongoDB; using defaults.", e);
    return contactDefaults;
  }
}

export async function saveContactSettings(value: ContactSettings) {
  await connectDb();
  await SettingsModel.updateOne({ key: "contact" }, { $set: { value } }, { upsert: true });
}
