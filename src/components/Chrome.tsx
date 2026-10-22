"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site, nav } from "@/config/site";
import type { ContactSettings } from "@/lib/settings";
import { Icon } from "@/components/Icon";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="sticky top-0 z-40 border-b border-forest/15 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="font-serif text-2xl tracking-tight text-forest">{site.brand}</Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex lg:gap-2">
          {nav.map((n) => {
            const active = isActive(n.href);
            return <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
              className={`relative rounded-full px-3 py-2 transition-colors after:absolute after:inset-x-3 after:-bottom-[1.05rem] after:h-0.5 after:rounded-full after:transition-colors ${active ? "font-medium text-forest after:bg-forest" : "text-charcoal/75 after:bg-transparent hover:bg-forest/5 hover:text-forest"}`}>{n.label}</Link>;
          })}
          <Link href="/contact" aria-current={isActive("/contact") ? "page" : undefined}
            className={`ml-2 rounded-full px-5 py-2.5 text-ivory transition-colors hover:bg-charcoal ${isActive("/contact") ? "bg-charcoal ring-2 ring-forest/30 ring-offset-2 ring-offset-ivory" : "bg-forest"}`}>Request a Quote</Link>
        </nav>
        <button className="md:hidden border border-forest/30 px-3 py-2 text-sm" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </div>
      {open && (
        <nav id="mnav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-forest/15 px-5 py-4 md:hidden">
          {nav.map((n) => {
            const active = isActive(n.href);
            return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${active ? "bg-forest/10 font-medium text-forest" : "text-charcoal/80 hover:bg-forest/5"}`}>
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${active ? "bg-forest" : "bg-transparent"}`} />{n.label}
            </Link>;
          })}
          <Link href="/contact" onClick={() => setOpen(false)} className="mt-3 rounded-full bg-forest px-5 py-3 text-center text-ivory">Request a Quote</Link>
        </nav>
      )}
    </header>
  );
}

const socialLinks = [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"]] as const;

// Contact block shared by the footer and the admin preview.
export function FooterContact({ contact }: { contact: ContactSettings }) {
  const wa = contact.whatsapp.replace(/\D/g, "");
  const socials = socialLinks.filter(([key]) => contact[key]);
  const row = "flex items-start gap-3 text-sm text-ivory/85";
  const bubble = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-cream";
  if (!contact.email && !wa && !contact.address && socials.length === 0) return <p className="text-sm text-ivory/60">Contact details coming soon.</p>;
  return <div className="space-y-3">
    {contact.email && <a href={`mailto:${contact.email}`} className={`${row} group`}><span className={bubble}><Icon name="mail" className="h-4 w-4" /></span><span className="break-all pt-1.5 group-hover:underline">{contact.email}</span></a>}
    {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={`${row} group`}><span className={bubble}><Icon name="whatsapp" className="h-4 w-4" /></span><span className="pt-1.5 group-hover:underline">+{wa}</span></a>}
    {contact.address && <p className={row}><span className={bubble}><Icon name="mapPin" className="h-4 w-4" /></span><span className="pt-1.5">{contact.address}</span></p>}
    {socials.length > 0 && <div className="flex gap-2 pt-2">
      {socials.map(([key, label]) => <a key={key} href={contact[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-cream hover:bg-cream hover:text-forest"><Icon name={key} className="h-[1.1rem] w-[1.1rem]" /></a>)}
    </div>}
  </div>;
}

export function Footer({ contact }: { contact: ContactSettings }) {
  return (
    <footer className="bg-forest text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div><p className="font-serif text-2xl">{site.brand}</p><p className="mt-2 max-w-xs text-sm leading-6 text-ivory/75">Vanilla products from Sri Lanka for international buyers.</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cream/80">Explore</p><ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">{nav.map((n) => <li key={n.href}><Link href={n.href} className="text-ivory/85 hover:text-ivory hover:underline">{n.label}</Link></li>)}</ul></div>
        <div><p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-cream/80">Get in touch</p><FooterContact contact={contact} /></div>
      </div>
      <p className="border-t border-ivory/15 py-4 text-center text-xs text-ivory/60">© {new Date().getFullYear()} {site.brand}. Working brand name; final name to be confirmed.</p>
    </footer>
  );
}
