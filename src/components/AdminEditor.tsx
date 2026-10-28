"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Loaders";
/* eslint-disable @typescript-eslint/no-explicit-any */
const inp = "w-full rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";
const uid = () => Math.random().toString(36).slice(2);
const lines = (s: string) => s.split("\n");
const altFromName = (file: File) => file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
function clean(o: any): any {
  const { _id, _new, _auto, _origSlug, ...r } = o;
  if (typeof r.slug === "string") r.slug = r.slug.replace(/^-+|-+$/g, "");
  if (r.uses) r.uses = r.uses.map((x: string) => x.trim()).filter(Boolean);
  if (r.items) r.items = r.items.map((x: string) => x.trim()).filter(Boolean);
  if (r.specs) r.specs = r.specs.map(([k, v]: string[]) => [k.trim(), v.trim()]).filter(([k]: string[]) => k);
  if ("image" in r && !r.image) { delete r.image; delete r.imageAlt; }
  return r;
}

async function uploadImage(file: File, dest?: "products" | "story" | "quality" | "gallery" | "home"): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Use a JPEG, PNG, or WebP image.");
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(dest ? `/api/admin/upload?dest=${dest}` : "/api/admin/upload", { method: "POST", body: form });
  const j = await r.json();
  if (!r.ok) throw new Error(j.message ?? "Upload failed.");
  return j.url;
}

function pickImages(onPick: (files: File[]) => void, multiple = false) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp";
  input.multiple = multiple;
  input.onchange = () => { const files = Array.from(input.files ?? []); if (files.length) onPick(files); };
  input.click();
}

