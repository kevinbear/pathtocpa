"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import { profileHasBachelors, profileWaivesAccountingStudy } from "@/lib/data/types";
import { evaluate } from "@/lib/eligibility/evaluate";
import californiaRuleSet from "@/lib/rules/california";
import { CALIFORNIA_REFERENCE } from "@/lib/rules/californiaReference";
import type { CategoryProgress } from "@/lib/eligibility/types";
import ProgressBar from "@/components/ProgressBar";
import DegreeFields from "@/components/DegreeFields";

function RequirementDetail({ progress }: { progress: CategoryProgress }) {
  const [open, setOpen] = useState(false);
  const reference = CALIFORNIA_REFERENCE.find((r) => r.key === progress.key);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold capitalize text-slate-900">
            {progress.label} units
          </h2>
          <p className="text-sm text-slate-500">
            {progress.waived ? (
              <span className="text-brand-700">Waived ✓</span>
            ) : (
              <>
                {progress.completed} of {progress.required} units
                {progress.satisfied && <span className="text-brand-600"> ✓</span>}
              </>
            )}
          </p>
        </div>
        <span className="text-right text-sm font-semibold text-brand-700">
          {progress.waived ? "100%" : `${progress.percent}%`}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar percent={progress.percent} satisfied={progress.satisfied} />
      </div>

      {/* Status line */}
      <p className="mt-3 text-sm">
        {progress.waived ? (
          <span className="text-brand-700">{progress.waivedNote}</span>
        ) : progress.satisfied ? (
          <span className="text-brand-700">Requirement met. 🎉</span>
        ) : (
          <span className="text-amber-700">
            {progress.remaining} more unit{progress.remaining === 1 ? "" : "s"} to go.
          </span>
        )}
      </p>

      {progress.overflowNote && (
        <p className="mt-1 text-xs text-slate-500">{progress.overflowNote}</p>
      )}

      {/* Your contributing courses */}
      {progress.contributors && progress.contributors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Counted from your courses
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {progress.contributors.map((c, i) => (
              <li key={`${c.name}-${i}`} className="flex justify-between gap-3">
                <span className="text-slate-700">
                  {c.name}
                  {c.note && <span className="ml-1 text-xs text-slate-400">({c.note})</span>}
                </span>
                <span className="font-medium text-slate-600">{c.units}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The "size chart" — what counts */}
      {reference && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            {open ? "Hide" : "What counts here?"} ↓
          </button>
          {open && (
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-700">Accepted subjects</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                {reference.subjects.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand-500">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {reference.notes.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-slate-500">
                  {reference.notes.map((n) => (
                    <li key={n}>— {n}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BreakdownClient() {
  const { hydrated, courses, profile } = useAppData();
  const [countPlanned, setCountPlanned] = useState(false);

  const result = useMemo(
    () =>
      evaluate(
        {
          courses,
          hasBachelorsDegree: profileHasBachelors(profile),
          waivesAccountingStudy: profileWaivesAccountingStudy(profile),
        },
        californiaRuleSet,
        { countPlanned },
      ),
    [courses, profile, countPlanned],
  );

  // The license verdict covers all five requirements (incl. total).
  const requirements = result.license.categories;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6">
        <Link href="/eligibility" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to eligibility
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Requirement Breakdown
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A category-by-category view of what counts, what you&apos;ve used, and what&apos;s
          left — like a size chart for your California CPA education.
        </p>
      </div>

      {!hydrated ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="card mb-6 space-y-4">
            <DegreeFields />
            <label className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                checked={countPlanned}
                onChange={(e) => setCountPlanned(e.target.checked)}
              />
              Include planned courses (projection)
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {requirements.map((r) => (
              <RequirementDetail key={r.key} progress={r} />
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Subject lists are from the {californiaRuleSet.authority} Educational Requirements
            Tip Sheet. Rules last verified {californiaRuleSet.lastVerified}. This is a planning
            aid, not official advice — confirm with the{" "}
            <a href={californiaRuleSet.sourceUrl} target="_blank" rel="noreferrer" className="underline">
              CBA
            </a>
            .
          </p>
        </>
      )}
    </main>
  );
}
