"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import { profileHasBachelors, profileWaivesAccountingStudy } from "@/lib/data/types";
import { evaluate } from "@/lib/eligibility/evaluate";
import californiaRuleSet from "@/lib/rules/california";
import type { Verdict } from "@/lib/eligibility/types";
import ProgressBar from "@/components/ProgressBar";
import DegreeFields from "@/components/DegreeFields";

function VerdictCard({ title, subtitle, verdict }: { title: string; subtitle: string; verdict: Verdict }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <span
          className={`pill ${
            verdict.eligible
              ? "bg-brand-100 text-brand-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {verdict.eligible ? "✓ Eligible" : "In progress"}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {verdict.categories.map((c) => (
          <div key={c.key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium capitalize text-slate-700">
                {c.label} units
              </span>
              <span className="text-slate-500">
                {c.completed} / {c.required}
                {c.satisfied && <span className="ml-1 text-brand-600">✓</span>}
              </span>
            </div>
            <ProgressBar percent={c.percent} satisfied={c.satisfied} />
          </div>
        ))}
      </div>

      {verdict.missing.length > 0 && (
        <div className="mt-5 rounded-xl bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Still needed
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {verdict.missing.map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span className="mt-0.5">▸</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function EligibilityClient() {
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Eligibility</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Eligibility Check
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Based on your coursework, here&apos;s where you stand for the CPA Exam
          and for California licensure.
        </p>
      </div>

      {!hydrated ? (
        <LoadingSkeleton />
      ) : courses.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-600">
            Add some coursework first and your eligibility will appear here.
          </p>
          <Link
            href="/coursework"
            className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700"
          >
            Add coursework →
          </Link>
        </div>
      ) : (
        <>
          {/* Controls */}
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

          <div className="mb-6 flex justify-end">
            <Link
              href="/eligibility/breakdown"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              See full breakdown →
            </Link>
          </div>

          <p className="mb-4 text-sm text-slate-500">
            Total semester units counted:{" "}
            <span className="font-semibold text-slate-800">
              {result.totalSemesterUnits}
            </span>{" "}
            / {californiaRuleSet.license.totalUnits}
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <VerdictCard
              title="CPA Exam"
              subtitle="Eligibility to sit for the exam"
              verdict={result.exam}
            />
            <VerdictCard
              title="Licensure"
              subtitle="The 150-unit requirement"
              verdict={result.license}
            />
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-slate-400">
        Rules last verified {californiaRuleSet.lastVerified}. This is a planning
        aid, not official advice — confirm with the{" "}
        <a
          href={californiaRuleSet.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {californiaRuleSet.authority}
        </a>
        .
      </p>
    </main>
  );
}
