import type { BlogPost } from "@/lib/blog";

export { Icon, type IconName } from "@/components/Icon";

const statusStyles: Record<BlogPost["status"], string> = {
  published: "bg-forest/10 text-forest ring-forest/20",
  scheduled: "bg-amber-50 text-amber-800 ring-amber-600/25",
  draft: "bg-charcoal/5 text-charcoal/70 ring-charcoal/15",
};
const statusDots: Record<BlogPost["status"], string> = { published: "bg-forest", scheduled: "bg-amber-500", draft: "bg-charcoal/40" };

export function StatusBadge({ status }: { status: BlogPost["status"] }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles[status]}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`} />{status}
  </span>;
}

export const formatDate = (value: string | null) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";
