import type { StageStatus } from "@/lib/journey/computeJourney";

const STYLES: Record<StageStatus, { label: string; className: string }> = {
  done: { label: "✓ Done", className: "bg-brand-100 text-brand-800" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800" },
  not_started: { label: "Not started", className: "bg-slate-100 text-slate-500" },
};

export default function StatusBadge({ status }: { status: StageStatus }) {
  const s = STYLES[status];
  return <span className={`pill ${s.className}`}>{s.label}</span>;
}
