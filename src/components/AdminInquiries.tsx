"use client";

import { useMemo, useState } from "react";
import type { InquiryStatus, StoredInquiry } from "@/lib/inquiries";
import { Icon } from "@/components/Icon";

const statuses: { value: InquiryStatus; label: string; badge: string; dot: string }[] = [
  { value: "new", label: "New", badge: "bg-amber-50 text-amber-800 ring-amber-600/25", dot: "bg-amber-500" },
  { value: "contacted", label: "Contacted", badge: "bg-sky-50 text-sky-800 ring-sky-600/20", dot: "bg-sky-500" },
  { value: "quoted", label: "Quoted", badge: "bg-forest/10 text-forest ring-forest/20", dot: "bg-forest" },
  { value: "closed", label: "Closed", badge: "bg-charcoal/5 text-charcoal/60 ring-charcoal/15", dot: "bg-charcoal/40" },
];
const statusOf = (s: InquiryStatus) => statuses.find((x) => x.value === s) ?? statuses[0];
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const input = "w-full rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm shadow-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";

function Badge({ status }: { status: InquiryStatus }) {
  const s = statusOf(status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}</span>;
}

export default function AdminInquiries({ initial }: { initial: StoredInquiry[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<InquiryStatus | "all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const visible = useMemo(() => items.filter((i) => {
    const q = search.trim().toLowerCase();
    return (filter === "all" || (filter === "unread" ? !i.read : i.status === filter)) && (!q || [i.fullName, i.company, i.email, i.country, i.product].some((v) => v.toLowerCase().includes(q)));
  }), [items, filter, search]);
  const selected = items.find((i) => i.id === selectedId);
  const count = (s: InquiryStatus | "all" | "unread") => (s === "all" ? items.length : s === "unread" ? items.filter((i) => !i.read).length : items.filter((i) => i.status === s).length);

  // Opening an inquiry marks it as read.
  function select(i: StoredInquiry) {
    setSelectedId(i.id); setNotes(i.notes); setMessage(null);
    if (!i.read) void update({ read: true }, i.id, true);
  }

  async function update(patch: { status?: InquiryStatus; notes?: string; read?: boolean }, id = selected?.id, quiet = false) {
    if (!id) return;
    if (!quiet) { setBusy(true); setMessage(null); }
    try {
      const r = await fetch(`/api/admin/inquiries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Could not save.");
      setItems((all) => all.map((i) => (i.id === id ? j.inquiry : i)));
      if (!quiet) setMessage({ ok: true, text: patch.notes !== undefined ? "Notes saved." : patch.read === false ? "Marked as unread." : "Status updated." });
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !window.confirm(`Delete the inquiry from ${selected.company}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/inquiries/${selected.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error((await r.json()).message ?? "Could not delete.");
      const rest = items.filter((i) => i.id !== selected.id);
      setItems(rest);
      if (rest[0]) select(rest[0]); else setSelectedId("");
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Could not delete." });
    } finally { setBusy(false); }
  }

  if (items.length === 0) {
    return <div className="mt-8 rounded-xl border border-dashed border-forest/30 bg-white/60 px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="mail" className="h-6 w-6" /></span>
      <p className="mt-4 font-serif text-2xl text-forest">No inquiries yet</p>
      <p className="mt-2 text-sm text-charcoal/65">Quote requests sent from the website will appear here.</p>
    </div>;
  }

  const row = (label: string, value: string) => value ? <div className="grid gap-1 py-2.5 text-sm sm:grid-cols-[10rem_1fr]"><dt className="text-charcoal/55">{label}</dt><dd className="font-medium text-charcoal">{value}</dd></div> : null;

  return <div className="mt-8 space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-lg bg-forest/5 p-1">
        {(["all", "unread", ...statuses.map((s) => s.value)] as const).map((v) => <button key={v} type="button" role="tab" aria-selected={filter === v} onClick={() => setFilter(v)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${filter === v ? "bg-white text-forest shadow-sm" : "text-charcoal/65 hover:text-forest"}`}>
          {v === "all" ? "All" : v === "unread" ? "Unread" : statusOf(v).label}
          <span className={`rounded-full px-1.5 text-xs tabular-nums ${v === "unread" && count(v) > 0 ? "bg-red-600 text-white" : filter === v ? "bg-forest text-ivory" : "bg-charcoal/10"}`}>{count(v)}</span>
        </button>)}
      </div>
      <label className="relative lg:w-80">
        <span className="sr-only">Search inquiries</span>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-charcoal/40"><Icon name="search" /></span>
        <input className={`${input} pl-9`} type="search" placeholder="Search name, company, email, product…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
    </div>

    <div className="grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <ul className="max-h-[70vh] divide-y divide-forest/10 overflow-y-auto rounded-xl border border-forest/15 bg-white shadow-sm" aria-label="Inquiries">
        {visible.length === 0 && <li className="p-6 text-center text-sm text-charcoal/60">No inquiries match.</li>}
        {visible.map((i) => <li key={i.id}>
          <button type="button" onClick={() => select(i)} aria-current={i.id === selectedId}
            className={`block w-full px-4 py-3.5 text-left transition-colors ${i.id === selectedId ? "bg-forest/5 shadow-[inset_3px_0_0_var(--color-forest)]" : "hover:bg-ivory"}`}>
            <span className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                {!i.read && <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Unread" />}
                <span className={`truncate ${i.read ? "font-medium text-charcoal/80" : "font-semibold text-charcoal"}`}>{i.company}</span>
              </span>
              <Badge status={i.status} />
            </span>
            <span className="mt-0.5 block truncate text-sm text-charcoal/65">{i.fullName} · {i.country}</span>
            <span className="mt-1 flex items-center justify-between gap-2 text-xs text-charcoal/50"><span className="truncate">{i.product} · {i.quantity} {i.unit}</span><span className="shrink-0">{new Date(i.createdAt).toLocaleDateString()}</span></span>
          </button>
        </li>)}
      </ul>

      {!selected && <div className="hidden min-h-[20rem] flex-col items-center justify-center rounded-xl border border-dashed border-forest/25 bg-white/60 p-8 text-center lg:flex">
        <Icon name="mail" className="h-8 w-8 text-forest/40" />
        <p className="mt-3 text-sm text-charcoal/60">Select an inquiry to read it.{count("unread") > 0 && <> You have <span className="font-medium text-red-700">{count("unread")} unread</span>.</>}</p>
      </div>}
      {selected && <article className="rounded-xl border border-forest/15 bg-white shadow-sm lg:sticky lg:top-24">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-forest/10 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="truncate text-2xl">{selected.company}</h2>
            <p className="mt-1 text-sm text-charcoal/60">{selected.fullName} · received {when(selected.createdAt)}</p>
          </div>
          <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Your ${selected.product} inquiry`)}`} className="inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-medium text-ivory hover:bg-charcoal"><Icon name="mail" />Reply by email</a>
        </header>
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            <dl className="divide-y divide-forest/10">
              {row("Email", selected.email)}
              {row("Country", selected.country)}
              {row("Buyer type", selected.buyerType)}
              {row("Product", selected.product)}
              {row("Quantity", `${selected.quantity} ${selected.unit}`)}
              {row("Intended use", selected.intendedUse)}
              {row("Packaging", selected.packaging)}
              {row("Shipping terms", selected.shippingTerms)}
              {row("Target date", selected.targetDate)}
              {selected.sample === "yes" && row("Samples", "Requested")}
            </dl>
            {selected.message && <div className="mt-4 rounded-lg bg-ivory/70 p-4"><p className="text-xs font-medium uppercase tracking-wider text-charcoal/50">Message</p><p className="mt-2 whitespace-pre-line text-sm leading-6">{selected.message}</p></div>}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-charcoal/50">
              <li className="inline-flex items-center gap-1.5"><Icon name={selected.emailed ? "check" : "mail"} className="h-3.5 w-3.5" />{selected.emailed ? "Email alert sent" : "No email alert"}</li>
              <li className="inline-flex items-center gap-1.5"><Icon name={selected.whatsapped ? "check" : "whatsapp"} className="h-3.5 w-3.5" />{selected.whatsapped ? "WhatsApp alert sent" : "No WhatsApp alert"}</li>
            </ul>
          </div>
          <aside className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Status</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {statuses.map((s) => <button key={s.value} type="button" disabled={busy} onClick={() => selected.status !== s.value && void update({ status: s.value })} aria-pressed={selected.status === s.value}
                  className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm transition-colors disabled:opacity-60 ${selected.status === s.value ? "border-forest bg-forest text-ivory" : "border-charcoal/15 text-charcoal/70 hover:border-forest/40"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${selected.status === s.value ? "bg-ivory" : s.dot}`} />{s.label}
                </button>)}
              </div>
            </fieldset>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Private notes</span>
              <textarea className={input} rows={5} value={notes} placeholder="Call notes, prices quoted, follow-up dates…" onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button type="button" disabled={busy || notes === selected.notes} onClick={() => void update({ notes })} className="w-full rounded-md border border-forest/30 px-3 py-2 text-sm text-forest hover:bg-forest/5 disabled:opacity-50">{busy ? "Saving…" : "Save notes"}</button>
            {message && <p role="status" className={`text-sm ${message.ok ? "text-forest" : "text-red-700"}`}>{message.text}</p>}
            <button type="button" disabled={busy} onClick={() => void update({ read: false })} className="flex items-center gap-1.5 text-sm text-charcoal/65 hover:text-forest hover:underline disabled:opacity-50"><Icon name="mail" />Mark as unread</button>
            <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex items-center gap-1.5 text-sm text-red-700 hover:underline disabled:opacity-50"><Icon name="trash" />Delete inquiry</button>
          </aside>
        </div>
      </article>}
    </div>
  </div>;
}
