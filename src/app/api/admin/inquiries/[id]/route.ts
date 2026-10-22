import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { deleteInquiry, inquiryStatuses, updateInquiry } from "@/lib/inquiries";

export const runtime = "nodejs";
const patchSchema = z.object({ status: z.enum(inquiryStatuses).optional(), notes: z.string().max(4000).optional(), read: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ message: "Invalid update." }, { status: 422 });
  try {
    const inquiry = await updateInquiry((await params).id, parsed.data);
    return inquiry ? NextResponse.json({ inquiry }) : NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
  } catch (e) {
    console.error("Updating inquiry failed", e);
    return NextResponse.json({ message: "Could not save to the database. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  try {
    return (await deleteInquiry((await params).id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
  } catch (e) {
    console.error("Deleting inquiry failed", e);
    return NextResponse.json({ message: "Could not delete. Please try again." }, { status: 500 });
  }
}
