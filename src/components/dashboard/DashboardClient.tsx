"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import { computeJourney } from "@/lib/journey/computeJourney";
import californiaRuleSet from "@/lib/rules/california";
import ProgressRing from "@/components/ProgressRing";
import StatusBadge from "@/components/StatusBadge";

function WelcomeHero() {
  return (
    <div className="card text-center">
      <h2 className="text-2xl font-bold text-slate-900">
        Welcome — let&apos;s map your path to CPA 🎓
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-slate-600">
        New here? Take the 1-minute plan finder — tell us your degree and major
        and we&apos;ll recommend the best route. Or jump straight to adding your
        coursework.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/start"
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-oncolor shadow-soft transition-colors hover:bg-brand-700"
        >
          Find your best path →
        </Link>
        <Link
          href="/coursework"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
        >
          Add your coursework
        </Link>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { hydrated, courses, profile } = useAppData();

  const journey = useMemo(
    () => computeJourney({ courses, profile }, californiaRuleSet),
    [courses, profile],
  );

  const hasData =
    courses.length > 0 ||
    profile.degreeLevel !== "none" ||
    profile.examSectionsPassed.length > 0 ||
    profile.experienceMonths > 0 ||
    profile.pethPassed ||
    profile.licenseSubmitted;

  const currentStage = journey.stages.find((s) => s.key === journey.currentStageKey);
  const currentIndex = journey.stages.findIndex((s) => s.key === journey.currentStageKey);

  return (
    <main className="mx-auto max-w-[104rem] px-6 py-12">
      <header className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">California · Dashboard</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          Path<span className="text-brand-600">To</span>CPA
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Your personal CPA licensure planner — eligibility, stages, and (soon)
          costs, all in one place.
        </p>
      </header>

      {!hydrated ? (
        <LoadingSkeleton />
      ) : !hasData ? (
        <WelcomeHero />
      ) : (
        <>
          {/* Overview: ring + current stage + next step */}
          <section className="card mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ProgressRing percent={journey.overallPercent} size={140} stroke={12}>
              <span className="text-3xl font-bold text-slate-900">
                {journey.overallPercent}%
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                complete
              </span>
            </ProgressRing>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
                {journey.allComplete
                  ? "All stages complete"
                  : `Stage ${currentIndex + 1} of 4 · ${currentStage?.title}`}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                Your next step
              </p>
              <p className="mt-1 text-slate-600">{journey.nextStep}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link
                  href="/journey"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700"
                >
                  View your journey
                </Link>
                <Link
                  href="/eligibility"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                >
                  Check eligibility
                </Link>
              </div>
            </div>
          </section>

          {/* Stage mini-cards */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {journey.stages.map((s) => (
              <div key={s.key} className="card flex flex-col items-center text-center">
                <ProgressRing percent={s.percent} size={84} stroke={8}>
                  <span className="text-lg font-bold text-slate-900">{s.percent}%</span>
                </ProgressRing>
                <p className="mt-3 text-2xl">{s.emoji}</p>
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{s.summary}</p>
                <div className="mt-3">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
