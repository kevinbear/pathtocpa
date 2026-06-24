export default function ProgressBar({
  percent,
  satisfied,
}: {
  percent: number;
  satisfied: boolean;
}) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${
          satisfied ? "bg-brand-500" : "bg-amber-400"
        }`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
