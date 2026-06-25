"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import {
  computeJourney,
  EXAM_SLOTS,
  type Stage,
  type StageKey,
} from "@/lib/journey/computeJourney";
import californiaRuleSet from "@/lib/rules/california";
import ProgressRing from "@/components/ProgressRing";
import StatusBadge from "@/components/StatusBadge";
import ExamWindows from "@/components/journey/ExamWindows";
import type { ExamSection } from "@/lib/data/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

/** Ensure a user-pasted link has a protocol so it opens as an absolute URL. */
function withHttp(u: string): string {
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export default function JourneyClient() {
  const { hydrated, courses, profile, setProfile } = useAppData();

  const journey = useMemo(
    () => computeJourney({ courses, profile }, californiaRuleSet),
    [courses, profile],
  );
  const byKey = Object.fromEntries(journey.stages.map((s) => [s.key, s])) as Record<
    StageKey,
    Stage
  >;

  function toggleSection(section: ExamSection, checked: boolean) {
    const set = new Set(profile.examSectionsPassed);
    if (checked) set.add(section);
    else set.delete(section);
    setProfile({ examSectionsPassed: Array.from(set) });
  }

  function renderControls(stage: Stage) {
    switch (stage.key) {
      case "qualify":
      case "licenseEd":
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/coursework"
              className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-oncolor hover:bg-brand-700"
            >
              Edit coursework
            </Link>
            <Link
              href={stage.key === "licenseEd" ? "/eligibility/breakdown" : "/eligibility"}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              See eligibility detail
            </Link>
          </div>
        );
      case "exam":
        return (
          <>
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

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your review course
              </p>
              {profile.reviewPlatformUrl ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={withHttp(profile.reviewPlatformUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-oncolor hover:bg-brand-700"
                  >
                    Open {profile.reviewPlatformName?.trim() || "review course"} ↗
                  </a>
                  <button
                    onClick={() =>
                      setProfile({ reviewPlatformUrl: undefined, reviewPlatformName: undefined })
                    }
                    className="text-xs font-medium text-slate-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid gap-2 sm:grid-cols-[10rem_1fr]">
                  <input
                    className={inputClass}
                    value={profile.reviewPlatformName ?? ""}
                    onChange={(e) =>
                      setProfile({ reviewPlatformName: e.target.value || undefined })
                    }
                    placeholder="Becker, UWorld…"
                  />
                  <input
                    className={inputClass}
                    type="url"
                    value={profile.reviewPlatformUrl ?? ""}
                    onChange={(e) =>
                      setProfile({ reviewPlatformUrl: e.target.value || undefined })
                    }
                    placeholder="https://…  (paste your review dashboard link)"
                  />
                </div>
              )}
            </div>
          </>
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
      case "license":
        return (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                checked={!!profile.liveScanDone}
                onChange={(e) => setProfile({ liveScanDone: e.target.checked })}
              />
              Completed Live Scan fingerprinting
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
            <p className="text-xs text-slate-400">
              Note: California removed the PETH ethics exam on July 1, 2024 — it&apos;s no longer
              required.
            </p>
          </div>
        );
    }
  }

  function StageCard({ stage, label }: { stage: Stage; label: string }) {
    return (
      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <h2 className="mt-0.5 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span aria-hidden>{stage.emoji}</span> {stage.title}
            </h2>
            <p className="text-sm text-slate-500">{stage.summary}</p>
          </div>
          <div className="shrink-0 text-right">
            <StatusBadge status={stage.status} />
            <p className="mt-1 text-sm font-semibold text-brand-700">{stage.percent}%</p>
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
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Journey</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Your Journey</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          The real California path: qualify to sit, then the exam and experience run in parallel,
          then finish your licensure education and apply.
        </p>
      </div>

      {!hydrated ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="card mb-8 flex items-center gap-4">
            <ProgressRing percent={journey.overallPercent} size={72} stroke={8}>
              <span className="text-sm font-bold text-slate-900">{journey.overallPercent}%</span>
            </ProgressRing>
            <div>
              <p className="font-semibold text-slate-900">
                Overall progress · {journey.overallPercent}%
              </p>
              {journey.allComplete ? (
                <p className="mt-1 text-sm text-slate-600">{journey.nextStep}</p>
              ) : (
                <div className="mt-2 inline-flex flex-col gap-0.5 rounded-xl bg-brand-50 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                    👉 Your next step
                  </span>
                  <span className="text-sm font-medium text-brand-900">{journey.nextStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guides live alongside the journey — deep dives on each step. */}
          <Link
            href="/guides"
            className="card mb-8 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50"
          >
            <div>
              <p className="font-semibold text-slate-900">📚 Step-by-step guides</p>
              <p className="text-sm text-slate-500">
                Detailed walkthroughs for each step — education, exam, experience, and licensure.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-brand-700">Open guides →</span>
          </Link>

          <div className="space-y-6">
            <StageCard stage={byKey.qualify} label="Step 1" />

            {/* Steps 2 & 3 run concurrently. Exam sits beside its deadline windows. */}
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
                <span aria-hidden>⇄</span> Steps 2 &amp; 3 — these run in parallel
              </p>
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <StageCard stage={byKey.exam} label="Step 2" />
                <ExamWindows />
              </div>
              <div className="mt-6">
                <StageCard stage={byKey.experience} label="Step 3 · runs alongside the exam" />
              </div>
            </div>

            <StageCard stage={byKey.licenseEd} label="Step 4" />
            <StageCard stage={byKey.license} label="Step 5" />
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Stage definitions follow the {californiaRuleSet.authority}. This is a planning aid, not
            official advice — rules last verified {californiaRuleSet.lastVerified}.
          </p>
        </>
      )}
    </main>
  );
}
