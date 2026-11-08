import { Skeleton } from "@/components/Loaders";

// Article-shaped fallback while a blog post loads, mirroring the full-width post layout.
export default function Loading() {
  return <div role="status" aria-live="polite" aria-label="Loading article">
    <div className="border-b border-forest/10 bg-gradient-to-b from-cream/40 to-ivory">
      <div className="mx-auto grid w-full max-w-[96rem] items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-12 lg:py-16 xl:gap-16">
        <div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="mt-3 h-12 w-3/4" />
          <Skeleton className="mt-6 h-5 w-5/6" />
          <div className="mt-8 flex gap-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-20" /></div>
        </div>
        <Skeleton className="aspect-[16/10] w-full rounded-[1.75rem]" />
      </div>
    </div>
    <div className="mx-auto grid w-full max-w-[96rem] gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14 2xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="mx-auto w-full max-w-[60rem] space-y-3">
        {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3", "w-full", "w-11/12"].map((w, i) => <Skeleton key={i} className={`h-4 ${w}`} />)}
      </div>
      <div className="space-y-6"><Skeleton className="hidden h-56 w-full rounded-3xl lg:block" /><Skeleton className="h-80 w-full rounded-3xl" /><Skeleton className="h-48 w-full rounded-3xl" /></div>
    </div>
    <span className="sr-only">Loading…</span>
  </div>;
}
