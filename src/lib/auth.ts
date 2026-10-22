import crypto from "crypto";
import { cookies } from "next/headers";
export const COOKIE = "admin_session";
const sign = (s: string) => crypto.createHmac("sha256", process.env.ADMIN_SECRET ?? "").update(s).digest("hex");
export function makeToken() { const exp = String(Date.now() + 8 * 3600_000); return `${exp}.${sign(exp)}`; }
export function adminConfigured() { return !!process.env.ADMIN_PASSWORD && (process.env.ADMIN_SECRET ?? "").length >= 16; }
export async function isAdmin() {
  if (!adminConfigured()) return false;
  const t = (await cookies()).get(COOKIE)?.value; if (!t) return false;
  const [exp, sig] = t.split("."); if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function checkPassword(p: string) {
  const h = (x: string) => crypto.createHash("sha256").update(x).digest();
  return crypto.timingSafeEqual(h(p), h(process.env.ADMIN_PASSWORD ?? ""));
}
