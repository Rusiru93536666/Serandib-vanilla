import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listInquiries, type StoredInquiry } from "@/lib/inquiries";
import AdminInquiries from "@/components/AdminInquiries";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiries", robots: { index: false, follow: false } };

export default async function Inquiries() {
  if (!(await isAdmin())) redirect("/admin/login");
  let inquiries: StoredInquiry[] = [];
  let failed = false;
  try { inquiries = await listInquiries(); } catch (e) { console.error("Could not load inquiries", e); failed = true; }
  const unread = inquiries.filter((i) => !i.read).length;
  return <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
    <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-charcoal/65 hover:text-forest"><Icon name="arrowLeft" />Site content</Link>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-4xl">Inquiries</h1><p className="mt-2 text-sm text-charcoal/65">Quote requests from the website{unread > 0 && <> · <span className="font-medium text-red-700">{unread} unread</span></>}</p></div>
    </div>
    {failed
      ? <p role="alert" className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Could not load inquiries from the database. Check MONGODB_URI and reload.</p>
      : <AdminInquiries initial={inquiries} />}
  </div>;
}
