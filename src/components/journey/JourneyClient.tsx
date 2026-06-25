"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import {
  computeJourney,
  EXAM_SLOTS,
  type Stage,
} from "@/lib/journey/computeJourney";
import californiaRuleSet from "@/lib/rules/california";
import ProgressRing from "@/components/ProgressRing";
import StatusBadge from "@/components/StatusBadge";
import ExamWindows from "@/components/journey/ExamWindows";
import type { ExamSection } from "@/lib/data/types";

export default function JourneyClient() {
  const { hydrated, courses, profile, setProfile } = useAppData();

  const journey = useMemo(
    () => computeJourney({ courses, profile }, californiaRuleSet),
    [courses, profile],
  );

  function toggleSection(section: ExamSection, checked: boolean) {
    const set = new Set(profile.examSectionsPassed);
    if (checked) set.add(section);
    else set.delete(section);
    setProfile({ examSectionsPassed: Array.from(set) });
  }

  function renderControls(stage: Stage) {
    switch (stage.key) {
      case "education":
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/coursework"
              className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-oncolor hover:bg-brand-700"
            >
              Edit coursework
            </Link>
            <Link
              href="/eligibility"
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              See eligibility detail
            </Link>
          </div>
        );
      case "exam":
        return (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {EXAM_SLOTS.map((slot) => (
              <label key={slot.key} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  checked={profile.examSectionsPassed.includes(slot.key)}
                  onChange={(e) => toggleSection(slot.key, e.target.checked)}
                />
                {slot.label}
              </label>
            ))}
          </div>
        );
      case "experience":
        return (
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            Months of qualifying experience:
            <input
              type="number"
              min={0}
              max={120}
              value={profile.experienceMonths}
              onChange={(e) =>
                setProfile({ experienceMonths: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-20 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            / 12
          </label>
        );
      case "ethics":
        return (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                checked={profile.pethPassed}
                onChange={(e) => setProfile({ pethPassed: e.target.checked })}
              />
              Passed the PETH professional ethics exam
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                checked={profile.licenseSubmitted}
                onChange={(e) => setProfile({ licenseSubmitted: e.target.checked })}
              />
              Submitted the CBA license application
            </label>
          </div>
        );
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Journey</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Your Journey
        </h1>
        <p className="mt-2 text-slate-600">
          The four stages of California CPA licensure. Update your progress and
          watch your overall completion grow.
        </p>
      </div>

      {!hydrated ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="card mb-8 flex items-center gap-4">
            <ProgressRing percent={journey.overallPercent} size={72} stroke={8}>
              <span className="text-sm font-bold text-slate-900">
                {journey.overallPercent}%
              </span>
            </ProgressRing>
            <div>
              <p className="font-semibold text-slate-900">Overall progress</p>
              <p className="text-sm text-slate-600">{journey.nextStep}</p>
            </div>
          </div>

          <div className="mb-8">
            <ExamWindows />
          </div>

          <ol className="relative space-y-4 border-l-2 border-slate-100 pl-10">
            {journey.stages.map((stage, i) => (
              <li key={stage.key} className="relative">
                <span
                  className={`absolute -left-[3.05rem] top-1 flex h-8 w-8 items-center justify-center rounded-full text-sm ring-4 ring-white ${
                    stage.status === "done"
                      ? "bg-brand-100"
                      : stage.key === journey.currentStageKey
                        ? "bg-amber-100"
                        : "bg-slate-100"
                  }`}
                >
                  {stage.emoji}
                </span>
                <div className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Stage {i + 1}
                      </p>
                      <h2 className="text-lg font-semibold text-slate-900">{stage.title}</h2>
                      <p className="text-sm text-slate-500">{stage.summary}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={stage.status} />
                      <p className="mt-1 text-sm font-semibold text-brand-700">
                        {stage.percent}%
                      </p>
                    </div>
                  </div>

                  {stage.nextActions.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {stage.nextActions.slice(0, 4).map((a) => (
                        <li key={a} className="flex items-start gap-2">
                          <span className="mt-0.5 text-brand-500">▸</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {renderControls(stage)}
                </div>
              </li>
            ))}
          </ol>

          {/* Guides live alongside the journey — deep dives on each stage. */}
          <Link
            href="/guides"
            className="card mt-8 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50"
          >
            <div>
              <p className="font-semibold text-slate-900">📚 Step-by-step guides</p>
              <p className="text-sm text-slate-500">
                Detailed walkthroughs for each stage — education, exam, experience, and ethics.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-brand-700">Open guides →</span>
          </Link>

          <p className="mt-8 text-xs text-slate-400">
            Stage definitions follow the {californiaRuleSet.authority}. This is a
            planning aid, not official advice — rules last verified{" "}
            {californiaRuleSet.lastVerified}.
          </p>
        </>
      )}
    </main>
  );
}
