"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
    <div className="h-full origin-left bg-gradient-to-r from-forest to-[#D29A31]" style={{ transform: `scaleX(${progress})` }} />
  </div>;
}

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", short: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", short: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "WhatsApp", short: "WA", href: `https://wa.me/?text=${t}%20${u}` },
  ];
  const circle = "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-forest/15 bg-white px-2 text-xs font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-ivory";
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }
  return <div className="flex flex-wrap items-center gap-2">
    {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${link.label}`} title={`Share on ${link.label}`} className={circle}>{link.short}</a>)}
    <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" title="Share by email" className={circle}><Icon name="mail" /></a>
    <button type="button" onClick={() => void copy()} className={`${circle} gap-1.5 px-3`} aria-live="polite">
      <Icon name={copied ? "check" : "link"} />{copied ? "Copied" : "Copy link"}
    </button>
  </div>;
}
