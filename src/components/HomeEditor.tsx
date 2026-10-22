"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { HomeContent, HomeCard, HomeStep } from "@/lib/defaults";
import { SectionImage, Txt } from "@/components/AdminEditor";
import { Icon } from "@/components/Icon";

const inp = "w-full rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";
const iconBtn = "flex h-8 w-8 items-center justify-center rounded-md text-charcoal/60 hover:bg-forest/10 hover:text-forest disabled:opacity-30";
const pages = [["/products", "Products"], ["/about", "Our Story"], ["/quality", "Quality"], ["/gallery", "Gallery"], ["/blog", "Blog"], ["/contact", "Request a quote"]];

function Panel({ n, title, hint, children, open = false }: { n: number; title: string; hint: string; children: ReactNode; open?: boolean }) {
  return <details open={open} className="group overflow-hidden rounded-xl border border-forest/15 bg-white shadow-sm">
    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory">{n}</span>
      <span className="min-w-0 flex-1"><span className="block font-serif text-xl text-forest">{title}</span><span className="block truncate text-xs text-charcoal/55">{hint}</span></span>
      <Icon name="arrowDown" className="h-4 w-4 text-charcoal/40 transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-forest/10 p-5 sm:p-6">{children}</div>
  </details>;
}

function move<T>(list: T[], i: number, dir: -1 | 1) {
  const c = [...list]; [c[i], c[i + dir]] = [c[i + dir], c[i]]; return c;
}

