import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "fs";
import path from "path";
import QuoteForm from "@/components/QuoteForm";
import { getContent } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { site } from "@/config/site";
import { getContactSettings } from "@/lib/settings";
export const metadata: Metadata = { title: "Request a quote", description: "Send a bulk quotation or sample request for vanilla beans, powder or tea from Sri Lanka.", alternates: { canonical: "/contact" } };

const steps = [
  { title: "Tell us what you need", text: "Product, quantity, and any packaging or delivery requirements." },
  { title: "We review your request", text: "We check availability and specifications for your order." },
  { title: "Receive your quote", text: "We reply by email with terms, and sample options if requested." },
];

export default async function Contact({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  const { products } = await getContent();
  // Drop a photo at public/images/contact.jpg (or .png / .webp) to show it beside the heading.
  const contactImage = ["jpg", "png", "webp"].map((ext) => `/images/contact.${ext}`).find((src) => existsSync(path.join(process.cwd(), "public", src)));
  const contact = await getContactSettings();
  const contacts = [
    contact.email && { icon: "mail" as const, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.whatsapp && { icon: "whatsapp" as const, label: "WhatsApp", value: `+${contact.whatsapp}`, href: `https://wa.me/${contact.whatsapp}` },
    contact.address && { icon: "mapPin" as const, label: "Address", value: contact.address },
  ].filter(Boolean) as { icon: "mail" | "whatsapp" | "mapPin"; label: string; value: string; href?: string }[];
  const socials = ([["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"]] as const)
    .filter(([key]) => contact[key])
    .map(([key, label]) => ({ icon: key, label, href: contact[key] }));

  return (
    <div>
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name="send" className="h-3.5 w-3.5" />Wholesale inquiries</p>
            <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl">Request a quote</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-charcoal/70">Tell us what you need. The more detail you share, the more accurate the terms we can offer.</p>
            <ol className="mt-10 space-y-5">
              {steps.map((step, i) => <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-white font-serif text-forest">{i + 1}</span>
                <span><span className="block font-medium text-charcoal">{step.title}</span><span className="mt-0.5 block text-sm leading-6 text-charcoal/60">{step.text}</span></span>
              </li>)}
            </ol>
            {(contact.email || socials.length > 0) && <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-forest/10 pt-8">
              {contact.email && <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2.5 rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm font-medium text-forest shadow-sm transition-colors hover:border-forest">
                <Icon name="mail" />{contact.email}
              </a>}
              {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-white text-forest shadow-sm transition-colors hover:border-forest hover:bg-forest hover:text-ivory">
                <Icon name={s.icon} className="h-5 w-5" />
              </a>)}
            </div>}
          </div>
          <div className="relative">
            {contactImage
              ? <img src={contactImage} alt="Sri Lankan vanilla" className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-2xl shadow-forest/20 sm:aspect-[5/4] lg:aspect-[4/5]" />
              : <div aria-hidden="true" className="relative flex aspect-[4/5] w-full items-end overflow-hidden rounded-[2rem] bg-forest p-8 shadow-2xl shadow-forest/20 sm:aspect-[5/4] lg:aspect-[4/5]"
                  style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgb(233 215 165 / 28%), transparent 50%), repeating-linear-gradient(135deg, transparent 0 22px, rgb(233 215 165 / 5%) 22px 23px)" }}>
                  <Icon name="leaf" className="absolute right-10 top-10 h-24 w-24 text-cream/25" />
                  <p className="font-serif text-3xl leading-tight text-cream/90">{site.tagline}</p>
                </div>}
            <div className="absolute -bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl border border-forest/10 bg-white/95 p-4 shadow-xl shadow-forest/10 backdrop-blur sm:left-auto sm:right-8 sm:w-80">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/60 text-forest"><Icon name="leaf" className="h-5 w-5" /></span>
              <span className="text-sm leading-5"><span className="block font-medium text-charcoal">{site.brand}</span><span className="text-charcoal/60">Vanilla beans, powder & tea from Sri Lanka</span></span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Quote request form" className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm sm:p-10">
          <QuoteForm products={products.map((x) => x.name)} defaultProduct={product ?? ""} />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-3xl bg-forest p-6 text-ivory">
            <h2 className="text-2xl text-ivory">Contact us directly</h2>
            {contacts.length > 0
              ? <ul className="mt-5 space-y-4">{contacts.map((c) => <li key={c.label} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-cream"><Icon name={c.icon} /></span>
                  <span className="min-w-0 text-sm"><span className="block text-ivory/60">{c.label}</span>{c.href ? <a href={c.href} className="break-words font-medium hover:underline">{c.value}</a> : <span className="font-medium">{c.value}</span>}</span>
                </li>)}</ul>
              : <p className="mt-3 text-sm leading-6 text-ivory/75">Direct contact details will be added soon. Please use the form, and we’ll reply by email within 36 hours.</p>}
          </section>
          <section className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl">Helpful to include</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal/75">
              {["Grade or quality requirements", "Annual or repeat volumes", "Destination port or country", "Required documents"].map((tip) => <li key={tip} className="flex gap-2.5"><Icon name="check" className="mt-0.5 h-4 w-4 text-forest" />{tip}</li>)}
            </ul>
          </section>
          <nav aria-label="Before you ask" className="grid gap-2 text-sm">
            <Link href="/products" className="flex items-center justify-between rounded-2xl border border-forest/10 bg-white px-5 py-4 text-forest shadow-sm transition-colors hover:border-forest/40">Browse products<Icon name="arrowRight" /></Link>
            <Link href="/quality" className="flex items-center justify-between rounded-2xl border border-forest/10 bg-white px-5 py-4 text-forest shadow-sm transition-colors hover:border-forest/40">Quality & documents<Icon name="arrowRight" /></Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
