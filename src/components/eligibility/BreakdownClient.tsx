"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import { profileHasBachelors, profileWaivesAccountingStudy, profileTotalUnits } from "@/lib/data/types";
import { evaluate } from "@/lib/eligibility/evaluate";
import californiaRuleSet from "@/lib/rules/california";
import { CALIFORNIA_REFERENCE } from "@/lib/rules/californiaReference";
import { CATEGORIES } from "@/lib/eligibility/categories";
import { looksMismatched, ALLOC_CATEGORY_LABEL } from "@/lib/rules/classify";
import type { CategoryProgress, CourseCategory } from "@/lib/eligibility/types";
import ProgressBar from "@/components/ProgressBar";
import DegreeFields from "@/components/DegreeFields";

/** Proper, human-readable names for each requirement section. */
const SECTION_TITLES: Record<CategoryProgress["key"], string> = {
  accounting: "Accounting Subjects",
  business: "Business-Related Subjects",
  accountingStudy: "Accounting Study",
  ethics: "Ethics Study",
  other: "Other",
  total: "Total Semester Units",
};

function RequirementDetail({ progress }: { progress: CategoryProgress }) {
  const { updateCourse } = useAppData();
  const [open, setOpen] = useState(false);
  const reference = CALIFORNIA_REFERENCE.find((r) => r.key === progress.key);
  const title = SECTION_TITLES[progress.key] ?? progress.label;

  // Real courses (movable) first, sorted by units; synthetic rows (overflow, subtotals) after.
  const contributors = [...(progress.contributors ?? [])].sort((a, b) => {
    if (!!a.courseId !== !!b.courseId) return a.courseId ? -1 : 1;
    return b.units - a.units;
  });

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
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
      {progress.selfReportedNote && (
        <p className="mt-1 text-xs text-slate-500">{progress.selfReportedNote}</p>
      )}

      {/* Your contributing courses (with a "move to another requirement" control) */}
      {contributors.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Counted from your courses
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {contributors.map((c, i) => {
              const expected =
                progress.key === "accounting" || progress.key === "business" || progress.key === "ethics"
                  ? progress.key
                  : null;
              const m = expected && c.courseId
                ? looksMismatched(c.name, expected)
                : { mismatch: false, guess: null };
              const mismatch = m.mismatch;
              const guess = m.guess;
              return (
              <li
                key={c.courseId ?? `${c.name}-${i}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="min-w-0 truncate text-slate-700">
                  {mismatch && guess && (
                    <span
                      className="mr-1 text-amber-500"
                      title={`Looks like a ${ALLOC_CATEGORY_LABEL[guess]} course — doesn't usually count toward ${progress.label}`}
                    >
                      ⚠
                    </span>
                  )}
                  {c.name}
                  {c.note && <span className="ml-1 text-xs text-slate-400">({c.note})</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-medium text-slate-600">{c.units}</span>
                  {c.courseId && c.category && (
                    <select
                      aria-label={`Move ${c.name} to another requirement`}
                      className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      value={c.category}
                      onChange={(e) =>
                        updateCourse(c.courseId as string, {
                          category: e.target.value as CourseCategory,
                        })
                      }
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  )}
                </span>
              </li>
              );
            })}
          </ul>
          {contributors.some((c) => c.courseId) && (
            <p className="mt-2 text-xs text-slate-400">
              Tip: use a course&apos;s dropdown to move it to another requirement (e.g. count
              Auditing toward Ethics Study instead of Accounting).
            </p>
          )}
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
          totalUnitsSelfReported: profileTotalUnits(profile).value,
          totalUnitsMeetsMinimum: profileTotalUnits(profile).meetsMinimum,
        },
        californiaRuleSet,
        { countPlanned },
      ),
    [courses, profile, countPlanned],
  );

  // The license verdict covers all five requirements; show "total" last.
  const order = ["accounting", "business", "accountingStudy", "ethics", "total"];
  const requirements = [...result.license.categories].sort(
    (a, b) => order.indexOf(a.key) - order.indexOf(b.key),
  );

  return (
    <main className="mx-auto max-w-[104rem] px-6 py-12">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/eligibility" className="text-sm font-medium text-brand-700 hover:underline">
            ← Back to eligibility
          </Link>
          <Link
            href="/allocate"
            className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-oncolor hover:bg-brand-700"
          >
            Drag-and-drop allocate →
          </Link>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Requirement Breakdown
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A category-by-category view of what counts, what you&apos;ve used, and what&apos;s
          left — like a size chart for your California CPA education.
        </p>
      </div>

      {!hydrated ? (
        <LoadingSkeleton />
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
