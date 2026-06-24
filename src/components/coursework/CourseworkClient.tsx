"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppData } from "@/lib/data/AppDataProvider";
import ImportPanel from "@/components/coursework/ImportPanel";
import ProgressBar from "@/components/ProgressBar";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/eligibility/categories";
import { toSemesterUnits, round2 } from "@/lib/eligibility/units";
import californiaRuleSet from "@/lib/rules/california";
import type { Course, CourseCategory, UnitType } from "@/lib/eligibility/types";

type FormState = {
  name: string;
  units: string;
  unitType: UnitType;
  category: CourseCategory;
  institution: string;
  term: string;
  completed: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  units: "",
  unitType: "semester",
  category: "accounting",
  institution: "",
  term: "",
  completed: true,
};

export default function CourseworkClient() {
  const { hydrated, courses, addCourse, updateCourse, deleteCourse } = useAppData();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const units = Number(form.units);
    if (!form.name.trim()) return setError("Please enter a course name.");
    if (!Number.isFinite(units) || units <= 0)
      return setError("Units must be a number greater than 0.");

    const payload: Omit<Course, "id"> = {
      name: form.name.trim(),
      units,
      unitType: form.unitType,
      category: form.category,
      institution: form.institution.trim() || undefined,
      term: form.term.trim() || undefined,
      completed: form.completed,
    };

    if (editingId) updateCourse(editingId, payload);
    else addCourse(payload);
    resetForm();
  }

  function startEdit(c: Course) {
    setEditingId(c.id);
    setError(null);
    setForm({
      name: c.name,
      units: String(c.units),
      unitType: c.unitType,
      category: c.category,
      institution: c.institution ?? "",
      term: c.term ?? "",
      completed: c.completed,
    });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  const rules = californiaRuleSet.license;
  const reqRows = [
    { key: "accounting", label: "Accounting", current: round2(tally.by.accounting ?? 0), required: rules.accounting },
    { key: "business", label: "Business-related", current: round2(tally.by.business ?? 0), required: rules.business },
    { key: "accountingStudy", label: "Accounting study", current: round2(tally.by.accountingStudy ?? 0), required: rules.accountingStudy },
    { key: "ethics", label: "Ethics study", current: round2(tally.by.ethics ?? 0), required: rules.ethics },
  ];
  const pct = (c: number, r: number) => (r === 0 ? 100 : Math.min(100, Math.round((c / r) * 100)));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Coursework</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          My Coursework
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Add each course and we&apos;ll tally your units by category. Your data
          stays in this browser — no account needed.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Left: import + form + list */}
        <div>
          <ImportPanel />

          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {editingId ? "Edit course" : "Add a course"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Course name</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Intermediate Accounting I"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Units</span>
                <input
                  className={inputClass}
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                  inputMode="decimal"
                  placeholder="3"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Unit type</span>
                <select
                  className={inputClass}
                  value={form.unitType}
                  onChange={(e) =>
                    setForm({ ...form, unitType: e.target.value as UnitType })
                  }
                >
                  <option value="semester">Semester</option>
                  <option value="quarter">Quarter (× 2/3)</option>
                </select>
              </label>

              <label className="sm:col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Category</span>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as CourseCategory })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  {CATEGORIES.find((c) => c.key === form.category)?.help}
                </span>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  School <span className="text-slate-400">(optional)</span>
                </span>
                <input
                  className={inputClass}
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="CSU Fullerton"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Term <span className="text-slate-400">(optional)</span>
                </span>
                <input
                  className={inputClass}
                  value={form.term}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  placeholder="Fall 2025"
                />
              </label>

              <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  checked={form.completed}
                  onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                />
                Completed (uncheck if it&apos;s a planned / future course)
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {editingId ? "Save changes" : "Add course"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your courses ({courses.length})
          </h2>

          {!hydrated ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : courses.length === 0 ? (
            <div className="card text-center text-sm text-slate-500">
              No courses yet. Add your first one above to start tracking your
              eligibility.
            </div>
          ) : (
            <ul className="space-y-2">
              {courses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {c.name}
                      {!c.completed && (
                        <span className="pill ml-2 bg-amber-100 text-amber-700">
                          Planned
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.units} {c.unitType} units · {CATEGORY_LABEL[c.category]}
                      {c.institution ? ` · ${c.institution}` : ""}
                      {c.term ? ` · ${c.term}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(c)}
                      className="rounded-full px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(c.id)}
                      className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: live requirement progress */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Requirement progress
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Semester units toward each California requirement.
            </p>

            <div className="mt-4 space-y-3">
              {reqRows.map((r) => {
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
                    {tally.total + 1e-6 >= rules.totalUnits && (
                      <span className="text-brand-600"> ✓</span>
                    )}
                  </span>
                </div>
                <ProgressBar
                  percent={pct(tally.total, rules.totalUnits)}
                  satisfied={tally.total + 1e-6 >= rules.totalUnits}
                />
              </div>
            </div>

            {(tally.by.other ?? 0) > 0 && (
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>Other units (toward total only)</span>
                <span className="font-semibold text-slate-600">
                  {round2(tally.by.other ?? 0)}
                </span>
              </div>
            )}

            <Link
              href="/eligibility"
              className="mt-5 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Check my eligibility →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
