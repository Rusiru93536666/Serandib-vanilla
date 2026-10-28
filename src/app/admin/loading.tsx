import { Skeleton } from "@/components/Loaders";

// Dashboard-shaped fallback for admin screens.
export default function Loading() {
  return <div role="status" aria-live="polite" aria-label="Loading" className="mx-auto max-w-6xl px-5 py-12">
    <Skeleton className="h-9 w-56" />
    <Skeleton className="mt-3 h-4 w-80 max-w-full" />
    <div className="mt-10 space-y-3">
      {[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex items-center gap-4 rounded-xl border border-forest/10 bg-white/70 p-4">
        <Skeleton className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
        <Skeleton className="hidden h-8 w-24 sm:block" />
      </div>)}
    </div>
    <span className="sr-only">Loading…</span>
  </div>;
}
