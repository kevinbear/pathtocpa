"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import type { DegreeLevel, MastersField } from "@/lib/data/types";
import { diagnose, PATHS, type MajorKind } from "@/lib/diagnosis/diagnose";
import californiaRuleSet from "@/lib/rules/california";

const selectClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

/** California's licensure routes. The 120-unit route is new under AB 1175 (effective Jan 1, 2027). */
const LICENSURE_PATHWAYS = [
  {
    key: "traditional",
    name: "150-credit traditional route",
    education:
      "Bachelor's + 30 more units — 150 total, including 24 accounting, 24 business-related, 20 accounting study, and 10 ethics study.",
    experience: "1 year of supervised general accounting experience.",
    note: undefined as string | undefined,
    badge: "Available now",
    isNew: false,
  },
  {
    key: "graduate",
    name: "Graduate degree route",
    education:
      "A qualifying master's (or post-baccalaureate) in accounting or taxation, within the 150 units.",
    experience:
      "1 year of supervised experience — the advanced degree substitutes for the second year.",
    note: undefined as string | undefined,
    badge: "Available now",
    isNew: false,
  },
  {
    key: "ab1175",
    name: "120-credit bachelor's route",
    education: "Bachelor's degree with an accounting concentration — 120 semester units.",
    experience: "2 years of general accounting experience, supervised by a licensed CPA.",
    note: "A qualifying master's can substitute for 1 year (or an approved certificate program for 6 months).",
    badge: "New — from Jan 1, 2027",
    isNew: true,
  },
];

export default function StartClient() {
  const { profile, setProfile } = useAppData();
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(profile.degreeLevel ?? "none");
  const [mastersField, setMastersField] = useState<MastersField>(profile.mastersField ?? "accounting");
  const [major, setMajor] = useState<MajorKind>(profile.undergradMajor ?? "accounting");
  const [saved, setSaved] = useState(false);

  const result = useMemo(
    () => diagnose({ degreeLevel, mastersField: degreeLevel === "masters" ? mastersField : undefined, major }),
    [degreeLevel, mastersField, major],
  );
  const recommended = PATHS.find((p) => p.key === result.recommendedKey);
  const lic = californiaRuleSet.license;

  function apply() {
    setProfile({
      degreeLevel,
      mastersField: degreeLevel === "masters" ? mastersField : undefined,
      undergradMajor: major,
    });
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <span className="pill bg-brand-100 text-brand-800">Get started</span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Find your best path</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Answer three quick questions and we&apos;ll recommend the most sensible route to your
        California CPA license, with what each option requires.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Questions */}
        <div className="card h-fit">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Your background</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Highest degree</span>
              <select className={selectClass} value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}>
                <option value="none">None yet</option>
                <option value="bachelors">Bachelor&apos;s</option>
                <option value="masters">Master&apos;s</option>
              </select>
            </label>

            {degreeLevel === "masters" && (
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Master&apos;s field</span>
                <select className={selectClass} value={mastersField} onChange={(e) => setMastersField(e.target.value as MastersField)}>
                  <option value="accounting">Accounting</option>
                  <option value="taxation">Taxation</option>
                  <option value="laws_in_taxation">Laws in Taxation</option>
                  <option value="other">Other field</option>
                </select>
              </label>
            )}

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Undergraduate major</span>
              <select className={selectClass} value={major} onChange={(e) => setMajor(e.target.value as MajorKind)}>
                <option value="accounting">Accounting</option>
                <option value="business">Business (non-accounting)</option>
                <option value="other">Other / non-business</option>
              </select>
            </label>

            <button
              onClick={apply}
              className="w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700"
            >
              {saved ? "✓ Saved to your profile" : "Apply to my profile"}
            </button>
            {saved && (
              <p className="text-xs text-slate-500">
                Your degree is set — your eligibility now reflects it.{" "}
                <Link href="/coursework" className="font-medium text-brand-700 underline">
                  Add your coursework →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Result */}
        <div>
          <div className="card ring-2 ring-brand-400">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Our recommendation</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{result.headline}</h2>
            {recommended && <p className="mt-1 font-medium text-brand-700">→ {recommended.title}</p>}
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              {result.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-500">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements snapshot */}
          <div className="card mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              California requirements at a glance
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                ["Total units", lic.totalUnits],
                ["Accounting", lic.accounting],
                ["Business-related", lic.business],
                ["Accounting study", lic.accountingStudy],
                ["Ethics study", lic.ethics],
                ["Bachelor's", "required"],
              ].map(([label, val]) => (
                <div key={label as string} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-lg font-bold text-brand-600">{val}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All options */}
      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Every option, compared
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        {PATHS.filter((p) => p.key !== "bachelors_first" || degreeLevel === "none").map((p) => {
          const isRec = p.key === result.recommendedKey;
          return (
            <div
              key={p.key}
              className={`card ${isRec ? "ring-2 ring-brand-400" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                {isRec && <span className="pill bg-brand-100 text-brand-800">Recommended</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Best for: {p.bestFor}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {p.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand-500">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* The three CA licensure pathways */}
      <section className="mt-12">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          The three California licensure pathways
        </h2>
        <p className="mb-4 max-w-3xl text-sm text-slate-600">
          There&apos;s more than one road to the license. Today the 150-unit and graduate routes
          apply. Starting <strong>January 1, 2027</strong>, California&apos;s AB 1175 adds a
          120-unit + 2-year route. During 2027–2028 both the old and new rules are valid; from 2029
          only the new requirements remain.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {LICENSURE_PATHWAYS.map((p) => (
            <div
              key={p.key}
              className={`card ${p.isNew ? "ring-2 ring-amber-400" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <span
                  className={`pill shrink-0 ${
                    p.isNew ? "bg-amber-100 text-amber-800" : "bg-brand-100 text-brand-800"
                  }`}
                >
                  {p.badge}
                </span>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Education
                  </p>
                  <p className="text-slate-700">{p.education}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Experience
                  </p>
                  <p className="text-slate-700">{p.experience}</p>
                </div>
                {p.note && <p className="text-xs text-slate-500">{p.note}</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Sources:{" "}
          <a
            href="https://www.calcpa.org/whats-happening/press/governor-signs-ab-1175-modernizing-cpa-licensure-in-california"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            CalCPA — AB 1175
          </a>{" "}
          ·{" "}
          <a
            href="https://www.dca.ca.gov/cba/outreach/guide-to-the-new-cpa-licensure-requirements.shtml"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            CBA — new licensure requirements
          </a>
          .
        </p>
      </section>

      <p className="mt-8 text-xs text-slate-400">
        This is a planning aid, not official advice. Requirements vary — always confirm with the{" "}
        <a href={californiaRuleSet.sourceUrl} target="_blank" rel="noreferrer" className="underline">
          California Board of Accountancy
        </a>
        .
      </p>
    </main>
  );
}