export function SectionImage({ src, alt, onChange, dest }: { src?: string; alt?: string; onChange: (patch: { image?: string; imageAlt?: string }) => void; dest?: "story" | "quality" | "home" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setUploading(true); setError("");
    try {
      onChange({ image: await uploadImage(file, dest), imageAlt: alt || altFromName(file) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const pick = () => pickImages(([file]) => void upload(file));
  return <div className="space-y-3">
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) void upload(file); }}
      className="group/img relative overflow-hidden rounded-xl border-2 border-dashed border-forest/20 bg-ivory/60 transition-colors hover:border-forest/40">
      {src ? <>
        <img src={src} alt={alt ?? ""} className="aspect-[4/3] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-charcoal/60 to-transparent p-2 transition-opacity sm:opacity-0 sm:group-hover/img:opacity-100 sm:group-focus-within/img:opacity-100">
          <button type="button" onClick={pick} className="rounded-md bg-white/90 px-2.5 py-1 text-xs text-forest hover:bg-white">Replace</button>
          <button type="button" onClick={() => onChange({ image: "", imageAlt: "" })} className="rounded-md bg-white/90 px-2.5 py-1 text-xs text-red-700 hover:bg-white">Remove</button>
        </div>
      </> : <button type="button" onClick={pick} disabled={uploading} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 p-4 text-center text-sm text-charcoal/60 hover:text-forest">
        <Icon name="upload" className="h-6 w-6" /><span>{uploading ? "Uploading…" : "Click or drop an image"}</span><span className="text-xs text-charcoal/45">JPEG, PNG, or WebP · 5 MB max</span>
      </button>}
      {uploading && src && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 text-sm text-forest"><Spinner />Uploading…</div>}
    </div>
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    {src && <Txt label="Image description (alt text)" value={alt ?? ""} onChange={(v) => onChange({ imageAlt: v })} />}
  </div>;
}
type Photo = { src: string; alt: string };
const MAX_PHOTOS = 8;

function ProductImages({ images, onChange }: { images: Photo[]; onChange: (images: Photo[]) => void }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  async function add(files: File[]) {
    const room = MAX_PHOTOS - images.length;
    if (room <= 0) { setError(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    setError(""); setUploading(Math.min(files.length, room));
    const added: Photo[] = [];
    for (const file of files.slice(0, room)) {
      try { added.push({ src: await uploadImage(file, "products"), alt: altFromName(file) }); }
      catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    }
    onChange([...images, ...added]);
    setUploading(0);
  }
  const set = (i: number, patch: Partial<Photo>) => onChange(images.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const swap = (i: number, j: number) => { const c = [...images]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
  const tool = "rounded-md bg-white/90 p-1.5 text-forest shadow-sm hover:bg-white disabled:opacity-40";
  return <div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img, i) => <figure key={`${img.src}-${i}`} className="group/ph space-y-2">
        <div className="relative overflow-hidden rounded-xl ring-1 ring-forest/10">
          <img src={img.src} alt={img.alt} className="aspect-square w-full object-cover" />
          {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-0.5 text-[0.7rem] font-medium text-ivory">Main photo</span>}
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-charcoal/60 to-transparent p-2 transition-opacity sm:opacity-0 sm:group-hover/ph:opacity-100 sm:group-focus-within/ph:opacity-100">
            <span className="flex gap-1">
              <button type="button" aria-label="Move photo earlier" title="Move earlier" disabled={i === 0} onClick={() => swap(i, i - 1)} className={tool}><Icon name="arrowLeft" className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Move photo later" title="Move later" disabled={i === images.length - 1} onClick={() => swap(i, i + 1)} className={tool}><Icon name="arrowRight" className="h-3.5 w-3.5" /></button>
            </span>
            <button type="button" aria-label="Remove photo" title="Remove" onClick={() => onChange(images.filter((_, j) => j !== i))} className={`${tool} text-red-700`}><Icon name="trash" className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <input className={`${inp} py-1.5 text-xs`} value={img.alt} placeholder="Describe this photo" aria-label={`Alt text for photo ${i + 1}`} onChange={(e) => set(i, { alt: e.target.value })} />
      </figure>)}
      {images.length < MAX_PHOTOS && <button type="button" disabled={!!uploading} onClick={() => pickImages((files) => void add(files), true)}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const files = Array.from(e.dataTransfer.files ?? []); if (files.length) void add(files); }}
        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-forest/20 bg-ivory/60 p-3 text-center text-sm text-charcoal/60 transition-colors hover:border-forest/40 hover:text-forest">
        <Icon name={uploading ? "upload" : "plus"} className="h-6 w-6" />
        <span>{uploading ? `Uploading ${uploading}…` : "Add photos"}</span>
        <span className="text-xs text-charcoal/45">{images.length}/{MAX_PHOTOS} · drop or click</span>
      </button>}
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </div>;
}

function SpecsEditor({ specs, onChange }: { specs: [string, string][]; onChange: (specs: [string, string][]) => void }) {
  const set = (i: number, col: 0 | 1, v: string) => onChange(specs.map((row, j) => (j === i ? (col ? [row[0], v] : [v, row[1]]) : row)));
  return <div className="space-y-2">
    <div className="hidden grid-cols-[1fr_1.4fr_2rem] gap-2 px-1 text-xs font-medium uppercase tracking-wider text-charcoal/45 sm:grid"><span>Label</span><span>Value</span></div>
    {specs.map(([label, value], i) => <div key={i} className="grid grid-cols-[1fr_2rem] gap-2 sm:grid-cols-[1fr_1.4fr_2rem]">
      <input className={inp} value={label} placeholder="e.g. Moisture content" aria-label={`Specification ${i + 1} label`} onChange={(e) => set(i, 0, e.target.value)} />
      <input className={`${inp} col-start-1 sm:col-start-auto`} value={value} placeholder="e.g. 25–30%" aria-label={`Specification ${i + 1} value`} onChange={(e) => set(i, 1, e.target.value)} />
      <button type="button" aria-label={`Remove specification ${i + 1}`} title="Remove" onClick={() => onChange(specs.filter((_, j) => j !== i))} className="row-start-1 flex h-9 w-8 items-center justify-center self-center rounded-md text-charcoal/45 hover:bg-red-50 hover:text-red-700 sm:row-start-auto sm:col-start-3"><Icon name="x" /></button>
    </div>)}
    <button type="button" onClick={() => onChange([...specs, ["", ""]])} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-forest hover:bg-forest/5"><Icon name="plus" />Add specification</button>
  </div>;
}

type GalleryRow = { _id: string; src: string; alt: string; caption: string; category: string };

function GalleryManager({ items, setItems }: { items: GalleryRow[]; setItems: (fn: (items: GalleryRow[]) => GalleryRow[]) => void }) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const categories = [...new Set(items.map((x) => x.category.trim()).filter(Boolean))].sort();
  async function add(files: File[]) {
    setError(""); setUploading(files.length);
    for (const file of files) {
      try {
        const src = await uploadImage(file, "gallery");
        setItems((d) => [...d, { _id: uid(), src, alt: altFromName(file), caption: "", category: filter }]);
      } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
      setUploading((n) => n - 1);
    }
  }
  const set = (id: string, patch: Partial<GalleryRow>) => setItems((d) => d.map((x) => (x._id === id ? { ...x, ...patch } : x)));
  const shift = (id: string, dir: -1 | 1) => setItems((d) => {
    const i = d.findIndex((x) => x._id === id), j = i + dir;
    if (j < 0 || j >= d.length) return d;
    const c = [...d]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const remove = (id: string) => confirm("Remove this photo from the gallery?") && setItems((d) => d.filter((x) => x._id !== id));
  const shown = items.filter((x) => !filter || x.category.trim() === filter);
  const tool = "rounded-md bg-white/90 p-1.5 text-forest shadow-sm hover:bg-white disabled:opacity-40";

  return <div className="space-y-5">
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const files = Array.from(e.dataTransfer.files ?? []); if (files.length) void add(files); }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest/25 bg-white px-6 py-10 text-center transition-colors hover:border-forest/50">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="upload" className="h-6 w-6" /></span>
      <p className="font-medium text-charcoal">{uploading ? `Uploading ${uploading} photo${uploading === 1 ? "" : "s"}…` : "Drop photos here to add them"}</p>
      <p className="text-xs text-charcoal/55">JPEG, PNG, or WebP · 5 MB each{filter && <> · added to “{filter}”</>}</p>
      <button type="button" disabled={!!uploading} onClick={() => pickImages((files) => void add(files), true)} className="mt-2 inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm text-ivory hover:bg-charcoal disabled:opacity-60"><Icon name="plus" />Choose photos</button>
    </div>
    {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

    {items.length > 0 && <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-charcoal/55">Show:</span>
      {["", ...categories].map((c) => <button key={c || "all"} type="button" onClick={() => setFilter(c)}
        className={`rounded-full px-3 py-1 text-sm ${filter === c ? "bg-forest text-ivory" : "bg-forest/5 text-charcoal/70 hover:text-forest"}`}>
        {c || "All"} <span className="opacity-60">{c ? items.filter((x) => x.category.trim() === c).length : items.length}</span>
      </button>)}
    </div>}

    {items.length === 0
      ? <p className="rounded-xl border border-dashed border-forest/30 bg-white/60 p-8 text-center text-sm text-charcoal/65">No photos yet. Add some above to build the gallery.</p>
      : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((x) => {
          const i = items.indexOf(x);
          return <li key={x._id} className="group/g overflow-hidden rounded-xl border border-forest/15 bg-white shadow-sm">
            <div className="relative">
              <img src={x.src} alt={x.alt} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-charcoal/60 px-2 py-0.5 text-xs text-ivory">#{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-charcoal/60 to-transparent p-2 transition-opacity sm:opacity-0 sm:group-hover/g:opacity-100 sm:group-focus-within/g:opacity-100">
                <span className="flex gap-1">
                  <button type="button" aria-label="Move earlier" title="Move earlier" disabled={i === 0} onClick={() => shift(x._id, -1)} className={tool}><Icon name="arrowLeft" className="h-3.5 w-3.5" /></button>
                  <button type="button" aria-label="Move later" title="Move later" disabled={i === items.length - 1} onClick={() => shift(x._id, 1)} className={tool}><Icon name="arrowRight" className="h-3.5 w-3.5" /></button>
                </span>
                <button type="button" aria-label="Remove photo" title="Remove" onClick={() => remove(x._id)} className={`${tool} text-red-700`}><Icon name="trash" className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="space-y-2.5 p-3">
              <input className={inp} value={x.caption} placeholder="Caption (optional)" aria-label="Caption" onChange={(e) => set(x._id, { caption: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} value={x.category} list="gallery-categories" placeholder="Category" aria-label="Category" onChange={(e) => set(x._id, { category: e.target.value })} />
                <input className={inp} value={x.alt} placeholder="Alt text" aria-label="Alt text" onChange={(e) => set(x._id, { alt: e.target.value })} />
              </div>
            </div>
          </li>;
        })}
      </ul>}
    <datalist id="gallery-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
  </div>;
}

export function Txt({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return <label className="block text-sm"><span className="mb-1 block font-medium">{label}</span>
    {rows ? <textarea className={inp} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /> : <input className={inp} value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function Raw({ label, init, onChange, rows = 4, hint }: { label: string; init: string; onChange: (v: string) => void; rows?: number; hint?: string }) {
  const [t, setT] = useState(init);
  return <div><Txt label={label} rows={rows} value={t} onChange={(v) => { setT(v); onChange(v); }} />{hint && <p className="mt-1 text-xs text-charcoal/60">{hint}</p>}</div>;
}

export default function Editor({ k, initial }: { k: "products" | "story" | "quality" | "gallery" | "blogs"; initial: any[] }) {
  const [data, setData] = useState<any[]>(() => initial.map((x) => ({ ...x, _id: uid(), _origSlug: x.slug })));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const up = (i: number, patch: any) => setData((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const del = (i: number) => confirm("Delete this entry?") && setData((d) => d.filter((_, j) => j !== i));
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  async function save() {
    setBusy(true); setStatus(null);
    const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: data.map(clean) }) }).catch(() => null);
    const j = r ? await r.json() : { message: "Network error." };
    if (r?.ok) setData((d) => d.map((x) => { const saved = clean(x); return { ...x, slug: saved.slug ?? x.slug, _new: false, _auto: false, _origSlug: saved.slug }; }));
    setStatus(r?.ok ?{ ok: true, msg: "Saved. The public site is updated." } : { ok: false, msg: j.message ?? "Could not save." }); setBusy(false);
  }
  function addProduct() {
    const _id = uid();
    setData((d) => [...d, { _id, _new: true, _auto: true, slug: "", name: "", short: "", intro: "", uses: [], note: "", imageNote: "", specs: [], packaging: "", images: [] }]);
    setTimeout(() => document.getElementById(`product-${_id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
  const move = (i: number, dir: -1 | 1) => setData((d) => { const c = [...d]; [c[i + dir], c[i]] = [c[i], c[i + dir]]; return c; });
  const box = "space-y-4 border border-forest/20 bg-white p-5";
  const iconBtn = "flex h-8 w-8 items-center justify-center rounded-md text-charcoal/60 hover:bg-forest/10 hover:text-forest disabled:opacity-30";
  return (
    <div className="space-y-6">
      {k === "gallery" && <GalleryManager items={data} setItems={setData} />}
      {k === "products" && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest/10 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-charcoal/65"><span className="font-semibold text-forest">{data.length}</span> product{data.length === 1 ? "" : "s"} · shown on the site in this order</p>
        <button type="button" onClick={addProduct} disabled={data.length >= 20} className="inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-medium text-ivory hover:bg-charcoal disabled:opacity-50"><Icon name="plus" />Add product</button>
      </div>}
      {k === "products" && data.map((p, i) => (
        <details key={p._id} id={`product-${p._id}`} open={i === 0 || p._new} className={`group overflow-hidden rounded-xl border bg-white shadow-sm ${p._new ? "border-forest/40 ring-2 ring-forest/10" : "border-forest/15"}`}>
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 sm:gap-4 [&::-webkit-details-marker]:hidden">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream/40 text-forest/50 ring-1 ring-forest/10">
              {p.images?.[0] ? <img src={p.images[0].src} alt="" className="h-full w-full object-cover" /> : <Icon name="image" className="h-6 w-6" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2"><span className="truncate font-serif text-xl text-forest">{p.name || "Untitled product"}</span>{p._new && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-medium text-amber-800">New · not saved</span>}</span>
              <span className="block truncate font-mono text-xs text-charcoal/50">/products/{p.slug || "…"} · {(p.images ?? []).length} photo{(p.images ?? []).length === 1 ? "" : "s"} · {p.specs.length} specs</span>
            </span>
            <span className="flex items-center gap-0.5" onClick={(e) => { if (!(e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
              <button type="button" title="Move up" aria-label="Move product up" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtn}><Icon name="arrowUp" /></button>
              <button type="button" title="Move down" aria-label="Move product down" disabled={i === data.length - 1} onClick={() => move(i, 1)} className={iconBtn}><Icon name="arrowDown" /></button>
              {!p._new && <a href={`/products/${p.slug}`} target="_blank" title="View on site" aria-label="View on site" className={iconBtn}><Icon name="external" /></a>}
              <button type="button" title="Delete product" aria-label="Delete product" disabled={data.length <= 1} onClick={() => del(i)} className={`${iconBtn} hover:bg-red-50 hover:text-red-700`}><Icon name="trash" /></button>
            </span>
            <Icon name="arrowDown" className="h-4 w-4 text-charcoal/40 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-8 border-t border-forest/10 p-5 sm:p-6">
            <div>
              <h3 className="mb-1 text-base font-semibold text-forest">Photos</h3>
              <p className="mb-3 text-xs text-charcoal/55">The first photo is the main image on product cards. Use the arrows to reorder.</p>
              <ProductImages images={p.images ?? []} onChange={(images) => up(i, { images })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <h3 className="text-base font-semibold text-forest sm:col-span-2">Basics</h3>
              <Txt label="Name" value={p.name} onChange={(v) => up(i, { name: v, ...(p._auto ? { slug: slugify(v) } : {}) })} />
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Web address</span>
                <span className="flex overflow-hidden rounded-md border border-charcoal/20 shadow-sm focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20">
                  <span className="flex items-center border-r border-charcoal/15 bg-ivory px-3 font-mono text-xs text-charcoal/55">/products/</span>
                  <input className="min-w-0 flex-1 bg-white px-3 py-2 font-mono text-sm focus:outline-none" value={p.slug} placeholder="vanilla-extract" onChange={(e) => up(i, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-/, ""), _auto: false })} />
                </span>
                {!p._new && p.slug !== p._origSlug && <span className="mt-1 block text-xs text-amber-700">Changing this breaks existing links to the old address.</span>}
              </label>
              <div className="sm:col-span-2"><Txt label="Short description" value={p.short} onChange={(v) => up(i, { short: v })} /></div>
              <div className="sm:col-span-2"><Txt label="Introduction" rows={4} value={p.intro} onChange={(v) => up(i, { intro: v })} /></div>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-forest">Uses & packaging</h3>
                <Raw label="Uses (one per line)" rows={5} init={p.uses.join("\n")} onChange={(v) => up(i, { uses: lines(v) })} />
                <Txt label="Packaging" rows={3} value={p.packaging} onChange={(v) => up(i, { packaging: v })} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-forest">Specifications</h3>
                <p className="mb-3 mt-1 text-xs text-charcoal/55">Only enter values you have verified.</p>
                <SpecsEditor specs={p.specs} onChange={(specs) => up(i, { specs })} />
              </div>
            </div>
            <div className="grid gap-4 rounded-lg bg-amber-50/60 p-4 ring-1 ring-amber-600/15 sm:grid-cols-2">
              <Txt label="Editor note (shown publicly; clear it before launch)" value={p.note} onChange={(v) => up(i, { note: v })} />
              <Txt label="Photo note (internal reminder for missing photos)" value={p.imageNote} onChange={(v) => up(i, { imageNote: v })} />
            </div>
          </div>
        </details>
      ))}
      {(k === "story" || k === "quality") && <>
        {data.length === 0 && <p className="rounded-xl border border-dashed border-forest/30 p-8 text-center text-sm text-charcoal/65">No sections yet. Add the first one below.</p>}
        {data.map((s, i) => (
          <section key={s._id} className="overflow-hidden rounded-xl border border-forest/15 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-forest/10 bg-ivory/50 px-5 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory">{i + 1}</span>
              <h2 className="min-w-0 flex-1 truncate text-lg">{s.h || "Untitled section"}</h2>
              <div className="flex items-center gap-0.5">
                <button type="button" title="Move up" aria-label="Move section up" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtn}><Icon name="arrowUp" /></button>
                <button type="button" title="Move down" aria-label="Move section down" disabled={i === data.length - 1} onClick={() => move(i, 1)} className={iconBtn}><Icon name="arrowDown" /></button>
                <button type="button" title="Delete section" aria-label="Delete section" onClick={() => del(i)} className={`${iconBtn} hover:bg-red-50 hover:text-red-700`}><Icon name="trash" /></button>
              </div>
            </header>
            <div className="grid gap-6 p-5 md:grid-cols-[16rem_1fr]">
              <div>
                <p className="mb-1.5 text-sm font-medium">Section image</p>
                <SectionImage src={s.image} alt={s.imageAlt} onChange={(patch) => up(i, patch)} dest={k === "story" || k === "quality" ? k : undefined} />
              </div>
              <div className="min-w-0 space-y-4">
                <Txt label="Heading" value={s.h} onChange={(v) => up(i, { h: v })} />
                <Txt label="Text" rows={5} value={s.p} onChange={(v) => up(i, { p: v })} />
                <Raw label="Bullet list (optional, one per line)" rows={4} init={(s.items ?? []).join("\n")} onChange={(v) => up(i, { items: lines(v) })}
                  hint={k === "quality" ? "For documents, write “Name: status”, e.g. “Certificate of Analysis: available on request”. Statuses containing “not” show as pending." : undefined} />
              </div>
            </div>
          </section>
        ))}
        <button type="button" onClick={() => setData((d) => [...d, { _id: uid(), h: "New section", p: "" }])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest/25 py-5 text-sm font-medium text-forest transition-colors hover:border-forest/50 hover:bg-white"><Icon name="plus" />Add section</button>
      </>}
      {k === "blogs" && <>
        {data.length === 0 && <p className="border border-dashed border-forest/30 p-6 text-sm">No posts yet. Add your first post below.</p>}
        {data.map((b, i) => (
          <section key={b._id} className={box}>
            <Txt label="Title" value={b.title} onChange={(v) => up(i, { title: v, ...(b._auto ? { slug: slugify(v) } : {}) })} />
            <div className="grid gap-4 sm:grid-cols-2"><Txt label="URL slug" value={b.slug} onChange={(v) => up(i, { slug: v, _auto: false })} /><Txt label="Date (YYYY-MM-DD)" value={b.date} onChange={(v) => up(i, { date: v })} /></div>
            <Txt label="Excerpt" rows={2} value={b.excerpt} onChange={(v) => up(i, { excerpt: v })} />
            <Txt label="Body (plain text; blank line starts a new paragraph)" rows={10} value={b.body} onChange={(v) => up(i, { body: v })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-forest" checked={b.published} onChange={(e) => up(i, { published: e.target.checked })} />Published (unticked posts are drafts and stay hidden)</label>
            <button type="button" onClick={() => del(i)} className="text-sm text-red-700 underline">Delete post</button>
          </section>
        ))}
        <button type="button" onClick={() => setData((d) => [{ _id: uid(), _auto: true, slug: "", title: "", excerpt: "", body: "", date: new Date().toISOString().slice(0, 10), published: false }, ...d])} className="border border-forest px-4 py-2 text-sm text-forest">Add post</button>
      </>}
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-4 rounded-xl border border-forest/15 bg-white/95 p-3 shadow-lg shadow-forest/10 backdrop-blur">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal disabled:opacity-60">{busy ? <><Spinner />Saving…</> : <><Icon name="check" />Save changes</>}</button>
        <p role="status" aria-live="polite" className={`text-sm ${status?.ok ? "text-forest" : "text-red-700"}`}>{status?.msg}</p>
      </div>
    </div>
  );
}
