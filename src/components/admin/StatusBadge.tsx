import type { ReleaseStatus } from "@/types/db";

const STYLES: Record<ReleaseStatus, string> = {
  DRAFT: "bg-white/10 text-mist-300",
  PUBLISHED: "bg-emerald-500/15 text-emerald-300",
  ARCHIVED: "bg-amber-500/15 text-amber-300",
};

export default function StatusBadge({ status }: { status: ReleaseStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
