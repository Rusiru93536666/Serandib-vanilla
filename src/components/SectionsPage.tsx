import Link from "next/link";
import type { Section } from "@/lib/defaults";
import { Icon, type IconName } from "@/components/Icon";

type Cta = { href: string; label: string };

const anchor = (heading: string, i: number) => `${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"}-${i + 1}`;
const asDocument = (item: string) => {
  const i = item.indexOf(":");
  return i > 0 ? { name: item.slice(0, i).trim(), status: item.slice(i + 1).trim() } : null;
};

function Items({ items, documents }: { items: string[]; documents: boolean }) {
  const docs = items.map(asDocument);
  if (documents && docs.every(Boolean)) {
    return <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {docs.map((doc) => {
        const pending = /\bnot\b/i.test(doc!.status);
        return <li key={doc!.name} className="flex items-start gap-3 rounded-xl border border-forest/10 bg-white p-4 shadow-sm">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${pending ? "bg-charcoal/5 text-charcoal/45" : "bg-forest/10 text-forest"}`}><Icon name="file" className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block font-medium leading-snug text-charcoal">{doc!.name}</span>
            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${pending ? "bg-charcoal/5 text-charcoal/60" : "bg-forest/10 text-forest"}`}>
              <Icon name={pending ? "clock" : "check"} className="h-3 w-3" />{doc!.status}
            </span>
          </span>
        </li>;
      })}
    </ul>;
  }
  return <ul className="mt-6 space-y-3">
    {items.map((item) => <li key={item} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="check" className="h-3.5 w-3.5" /></span><span className="leading-7">{item}</span></li>)}
  </ul>;
}

function SectionVisual({ section, index, icon }: { section: Section; index: number; icon: IconName }) {
  if (section.image) {
    return <img src={section.image} alt={section.imageAlt ?? ""} loading={index === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-forest/10" />;
  }
  return <div aria-hidden="true" className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl bg-forest shadow-xl shadow-forest/10"
    style={{ backgroundImage: "radial-gradient(circle at 25% 20%, rgb(233 215 165 / 22%), transparent 55%), repeating-linear-gradient(135deg, transparent 0 18px, rgb(233 215 165 / 5%) 18px 19px)" }}>
    <span className="font-serif text-[7rem] leading-none text-cream/25">{String(index + 1).padStart(2, "0")}</span>
    <Icon name={icon} className="absolute bottom-6 right-6 h-10 w-10 text-cream/40" />
  </div>;
}

export default function SectionsPage({ eyebrow, icon, title, lead, primary, secondary, sections, documents = false, closing }: {
  eyebrow: string;
  icon: IconName;
  title: string;
  lead: string;
  primary: Cta;
  secondary?: Cta;
  sections: Section[];
  documents?: boolean;
  closing: { title: string; text: string; cta: Cta };
}) {
  return (
    <div>
      <header className="relative overflow-hidden border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cream/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[.18em] text-forest/75"><Icon name={icon} className="h-3.5 w-3.5" />{eyebrow}</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-charcoal/70">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primary.href} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-ivory hover:bg-charcoal">{primary.label}<Icon name="arrowRight" /></Link>
            {secondary && <Link href={secondary.href} className="rounded-full border border-forest/25 bg-white/70 px-5 py-3 text-sm text-forest hover:border-forest">{secondary.label}</Link>}
          </div>
          {sections.length > 1 && <nav aria-label="On this page" className="mt-12 flex flex-wrap gap-2">
            {sections.map((s, i) => <a key={anchor(s.h, i)} href={`#${anchor(s.h, i)}`} className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm text-charcoal/75 transition-colors hover:border-forest/40 hover:text-forest">
              <span className="text-xs font-semibold text-forest/60">{String(i + 1).padStart(2, "0")}</span>{s.h}
            </a>)}
          </nav>}
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-20 px-5 py-16 sm:space-y-28 sm:py-24">
        {sections.length === 0 && <p className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-16 text-center text-charcoal/65">This page is being prepared. Contact us if you have questions in the meantime.</p>}
        {sections.map((s, i) => (
          <section key={anchor(s.h, i)} id={anchor(s.h, i)} className="grid scroll-mt-24 items-center gap-10 md:grid-cols-2 lg:gap-16">
            <div className={i % 2 ? "md:order-2" : ""}><SectionVisual section={s} index={i} icon={icon} /></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-[.2em] text-[#B07D22]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">{s.h}</h2>
              {s.p && <p className="mt-5 whitespace-pre-line text-lg leading-8 text-charcoal/75">{s.p}</p>}
              {s.items && s.items.length > 0 && <Items items={s.items} documents={documents} />}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <aside className="relative overflow-hidden rounded-3xl bg-forest px-6 py-12 text-ivory sm:px-12">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cream/15 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl text-ivory sm:text-4xl">{closing.title}</h2>
              <p className="mt-3 leading-7 text-ivory/80">{closing.text}</p>
            </div>
            <Link href={closing.cta.href} className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest hover:bg-ivory">{closing.cta.label}<Icon name="arrowRight" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
