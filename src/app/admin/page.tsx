import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getContent, type Key } from "@/lib/store";
import Editor from "@/components/AdminEditor";
import HomeEditor from "@/components/HomeEditor";
import { countUnread } from "@/lib/inquiries";
import { getContactSettings } from "@/lib/settings";
import ContactEditor from "@/components/ContactEditor";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };
const tabs: [Exclude<Key, "blogs"> | "contact", string][] = [["home", "Home page"], ["products", "Products"], ["story", "Our Story"], ["quality", "Quality"], ["gallery", "Gallery"], ["contact", "Contact & social"]];

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const t = (await searchParams).tab;
  const tab = tabs.find(([k]) => k === t)?.[0] ?? "home";
  const c = await getContent();
  const unread = await countUnread().catch(() => 0);
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-4xl">Site content</h1><p className="mt-2 text-sm text-charcoal/65">Edit the home page, products, story, quality, gallery, and contact details. Changes go live when you save.</p></div>
        <div className="flex items-center gap-2">
          <Link href="/admin/inquiries" aria-label={unread ? `Inquiries, ${unread} unread` : "Inquiries"}
            className={`relative inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-forest/5 ${unread ? "border-red-300 bg-red-50/60 font-medium text-forest" : "border-forest/25 bg-white text-forest"}`}>
            Inquiries
            {unread > 0 && <>
              <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold leading-none tabular-nums text-white">{unread > 99 ? "99+" : unread}</span>
              <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" /><span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" /></span>
            </>}
          </Link>
          <Link href="/admin/blogs" className="rounded-md border border-forest/25 bg-white px-4 py-2 text-sm text-forest hover:bg-forest/5">Blog posts</Link>
          <form action="/api/admin/logout" method="post"><button className="rounded-md px-3 py-2 text-sm text-charcoal/65 hover:bg-charcoal/5">Sign out</button></form>
        </div>
      </div>
      <nav aria-label="Admin sections" className="mt-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-forest/5 p-1">
        {tabs.map(([k, l]) => <Link key={k} href={`/admin?tab=${k}`} aria-current={k === tab ? "page" : undefined} className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm transition-colors ${k === tab ? "bg-white font-medium text-forest shadow-sm" : "text-charcoal/65 hover:text-forest"}`}>{l}</Link>)}
      </nav>
      {tab === "home" && <p className="mt-4 text-sm text-charcoal/60">Each panel matches a section of the <Link href="/" target="_blank" className="text-forest underline underline-offset-4">home page</Link>, from top to bottom. Open a panel to edit it.</p>}
      {tab === "gallery" && <p className="mt-4 text-sm text-charcoal/60">Photos appear on the public <Link href="/gallery" target="_blank" className="text-forest underline underline-offset-4">Gallery page</Link> in this order. Categories become filter buttons for visitors.</p>}
      {(tab === "quality" || tab === "story") && <p className="mt-4 text-sm text-charcoal/60">Each section appears on the public <Link href={tab === "quality" ? "/quality" : "/about"} target="_blank" className="text-forest underline underline-offset-4">{tab === "quality" ? "Quality" : "Our Story"} page</Link> with its image, alternating left and right.</p>}
      <div className="mt-8">{tab === "home" ? <HomeEditor initial={c.home} /> : tab === "contact" ? <ContactEditor initial={await getContactSettings()} /> : <Editor key={tab} k={tab} initial={c[tab]} />}</div>
    </div>
  );
}
