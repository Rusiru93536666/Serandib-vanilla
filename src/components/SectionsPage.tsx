import Link from "next/link";
import type { Section } from "@/lib/defaults";
import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { CtaBanner, JumpNav, PageHeader, RevealMedia, SectionNum, btnArrow, btnPrimary, btnSecondary, ctaPrimary } from "@/components/PageMotion";

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
      {docs.map((doc, i) => {
        const pending = /\bnot\b/i.test(doc!.status);
        return <li key={doc!.name} data-reveal="scale" style={{ "--i": 4 + i * .6 } as CSSProperties}>
          <div data-spotlight className="group relative flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-forest/10 bg-white p-4 shadow-sm transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:border-forest/25 hover:shadow-xl hover:shadow-forest/10">
            <span aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${pending ? "bg-charcoal/5 text-charcoal/45" : "bg-forest/10 text-forest"}`}><Icon name="file" className="h-5 w-5" /></span>
            <span className="relative min-w-0">
              <span className="block font-medium leading-snug text-charcoal">{doc!.name}</span>
              <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${pending ? "bg-charcoal/5 text-charcoal/60" : "bg-forest/10 text-forest"}`}>
                <Icon name={pending ? "clock" : "check"} className="h-3 w-3" />{doc!.status}
              </span>
            </span>
          </div>
        </li>;
      })}
    </ul>;
  }
  return <ul className="mt-6 space-y-3">
    {items.map((item, i) => <li key={item} data-reveal style={{ "--i": 4 + i * .6 } as CSSProperties} className="group flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors duration-300 group-hover:bg-forest group-hover:text-cream"><Icon name="check" className="h-3.5 w-3.5" /></span>
      <span className="leading-7">{item}</span>
    </li>)}
  </ul>;
}

function SectionVisual({ section, index, icon }: { section: Section; index: number; icon: IconName }) {
  if (section.image) {
    return <img src={section.image} alt={section.imageAlt ?? ""} loading={index === 0 ? "eager" : "lazy"} className="aspect-[4/3] w-full object-cover" />;
  }
  return <div aria-hidden="true" className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-forest"
    style={{ backgroundImage: "radial-gradient(circle at 25% 20%, rgb(233 215 165 / 22%), transparent 55%), repeating-linear-gradient(135deg, transparent 0 18px, rgb(233 215 165 / 5%) 18px 19px)" }}>
    <span className="font-serif text-[7rem] leading-none text-cream/25">{String(index + 1).padStart(2, "0")}</span>
    <Icon name={icon} className="absolute bottom-6 right-6 h-10 w-10 text-cream/40" />
  </div>;
}

export default function SectionsPage({ eyebrow, icon, title, lead, watermark, primary, secondary, sections, documents = false, closing }: {
  eyebrow: string;
  watermark: string;
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
      <PageHeader eyebrow={eyebrow} icon={icon} title={title} lead={lead} watermark={watermark}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={primary.href} className={btnPrimary}>{primary.label}<Icon name="arrowRight" className={btnArrow} /></Link>
          {secondary && <Link href={secondary.href} className={btnSecondary}>{secondary.label}</Link>}
        </div>
        {sections.length > 1 && <JumpNav label="On this page" items={sections.map((s, i) => ({ href: `#${anchor(s.h, i)}`, text: s.h, num: String(i + 1).padStart(2, "0") }))} />}
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-24 px-5 py-20 sm:space-y-32 sm:py-28">
        {sections.length === 0 && <p data-reveal className="rounded-3xl border border-dashed border-forest/25 bg-white/60 px-6 py-16 text-center text-charcoal/65">This page is being prepared. Contact us if you have questions in the meantime.</p>}
        {sections.map((s, i) => {
          const num = String(i + 1).padStart(2, "0");
          return <section key={anchor(s.h, i)} id={anchor(s.h, i)} className="grid scroll-mt-24 items-center gap-10 md:grid-cols-2 lg:gap-16">
            <RevealMedia className={i % 2 ? "md:order-2" : ""}><SectionVisual section={s} index={i} icon={icon} /></RevealMedia>
            <div className="relative min-w-0">
              <span aria-hidden="true" className="outline-forest pointer-events-none absolute -top-16 right-0 font-serif text-[9rem] leading-none">{num}</span>
              <div className="relative">
                <SectionNum num={num} />
                <h2 data-reveal style={{ "--i": 1 } as CSSProperties} className="mt-3 text-3xl leading-tight sm:text-4xl">{s.h}</h2>
                {s.p && <p data-reveal style={{ "--i": 2 } as CSSProperties} className="mt-5 whitespace-pre-line text-lg leading-8 text-charcoal/75">{s.p}</p>}
                {s.items && s.items.length > 0 && <Items items={s.items} documents={documents} />}
              </div>
            </div>
          </section>;
        })}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20">
        <CtaBanner title={closing.title} text={closing.text}>
          <Link href={closing.cta.href} className={ctaPrimary}>{closing.cta.label}<Icon name="arrowRight" className={btnArrow} /></Link>
        </CtaBanner>
      </div>
    </div>
  );
}
