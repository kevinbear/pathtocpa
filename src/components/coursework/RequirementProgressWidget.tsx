"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import { profileWaivesAccountingStudy } from "@/lib/data/types";
import { toSemesterUnits, round2 } from "@/lib/eligibility/units";
import californiaRuleSet from "@/lib/rules/california";
import ProgressBar from "@/components/ProgressBar";

/**
 * A floating, collapsible requirement-progress widget pinned to the bottom-right.
 * Collapsed by default (a small pill showing overall %); click to expand the full
 * breakdown. Stays visible while scrolling the coursework table.
 */
export default function RequirementProgressWidget() {
  const { hydrated, courses, profile } = useAppData();
  const [open, setOpen] = useState(false);

  const tally = useMemo(() => {
    const by: Record<string, number> = {};
    let total = 0;
    for (const c of courses) {
      const u = toSemesterUnits(c.units, c.unitType);
      by[c.category] = (by[c.category] ?? 0) + u;
      total += u;
    }
    return { by, total: round2(total) };
  }, [courses]);

  const rules = californiaRuleSet.license;
  const waived = profileWaivesAccountingStudy(profile);
  const overflow = Math.max(0, round2((tally.by.accounting ?? 0) - rules.accounting));
  const rows = [
    { key: "accounting", label: "Accounting", current: round2(tally.by.accounting ?? 0), required: rules.accounting },
    { key: "business", label: "Business-related", current: round2((tally.by.business ?? 0) + overflow), required: rules.business },
    {
      key: "accountingStudy",
      label: waived ? "Accounting study (waived)" : "Accounting study",
      current: waived ? rules.accountingStudy : round2(tally.by.accountingStudy ?? 0),
      required: rules.accountingStudy,
    },
    { key: "ethics", label: "Ethics study", current: round2(tally.by.ethics ?? 0), required: rules.ethics },
  ];
  const pct = (c: number, r: number) => (r === 0 ? 100 : Math.min(100, Math.round((c / r) * 100)));

  if (!hydrated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30 print:hidden">
      {open ? (
        <div className="w-72 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Requirement progress
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Collapse progress"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {rows.map((r) => {
              const done = r.current + 1e-6 >= r.required;
              return (
                <div key={r.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-600">{r.label}</span>
                    <span className="text-slate-500">
                      {r.current} / {r.required}
                      {done && <span className="text-brand-600"> ✓</span>}
                    </span>
                  </div>
                  <ProgressBar percent={pct(r.current, r.required)} satisfied={done} />
                </div>
              );
            })}
            <div className="border-t border-slate-100 pt-3">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Total units</span>
                <span className="text-slate-500">
                  {tally.total} / {rules.totalUnits}
                </span>
              </div>
              <ProgressBar
                percent={pct(tally.total, rules.totalUnits)}
                satisfied={tally.total + 1e-6 >= rules.totalUnits}
              />
            </div>
          </div>
          <Link
            href="/eligibility"
            className="mt-4 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-oncolor transition-colors hover:bg-brand-700"
          >
            Check my eligibility →
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-oncolor shadow-soft transition-colors hover:bg-brand-700"
        >
          📊 Progress
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {pct(tally.total, rules.totalUnits)}%
          </span>
        </button>
      )}
    </div>
  );
}
