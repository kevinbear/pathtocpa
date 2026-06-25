"use client";

import { useAppData } from "@/lib/data/AppDataProvider";
import {
  EXAM_WINDOWS,
  computeWindow,
  remainingLabel,
  type ExamWindowDef,
  type WindowState,
} from "@/lib/exam/windows";

const STATE_STYLES: Record<WindowState, { badge: string; bar: string; label: string }> = {
  ok: { badge: "bg-brand-100 text-brand-800", bar: "bg-brand-500", label: "On track" },
  soon: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500", label: "Coming up" },
  urgent: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", label: "Act now" },
  expired: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", label: "Expired" },
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function WindowCard({ def, startISO }: { def: ExamWindowDef; startISO: string }) {
  const { setProfile } = useAppData();
  const status = computeWindow(def, startISO, new Date());
  const s = STATE_STYLES[status.state];

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-900">{def.title}</p>
        <span className={`pill shrink-0 ${s.badge}`}>{remainingLabel(status.remainingDays)}</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{def.blurb}</p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${s.bar}`} style={{ width: `${status.elapsedPct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
        <span>Started {fmtDate(new Date(`${startISO}T00:00:00`))}</span>
        <span>
          {def.lengthLabel} · {status.state === "expired" ? "expired" : "by"} {fmtDate(status.deadline)}
        </span>
      </div>

      <p
        className={`mt-3 text-xs ${
          status.state === "urgent" || status.state === "expired" ? "text-red-700" : "text-slate-500"
        }`}
      >
        {status.state === "expired" ? "⚠ " : ""}
        If it lapses: {def.lapseNote}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs">
        <label className="flex items-center gap-2 text-slate-500">
          Start date
          <input
            type="date"
            value={startISO}
            onChange={(e) => setProfile({ [def.startField]: e.target.value || undefined })}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>
        {def.sources.map((src) => (
          <a
            key={src.url}
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-700 hover:underline"
          >
            {src.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function LockedRow({ def }: { def: ExamWindowDef }) {
  const { profile, setProfile } = useAppData();
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-4">
      <p className="font-semibold text-slate-700">{def.title}</p>
      <p className="mt-1 text-sm text-slate-500">{def.blurb}</p>
      <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {def.startLabel}
        <input
          type="date"
          value={(profile[def.startField] as string | undefined) ?? ""}
          onChange={(e) => setProfile({ [def.startField]: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <span className="text-slate-400">— set this to start the {def.lengthLabel} countdown.</span>
      </label>
    </div>
  );
}

export default function ExamWindows() {
  const { profile } = useAppData();

  return (
    <section className="card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        Exam deadlines & windows
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        The CPA exam has several time-bound windows that are easy to miss. Enter a date and we&apos;ll
        track the countdown. Cards appear as each clock starts.
      </p>

      <div className="mt-4 space-y-3">
        {EXAM_WINDOWS.map((def) => {
          const startISO = profile[def.startField] as string | undefined;
          return startISO ? (
            <WindowCard key={def.key} def={def} startISO={startISO} />
          ) : (
            <LockedRow key={def.key} def={def} />
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        California durations verified against the CBA and NASBA, but rules change — confirm on the{" "}
        <a
          href="https://www.dca.ca.gov/cba/applicants/exam-faqs.shtml"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          CBA Exam FAQs
        </a>
        . Planning aid, not official advice.
      </p>
    </section>
  );
}
