"use client";
import { useState } from "react";
import type { ContactSettings } from "@/lib/settings";
import { Icon, type IconName } from "@/components/Icon";
import { FooterContact } from "@/components/Chrome";

const inp = "min-w-0 flex-1 bg-white px-3 py-2 text-sm focus:outline-none";
const fields: { key: keyof ContactSettings; label: string; icon: IconName; placeholder: string; hint?: string; type?: string }[] = [
  { key: "email", label: "Email", icon: "mail", placeholder: "export@yourdomain.com", type: "email" },
  { key: "whatsapp", label: "WhatsApp number", icon: "whatsapp", placeholder: "94771234567", hint: "Country code and number, digits only. Visitors tap it to open a WhatsApp chat." },
  { key: "address", label: "Address", icon: "mapPin", placeholder: "Street, city, Sri Lanka" },
  { key: "facebook", label: "Facebook page", icon: "facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram profile", icon: "instagram", placeholder: "https://instagram.com/yourprofile" },
  { key: "tiktok", label: "TikTok profile", icon: "tiktok", placeholder: "https://tiktok.com/@yourprofile" },
];

export default function ContactEditor({ initial }: { initial: ContactSettings }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string; field?: string } | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  async function save() {
    setBusy(true); setStatus(null);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      const j = await r.json();
      if (!r.ok) throw Object.assign(new Error(j.message ?? "Could not save."), { field: j.field });
      setValue(j.settings); setSaved(j.settings);
      setStatus({ ok: true, msg: "Saved. The footer and contact page are updated." });
    } catch (e) {
      setStatus({ ok: false, msg: e instanceof Error ? e.message : "Could not save.", field: (e as { field?: string }).field });
    } finally { setBusy(false); }
  }

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <section className="space-y-5 rounded-xl border border-forest/15 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl">Contact details & social links</h2>
        <p className="mt-1 text-sm text-charcoal/60">Shown in the site footer and on the Request a quote page. Leave a field empty to hide it.</p>
      </div>
      {fields.map((f) => {
        const invalid = status?.field === f.key;
        return <label key={f.key} className="block">
          <span className="mb-1.5 block text-sm font-medium">{f.label}</span>
          <span className={`flex overflow-hidden rounded-md border shadow-sm focus-within:ring-2 ${invalid ? "border-red-400 focus-within:ring-red-200" : "border-charcoal/20 focus-within:border-forest focus-within:ring-forest/20"}`}>
            <span className="flex w-10 shrink-0 items-center justify-center border-r border-charcoal/15 bg-ivory text-forest"><Icon name={f.icon} /></span>
            <input className={inp} type={f.type ?? "text"} value={value[f.key]} placeholder={f.placeholder} aria-invalid={invalid}
              onChange={(e) => { setValue((v) => ({ ...v, [f.key]: e.target.value })); if (invalid) setStatus(null); }} />
          </span>
          {f.hint && <span className="mt-1 block text-xs text-charcoal/55">{f.hint}</span>}
        </label>;
      })}
      <div className="flex flex-wrap items-center gap-4 border-t border-forest/10 pt-5">
        <button type="button" onClick={save} disabled={busy || !dirty} className="inline-flex items-center gap-2 rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-ivory hover:bg-charcoal disabled:opacity-50"><Icon name="check" />{busy ? "Saving…" : "Save contact details"}</button>
        {dirty && !status && <span className="inline-flex items-center gap-1.5 text-xs text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved changes</span>}
        {status && <p role="status" className={`text-sm ${status.ok ? "text-forest" : "text-red-700"}`}>{status.msg}</p>}
      </div>
    </section>
    <aside className="lg:sticky lg:top-24">
      <p className="mb-2 text-sm font-medium text-charcoal/70">Footer preview</p>
      <div className="rounded-xl bg-forest p-6 text-ivory shadow-sm"><FooterContact contact={value} /></div>
    </aside>
  </div>;
}
