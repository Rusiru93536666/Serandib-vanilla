import { NextResponse } from "next/server";
import { inquirySchema, MULTIPLE_PRODUCTS, type Inquiry } from "@/lib/schema";
import { site } from "@/config/site";
import { getContent } from "@/lib/store";
import { createInquiry, markNotified } from "@/lib/inquiries";
import { sendWhatsAppAlert } from "@/lib/whatsapp";

const hits = new Map<string, number[]>(); // simple in-memory limiter (use Redis/Upstash for multi-instance hosting)
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (recent.length >= 5) return NextResponse.json({ ok: false, message: "Too many requests. Please try again later." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 }); }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Please correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  const productNames = [...(await getContent()).products.map((p) => p.name), MULTIPLE_PRODUCTS];
  if (!productNames.includes(parsed.data.product)) return NextResponse.json({ ok: false, message: "Please correct the highlighted fields.", errors: { product: ["Select a product"] } }, { status: 422 });

  const d = parsed.data;

  // Every inquiry is stored for the admin Inquiries page; email and WhatsApp are notifications on top.
  let savedId: string | null = null;
  try {
    savedId = await createInquiry(d);
  } catch (e) {
    console.error("Could not save inquiry to MongoDB", e);
  }

  const [emailed, whatsapped] = await Promise.all([sendEmail(d), sendWhatsAppAlert(whatsappText(d, savedId))]);
  if (savedId && (emailed || whatsapped)) await markNotified(savedId, { emailed, whatsapped }).catch(() => {});
  if (!savedId && !emailed && !whatsapped) return NextResponse.json({ ok: false, message: "We could not send your inquiry. Please try again or email us directly." }, { status: 502 });
  return NextResponse.json({ ok: true, message: "Thank you. Your inquiry has been sent and we will reply by email." });
}

function whatsappText(d: Inquiry, id: string | null) {
  const lines = [
    `New ${site.brand} inquiry`,
    `${d.company} (${d.fullName}, ${d.country})`,
    `Product: ${d.product}, ${d.quantity} ${d.unit}`,
    `Buyer: ${d.buyerType}`,
    `Email: ${d.email}`,
    d.targetDate && `Target date: ${d.targetDate}`,
    d.message && `Message: ${d.message.length > 300 ? `${d.message.slice(0, 300)}…` : d.message}`,
    id ? `Open: ${site.url}/admin/inquiries` : "Not saved to the database; reply from this message.",
  ];
  return lines.filter(Boolean).join("\n");
}

async function sendEmail(d: Inquiry): Promise<boolean> {
  const { RESEND_API_KEY, INQUIRY_TO_EMAIL, INQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !INQUIRY_TO_EMAIL || !INQUIRY_FROM_EMAIL) return false;
  const html = Object.entries(d).filter(([k]) => k !== "website").map(([k, v]) => `<p><b>${esc(k)}</b>: ${esc(String(v))}</p>`).join("");
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: INQUIRY_FROM_EMAIL, to: INQUIRY_TO_EMAIL, reply_to: d.email, subject: `${site.brand} inquiry: ${d.product} from ${d.company}`, html }),
    });
    if (!r.ok) console.error("Inquiry email failed", r.status);
    return r.ok;
  } catch (e) {
    console.error("Inquiry email failed", e);
    return false;
  }
}
