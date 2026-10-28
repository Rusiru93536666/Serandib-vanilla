import { Skeleton } from "@/components/Loaders";

// Instant fallback while any page streams in: page-header shape plus a card grid.
export default function Loading() {
  return <div role="status" aria-live="polite" aria-label="Loading page">
    <section className="border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="mt-6 h-14 w-full max-w-2xl" />
        <Skeleton className="mt-3 h-14 w-2/3 max-w-xl" />
        <Skeleton className="mt-8 h-4 w-full max-w-xl" />
        <Skeleton className="mt-3 h-4 w-4/5 max-w-lg" />
      </div>
    </section>
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="rounded-[1.75rem] border border-forest/10 bg-white/60 p-4">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <Skeleton className="mt-5 h-6 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>)}
    </div>
    <span className="sr-only">Loading…</span>
  </div>;
}
