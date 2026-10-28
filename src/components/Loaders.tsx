"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

// Loading indicators shared across the site (styles in globals.css):
// - Splash: brand screen shown on a full page load; fades itself out with CSS so it can never get stuck
// - RouteProgress: thin bar along the top while a client navigation is in flight
// - Spinner: small ring for buttons, inherits the text color
// - Skeleton: shimmering placeholder block used by loading.tsx files

export function Splash() {
  return <div aria-hidden="true" className="splash fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ivory">
    <div className="relative h-24 w-24">
      <span className="splash-ring absolute inset-0 rounded-full border border-forest/15 border-t-forest" />
      <img src="/images/hero-flower.webp" alt="" width={640} height={640} className="splash-flower absolute inset-3 h-18 w-18" />
    </div>
    <p className="splash-word mt-6 font-serif text-2xl tracking-tight text-forest">{site.brand}</p>
    <span className="mt-4 block h-px w-28 overflow-hidden bg-forest/10"><span className="splash-bar block h-full w-full bg-forest" /></span>
  </div>;
}

export function RouteProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      clearTimeout(timer.current);
      setPhase("loading");
      timer.current = setTimeout(() => setPhase("idle"), 12000); // give up quietly if the navigation never lands
    };
    document.addEventListener("click", click);
    return () => { document.removeEventListener("click", click); clearTimeout(timer.current); };
  }, []);

  const loading = phase === "loading";
  useEffect(() => {
    if (!loading) return;
    clearTimeout(timer.current);
    setPhase("done");
    timer.current = setTimeout(() => setPhase("idle"), 450);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to the route landing

  return <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]">
    {phase !== "idle" && <span key={phase === "loading" ? "l" : "d"} className={`route-bar block h-full origin-left bg-gradient-to-r from-forest via-[#B07D22] to-cream shadow-[0_0_10px_rgb(176_125_34/60%)] ${phase === "done" ? "is-done" : ""}`} />}
  </div>;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span aria-hidden="true" className={`spinner inline-block shrink-0 rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />;
}
