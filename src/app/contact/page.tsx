import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "fs";
import path from "path";
import QuoteForm from "@/components/QuoteForm";
import { getContent } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { site } from "@/config/site";
import { getContactSettings } from "@/lib/settings";
import { HeroStage } from "@/components/HeroStage";
import type { CSSProperties } from "react";
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
      <HeroStage className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75 backdrop-blur"><Icon name="send" className="h-3.5 w-3.5" />Wholesale inquiries</p>
            <h1 className="rise mt-5 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl" style={{ animationDelay: ".1s" }}>Request a quote</h1>
            <span aria-hidden="true" className="hero-rule mt-7 block h-px w-24 bg-gradient-to-r from-forest/50 to-transparent" />
            <p className="rise mt-6 max-w-xl text-lg leading-8 text-charcoal/70" style={{ animationDelay: ".2s" }}>Tell us what you need. The more detail you share, the more accurate the terms we can offer.</p>
            <ol className="relative mt-10 space-y-6">
              <span aria-hidden="true" className="steps-line absolute bottom-5 left-[1.125rem] top-5 w-px bg-gradient-to-b from-forest/40 via-forest/20 to-transparent" />
              {steps.map((step, i) => <li key={step.title} className="rise group relative flex gap-4" style={{ animationDelay: `${.35 + i * .12}s` }}>
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-white font-serif text-forest shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-forest group-hover:bg-forest group-hover:text-cream">{i + 1}</span>
                <span className="transition-transform duration-500 group-hover:translate-x-1"><span className="block font-medium text-charcoal">{step.title}</span><span className="mt-0.5 block text-sm leading-6 text-charcoal/60">{step.text}</span></span>
              </li>)}
            </ol>
            {(contact.email || socials.length > 0) && <div className="rise mt-10 flex flex-wrap items-center gap-3 border-t border-forest/10 pt-8" style={{ animationDelay: ".75s" }}>
              {contact.email && <a href={`mailto:${contact.email}`} className="group inline-flex items-center gap-2.5 rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm font-medium text-forest shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:shadow-lg hover:shadow-forest/10">
                <Icon name="mail" className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />{contact.email}
              </a>}
              {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/15 bg-white text-forest shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:rotate-6 hover:border-forest hover:bg-forest hover:text-ivory">
                <Icon name={s.icon} className="h-5 w-5" />
              </a>)}
            </div>}
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="parallax tilt relative" style={{ "--d": 10 } as CSSProperties}>
              <div className="rise relative overflow-hidden rounded-[2rem] shadow-2xl shadow-forest/20" style={{ animationDelay: ".2s" }}>
                {contactImage
                  ? <img src={contactImage} alt="Sri Lankan vanilla" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
                  : <div aria-hidden="true" className="relative flex aspect-[4/5] w-full items-end overflow-hidden bg-forest p-8 sm:aspect-[5/4] lg:aspect-[4/5]"
                      style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgb(233 215 165 / 28%), transparent 50%), repeating-linear-gradient(135deg, transparent 0 22px, rgb(233 215 165 / 5%) 22px 23px)" }}>
                      <Icon name="leaf" className="absolute right-10 top-10 h-24 w-24 text-cream/25" />
                      <p className="font-serif text-3xl leading-tight text-cream/90">{site.tagline}</p>
                    </div>}
                <div aria-hidden="true" className="card-sheen pointer-events-none absolute inset-0" />
              </div>
            </div>
            <div aria-hidden="true" className="parallax absolute -right-4 -top-12 w-32 sm:-right-8 sm:w-44" style={{ "--d": 36, rotate: "14deg" } as CSSProperties}>
              <div className="bloom" style={{ animationDelay: ".5s" }}><div className="float" style={{ "--dur": "8s" } as CSSProperties}><img src="/images/hero-flower.webp" alt="" width={640} height={640} className="hero-shadow w-full" /></div></div>
            </div>
            <div aria-hidden="true" className="parallax absolute -left-6 bottom-24 hidden w-16 sm:block" style={{ "--d": -18, rotate: "-32deg" } as CSSProperties}>
              <div className="bloom" style={{ animationDelay: ".75s" }}><div className="float" style={{ "--dur": "10s", "--delay": "-3s" } as CSSProperties}><img src="/images/hero-beans.webp" alt="" width={276} height={900} decoding="async" className="hero-shadow w-full" /></div></div>
            </div>
            <div className="parallax absolute -bottom-6 left-6 right-6 sm:left-auto sm:right-8 sm:w-80" style={{ "--d": 18 } as CSSProperties}>
              <div className="bloom flex items-center gap-4 rounded-2xl border border-forest/10 bg-white/95 p-4 shadow-xl shadow-forest/10 backdrop-blur" style={{ animationDelay: ".9s" }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/60 text-forest"><Icon name="leaf" className="h-5 w-5" /></span>
                <span className="text-sm leading-5"><span className="block font-medium text-charcoal">{site.brand}</span><span className="text-charcoal/60">Vanilla beans, powder & tea from Sri Lanka</span></span>
              </div>
            </div>
          </div>
        </div>
      </HeroStage>

      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Quote request form" data-reveal className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-white p-6 shadow-xl shadow-forest/5 sm:p-10">
          <span aria-hidden="true" className="form-bar absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-[#D29A31] to-forest" />
          <QuoteForm products={products.map((x) => x.name)} defaultProduct={product ?? ""} />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div data-reveal="right">
            <section data-spotlight className="group relative overflow-hidden rounded-3xl bg-forest p-6 text-ivory">
              <div aria-hidden="true" className="blob absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cream/15 blur-2xl" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_circle_at_var(--sx,50%)_var(--sy,50%),rgb(233_215_165/16%),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <h2 className="relative text-2xl !text-ivory">Contact us directly</h2>
              {contacts.length > 0
                ? <ul className="relative mt-5 space-y-4">{contacts.map((c) => <li key={c.label} className="group/item flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-cream transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-cream group-hover/item:text-forest"><Icon name={c.icon} /></span>
                    <span className="min-w-0 text-sm"><span className="block text-ivory/60">{c.label}</span>{c.href ? <a href={c.href} className="break-words font-medium hover:underline">{c.value}</a> : <span className="font-medium">{c.value}</span>}</span>
                  </li>)}</ul>
                : <p className="relative mt-3 text-sm leading-6 text-ivory/75">Direct contact details will be added soon. Please use the form, and we’ll reply by email within 36 hours.</p>}
            </section>
          </div>
          <section data-reveal="right" style={{ "--i": 1 } as CSSProperties} className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl">Helpful to include</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal/75">
              {["Grade or quality requirements", "Annual or repeat volumes", "Destination port or country", "Required documents"].map((tip) => <li key={tip} className="group flex gap-2.5 transition-transform duration-300 hover:translate-x-1"><span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-forest transition-colors duration-300 group-hover:bg-forest group-hover:text-cream"><Icon name="check" className="h-3 w-3" /></span>{tip}</li>)}
            </ul>
          </section>
          <nav aria-label="Before you ask" data-reveal="right" style={{ "--i": 2 } as CSSProperties} className="grid gap-2 text-sm">
            {[["/products", "Browse products"], ["/quality", "Quality & documents"]].map(([href, label]) => <Link key={href} href={href}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-forest/10 bg-white px-5 py-4 text-forest shadow-sm transition-all duration-500 hover:border-forest hover:text-ivory hover:shadow-lg hover:shadow-forest/15">
              <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-forest transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-100" />
              <span className="relative">{label}</span>
              <Icon name="arrowRight" className="relative h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>)}
          </nav>
        </aside>
      </div>
    </div>
  );
}