function ListControls({ i, length, onMove, onRemove }: { i: number; length: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return <span className="flex items-center gap-0.5">
    <button type="button" aria-label="Move up" title="Move up" disabled={i === 0} onClick={() => onMove(-1)} className={iconBtn}><Icon name="arrowUp" /></button>
    <button type="button" aria-label="Move down" title="Move down" disabled={i === length - 1} onClick={() => onMove(1)} className={iconBtn}><Icon name="arrowDown" /></button>
    <button type="button" aria-label="Remove" title="Remove" onClick={onRemove} className={`${iconBtn} hover:bg-red-50 hover:text-red-700`}><Icon name="trash" /></button>
  </span>;
}

export default function HomeEditor({ initial }: { initial: HomeContent }) {
  const [home, setHome] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [newApp, setNewApp] = useState("");

  function set<K extends keyof HomeContent>(key: K, value: HomeContent[K]) { setHome((h) => ({ ...h, [key]: value })); setDirty(true); setStatus(null); }
  function patch<K extends Exclude<keyof HomeContent, "highlights">>(key: K, value: Partial<HomeContent[K]>) { set(key, { ...home[key], ...value }); }
  const steps = home.process.steps;
  const setSteps = (s: HomeStep[]) => patch("process", { steps: s });
  const setStep = (i: number, v: Partial<HomeStep>) => setSteps(steps.map((s, j) => (j === i ? { ...s, ...v } : s)));
  const setCard = (i: number, v: Partial<HomeCard>) => set("highlights", home.highlights.map((c, j) => (j === i ? { ...c, ...v } : c)));
  function addApp() {
    const v = newApp.trim();
    if (v && !home.applications.items.includes(v)) patch("applications", { items: [...home.applications.items, v] });
    setNewApp("");
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setBusy(true); setStatus(null);
    const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "home", value: home }) }).catch(() => null);
    const j = r ? await r.json() : { message: "Network error." };
    if (r?.ok) setDirty(false);
    setStatus(r?.ok ? { ok: true, msg: "Saved. The home page is updated." } : { ok: false, msg: j.message ?? "Could not save." });
    setBusy(false);
  }

  return <div className="space-y-4">
    <Panel n={1} title="Hero" hint="The first thing visitors see: headline, intro, buttons and main photo" open>
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <div><p className="mb-1.5 text-sm font-medium">Hero photo</p><SectionImage src={home.hero.image} alt={home.hero.imageAlt} onChange={(p) => patch("hero", p)} dest="home" /></div>
        <div className="space-y-4">
          <Txt label="Small label above the headline" value={home.hero.eyebrow} onChange={(v) => patch("hero", { eyebrow: v })} />
          <Txt label="Headline" value={home.hero.title} onChange={(v) => patch("hero", { title: v })} />
          <Txt label="Intro text" rows={3} value={home.hero.text} onChange={(v) => patch("hero", { text: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Txt label="Main button (goes to Products)" value={home.hero.primaryLabel} onChange={(v) => patch("hero", { primaryLabel: v })} />
            <Txt label="Second button (goes to Request a quote)" value={home.hero.secondaryLabel} onChange={(v) => patch("hero", { secondaryLabel: v })} />
          </div>
        </div>
      </div>
    </Panel>

    <Panel n={2} title="Products section" hint="Heading above the product cards. Products themselves are edited in the Products tab.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Txt label="Heading" value={home.products.title} onChange={(v) => patch("products", { title: v })} />
        <Txt label="Text" value={home.products.text} onChange={(v) => patch("products", { text: v })} />
      </div>
    </Panel>

    <Panel n={3} title="Why Sri Lanka" hint="Story section with a photo">
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <div><p className="mb-1.5 text-sm font-medium">Photo</p><SectionImage src={home.why.image} alt={home.why.imageAlt} onChange={(p) => patch("why", p)} dest="home" /></div>
        <div className="space-y-4">
          <Txt label="Heading" value={home.why.title} onChange={(v) => patch("why", { title: v })} />
          <Txt label="Text (leave a blank line between paragraphs)" rows={7} value={home.why.text} onChange={(v) => patch("why", { text: v })} />
        </div>
      </div>
    </Panel>

    <Panel n={4} title="Process steps" hint={`${steps.length} step${steps.length === 1 ? "" : "s"} · dark green band`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Txt label="Heading" value={home.process.title} onChange={(v) => patch("process", { title: v })} />
        <Txt label="Text" value={home.process.text} onChange={(v) => patch("process", { text: v })} />
      </div>
      <ol className="space-y-3">
        {steps.map((s, i) => <li key={i} className="rounded-lg border border-forest/10 bg-ivory/50 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-forest/70">Step {i + 1}</span>
            <ListControls i={i} length={steps.length} onMove={(dir) => setSteps(move(steps, i, dir))} onRemove={() => setSteps(steps.filter((_, j) => j !== i))} /></div>
          <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
            <input className={inp} value={s.title} placeholder="Step title" aria-label={`Step ${i + 1} title`} onChange={(e) => setStep(i, { title: e.target.value })} />
            <input className={inp} value={s.text} placeholder="Short description" aria-label={`Step ${i + 1} text`} onChange={(e) => setStep(i, { text: e.target.value })} />
          </div>
        </li>)}
      </ol>
      {steps.length < 8 && <button type="button" onClick={() => setSteps([...steps, { title: "", text: "" }])} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-forest hover:bg-forest/5"><Icon name="plus" />Add step</button>}
    </Panel>

    <Panel n={5} title="Applications" hint={home.applications.items.join(" · ") || "No applications yet"}>
      <Txt label="Heading" value={home.applications.title} onChange={(v) => patch("applications", { title: v })} />
      <ul className="flex flex-wrap gap-2">
        {home.applications.items.map((a) => <li key={a} className="inline-flex items-center gap-1 rounded-full bg-cream/50 py-1 pl-3 pr-1 text-sm text-forest">
          {a}<button type="button" aria-label={`Remove ${a}`} onClick={() => patch("applications", { items: home.applications.items.filter((x) => x !== a) })} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-forest/10"><Icon name="x" className="h-3.5 w-3.5" /></button>
        </li>)}
      </ul>
      {home.applications.items.length < 16 && <div className="flex gap-2">
        <input className={inp} value={newApp} placeholder="Add an application, e.g. Bakeries" aria-label="New application" onChange={(e) => setNewApp(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addApp(); } }} />
        <button type="button" onClick={addApp} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-forest/25 px-3 text-sm text-forest hover:bg-forest/5"><Icon name="plus" />Add</button>
      </div>}
    </Panel>

    <Panel n={6} title="Highlight cards" hint={`${home.highlights.length} card${home.highlights.length === 1 ? "" : "s"} linking to other pages`}>
      <div className="grid gap-3 md:grid-cols-2">
        {home.highlights.map((c, i) => <div key={i} className="space-y-2.5 rounded-lg border border-forest/10 bg-ivory/50 p-3">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-forest/70">Card {i + 1}</span>
            <ListControls i={i} length={home.highlights.length} onMove={(dir) => set("highlights", move(home.highlights, i, dir))} onRemove={() => set("highlights", home.highlights.filter((_, j) => j !== i))} /></div>
          <input className={inp} value={c.title} placeholder="Title" aria-label={`Card ${i + 1} title`} onChange={(e) => setCard(i, { title: e.target.value })} />
          <textarea className={inp} rows={3} value={c.text} placeholder="Text" aria-label={`Card ${i + 1} text`} onChange={(e) => setCard(i, { text: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} value={c.linkLabel} placeholder="Link text" aria-label={`Card ${i + 1} link text`} onChange={(e) => setCard(i, { linkLabel: e.target.value })} />
            <select className={inp} value={c.linkHref} aria-label={`Card ${i + 1} link goes to`} onChange={(e) => setCard(i, { linkHref: e.target.value })}>
              {pages.map(([href, label]) => <option key={href} value={href}>{label}</option>)}
            </select>
          </div>
        </div>)}
      </div>
      {home.highlights.length < 4 && <button type="button" onClick={() => set("highlights", [...home.highlights, { title: "", text: "", linkLabel: "Learn more", linkHref: "/products" }])} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-forest hover:bg-forest/5"><Icon name="plus" />Add card</button>}
    </Panel>

    <Panel n={7} title="Closing call to action" hint="Final band at the bottom of the page">
      <div className="grid gap-4 sm:grid-cols-2">
        <Txt label="Heading" value={home.cta.title} onChange={(v) => patch("cta", { title: v })} />
        <Txt label="Button (goes to Request a quote)" value={home.cta.buttonLabel} onChange={(v) => patch("cta", { buttonLabel: v })} />
        <div className="sm:col-span-2"><Txt label="Text" rows={2} value={home.cta.text} onChange={(v) => patch("cta", { text: v })} /></div>
      </div>
    </Panel>

    <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-4 rounded-xl border border-forest/15 bg-white/95 p-3 shadow-lg shadow-forest/10 backdrop-blur">
      <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal disabled:opacity-60"><Icon name="check" />{busy ? "Saving…" : "Save home page"}</button>
      <a href="/" target="_blank" className="inline-flex items-center gap-1.5 text-sm text-charcoal/65 hover:text-forest"><Icon name="external" />View home page</a>
      {dirty && !status && <span className="inline-flex items-center gap-1.5 text-xs text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved changes</span>}
      <p role="status" aria-live="polite" className={`text-sm ${status?.ok ? "text-forest" : "text-red-700"}`}>{status?.msg}</p>
    </div>
  </div>;
}
