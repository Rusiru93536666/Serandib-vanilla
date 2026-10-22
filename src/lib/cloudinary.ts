import { promises as fs } from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// The SDK reads credentials from CLOUDINARY_URL.
export const cloudinaryConfigured = () => !!process.env.CLOUDINARY_URL;

// Folder per content type that is stored on Cloudinary.
export const cloudinaryFolders = { products: "ceylon-vanilla/products", story: "ceylon-vanilla/story", quality: "ceylon-vanilla/quality", gallery: "ceylon-vanilla/gallery", blog: "ceylon-vanilla/blog", home: "ceylon-vanilla/home" } as const;
export type CloudinaryDest = keyof typeof cloudinaryFolders;

export async function uploadToCloudinary(bytes: Buffer, folder: string): Promise<string> {
  cloudinary.config({ secure: true });
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, res) => (error || !res ? reject(error ?? new Error("Upload failed.")) : resolve(res))).end(bytes);
  });
  return result.secure_url;
}

// Moves every local image path found anywhere in `value` to Cloudinary. Used on save so content
// edited in an admin tab opened before the database switch cannot bring local images back.
export async function moveLocalImagesDeep<T>(value: T, folder: string): Promise<T> {
  if (typeof value === "string") return (/^\/uploads\/[a-f0-9-]+\.(?:jpe?g|png|webp)$/i.test(value) ? await moveLocalImage(value, folder) : value) as T;
  if (Array.isArray(value)) return Promise.all(value.map((v) => moveLocalImagesDeep(v, folder))) as Promise<T>;
  if (value && typeof value === "object") {
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await moveLocalImagesDeep(v, folder)]))) as T;
  }
  return value;
}

// Moves an image saved in public/uploads to Cloudinary. Other URLs, and failures, keep the original.
export async function moveLocalImage(src: string, folder: string): Promise<string> {
  if (!src.startsWith("/uploads/") || !cloudinaryConfigured()) return src;
  try {
    return await uploadToCloudinary(await fs.readFile(path.join(process.cwd(), "public", src)), folder);
  } catch {
    return src;
  }
}
