"use client";
import { useState } from "react";
import { inquirySchema, MULTIPLE_PRODUCTS } from "@/lib/schema";
import { Icon } from "@/components/Icon";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "ok" | "error"; msg: string };
const buyers = ["Importer","Wholesaler","Distributor","Food manufacturer","Bakery","Tea brand","Private-label buyer","Other"];
const f = "w-full rounded-lg border border-charcoal/20 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-charcoal/35 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200";
const choice = "flex cursor-pointer items-center justify-center rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-center text-sm text-charcoal/75 shadow-sm transition-colors hover:border-forest/40 has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-ivory has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest has-[:focus-visible]:ring-offset-2";

function Group({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return <fieldset className="border-t border-forest/10 pt-7 first:border-0 first:pt-0">
    <legend className="contents"><span className="mb-5 flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-semibold text-ivory">{step}</span><span className="font-serif text-xl text-forest">{title}</span></span></legend>
    <div className="grid gap-5 sm:grid-cols-2">{children}</div>
  </fieldset>;
}

export default function QuoteForm({ products, defaultProduct = "" }: { products: string[]; defaultProduct?: string }) {
  const options = [...products, MULTIPLE_PRODUCTS];
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, unknown>;
    raw.consent = fd.get("consent") === "on";
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      setStatus({ kind: "error", msg: "Please correct the highlighted fields." });
      document.getElementById(Object.keys(fieldErrors)[0])?.focus();
      return;
    }
    setErrors({}); setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const j = await res.json();
      if (res.ok && j.ok) { setStatus({ kind: "ok", msg: j.message }); (e.target as HTMLFormElement).reset(); }
      else { setErrors(j.errors ?? {}); setStatus({ kind: "error", msg: j.message ?? "Something went wrong." }); }
    } catch { setStatus({ kind: "error", msg: "Network error. Check your connection and try again." }); }
  }

  if (status.kind === "ok") {
    return <div role="status" className="flex flex-col items-center py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/10 text-forest"><Icon name="check" className="h-8 w-8" /></span>
      <h2 className="mt-5 text-3xl">Inquiry sent</h2>
      <p className="mt-3 max-w-md leading-7 text-charcoal/70">{status.msg}</p>
      <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-7 rounded-full border border-forest/25 px-5 py-2.5 text-sm text-forest hover:border-forest">Send another inquiry</button>
    </div>;
  }

  const err = (name: string) => errors[name] && <p id={`${name}-err`} className="mt-1.5 flex items-center gap-1 text-sm text-red-700">{errors[name]![0]}</p>;
  const field = (name: string, label: string, el: React.ReactNode, optional = false) => (
    <div>
      <label htmlFor={name} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-charcoal/85">{label}{optional && <span className="text-xs font-normal text-charcoal/45">Optional</span>}</label>
      {el}
      {err(name)}
    </div>
  );
  const p = (name: string) => ({ id: name, name, className: f, "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `${name}-err` : undefined });
  const sel = (name: string, opts: string[], def = "") => (
    <select {...p(name)} defaultValue={def}><option value="" disabled>Select…</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7">
      <div className="hidden" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

      <Group step={1} title="What do you need?">
        <div className="sm:col-span-2" role="radiogroup" aria-labelledby="product-label" aria-describedby={errors.product ? "product-err" : undefined}>
          <p id="product-label" className="mb-1.5 text-sm font-medium text-charcoal/85">Product</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {options.map((o, i) => <label key={o} className={choice}><input type="radio" name="product" id={i === 0 ? "product" : undefined} value={o} defaultChecked={o === defaultProduct} className="sr-only" />{o}</label>)}
          </div>
          {err("product")}
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          {field("quantity", "Required quantity", <input {...p("quantity")} inputMode="decimal" placeholder="e.g. 50" />)}
          {field("unit", "Unit", <select {...p("unit")} defaultValue=""><option value="" disabled>Select…</option><option value="g">g</option><option value="kg">KG</option><option value="units">Units</option></select>)}
        </div>
        {field("intendedUse", "Intended use", <input {...p("intendedUse")} placeholder="e.g. ice cream, extract, retail" />, true)}
      </Group>

      <Group step={2} title="About you">
        {field("fullName", "Full name", <input {...p("fullName")} autoComplete="name" />)}
        {field("company", "Company name", <input {...p("company")} autoComplete="organization" />)}
        {field("email", "Business email", <input {...p("email")} type="email" autoComplete="email" placeholder="you@company.com" />)}
        {field("country", "Country", <input {...p("country")} autoComplete="country-name" />)}
        <div className="sm:col-span-2">{field("buyerType", "Buyer type", sel("buyerType", buyers))}</div>
      </Group>

      <Group step={3} title="Delivery details">
        {field("shippingTerms", "Preferred shipping terms", sel("shippingTerms", ["Not sure","FOB","CIF","Other"], "Not sure"))}
        {field("targetDate", "Target delivery date", <input {...p("targetDate")} type="date" />, true)}
        <div className="sm:col-span-2">{field("packaging", "Packaging requirements", <input {...p("packaging")} placeholder="e.g. vacuum-packed 1 kg bags" />, true)}</div>
        <div className="sm:col-span-2">{field("message", "Anything else?", <textarea {...p("message")} rows={4} placeholder="Grade, moisture, certifications, or questions for us" />, true)}</div>
      </Group>

      <div className="space-y-5 rounded-xl bg-ivory/70 p-5">
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" name="consent" id="consent" aria-invalid={!!errors.consent} className="mt-0.5 h-4 w-4 accent-forest" />I agree to be contacted about this inquiry.</label>
          {err("consent")}
        </div>
        <button disabled={status.kind === "loading"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 font-medium text-ivory shadow-lg shadow-forest/20 transition hover:bg-charcoal disabled:opacity-60 sm:w-auto">
          <Icon name="send" />{status.kind === "loading" ? "Sending…" : "Send inquiry"}
        </button>
        <div role="status" aria-live="polite">
          {status.kind === "error" && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{status.msg}</p>}
        </div>
      </div>
    </form>
  );
}
