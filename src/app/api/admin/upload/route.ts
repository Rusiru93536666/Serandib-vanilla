import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { cloudinaryConfigured, cloudinaryFolders, uploadToCloudinary, type CloudinaryDest } from "@/lib/cloudinary";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES + 100_000) return NextResponse.json({ message: "Images must be 5 MB or smaller." }, { status: 413 });
  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ message: "Upload must be a multipart form." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ message: "Images must be 5 MB or smaller." }, { status: 413 });
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const extension = extensions[file.type];
  if (!extension) return NextResponse.json({ message: "Only JPEG, PNG, and WebP images are supported." }, { status: 415 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!(file.type === "image/jpeg" && isJpeg || file.type === "image/png" && isPng || file.type === "image/webp" && isWebp)) {
    return NextResponse.json({ message: "Image contents do not match the selected file type." }, { status: 415 });
  }
  const dest = new URL(req.url).searchParams.get("dest");
  if (dest && dest in cloudinaryFolders) {
    if (!cloudinaryConfigured()) return NextResponse.json({ message: "Cloudinary is not configured (CLOUDINARY_URL)." }, { status: 503 });
    try {
      return NextResponse.json({ url: await uploadToCloudinary(bytes, cloudinaryFolders[dest as CloudinaryDest]) }, { status: 201 });
    } catch (e) {
      console.error("Cloudinary upload failed", e);
      return NextResponse.json({ message: "Could not upload the image to Cloudinary. Please try again." }, { status: 502 });
    }
  }
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
