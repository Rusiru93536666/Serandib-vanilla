import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, makeToken, checkPassword, adminConfigured } from "@/lib/auth";
const tries = new Map<string, number[]>();
export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ message: "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SECRET (16+ characters) in .env.local." }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local", now = Date.now();
  const recent = (tries.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (recent.length >= 5) return NextResponse.json({ message: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
  tries.set(ip, [...recent, now]);
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (typeof password !== "string" || !checkPassword(password)) return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
  (await cookies()).set(COOKIE, makeToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
  return NextResponse.json({ ok: true });
}
