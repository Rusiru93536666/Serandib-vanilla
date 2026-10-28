import { Skeleton } from "@/components/Loaders";

// Article-shaped fallback while a blog post loads.
export default function Loading() {
  return <div role="status" aria-live="polite" aria-label="Loading article" className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="mt-6 h-12 w-full" />
    <Skeleton className="mt-3 h-12 w-3/4" />
    <div className="mt-8 flex gap-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /></div>
    <Skeleton className="mt-10 aspect-[16/9] w-full rounded-[1.75rem]" />
    <div className="mt-10 space-y-3">
      {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map((w, i) => <Skeleton key={i} className={`h-4 ${w}`} />)}
    </div>
    <span className="sr-only">Loading…</span>
  </div>;
}
