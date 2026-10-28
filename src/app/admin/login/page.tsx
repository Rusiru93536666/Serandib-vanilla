"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Loaders";
export default function Login() {
  const router = useRouter(); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const password = new FormData(e.currentTarget).get("password");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).catch(() => null);
    if (r?.ok) { router.push("/admin"); router.refresh(); return; }
    setErr(r ? (await r.json()).message : "Network error."); setBusy(false);
  }
  
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-4xl">Admin sign in</h1>
      <form onSubmit={go} className="mt-8 space-y-4">
        <label className="block text-sm font-medium" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="w-full border border-charcoal/25 bg-white px-3 py-2.5" />
        <button disabled={busy} className="inline-flex items-center gap-2 bg-forest px-6 py-2.5 text-ivory disabled:opacity-60">{busy ? <><Spinner />Signing in…</> : "Sign in"}</button>
        <p role="alert" className="text-sm text-red-700">{err}</p>
      </form>
    </div>
  );
}
