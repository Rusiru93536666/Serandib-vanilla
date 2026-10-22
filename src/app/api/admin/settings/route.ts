import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { contactSchema, saveContactSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  const parsed = contactSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ message: issue.message, field: issue.path[0] }, { status: 422 });
  }
  try {
    await saveContactSettings(parsed.data);
  } catch (e) {
    console.error("Saving contact settings failed", e);
    return NextResponse.json({ message: "Could not save to the database. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: parsed.data });
}
