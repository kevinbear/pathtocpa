"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useState } from "react";
import { useAppData } from "@/lib/data/AppDataProvider";
import ImportPanel from "@/components/coursework/ImportPanel";
import RequirementProgressWidget from "@/components/coursework/RequirementProgressWidget";
import ConfirmModal from "@/components/ConfirmModal";
import { CATEGORIES } from "@/lib/eligibility/categories";
import { ALLOCATION_TAXONOMY } from "@/lib/rules/allocationTaxonomy";
import { toSemesterUnits, round2 } from "@/lib/eligibility/units";
import type { Course, CourseCategory, UnitType } from "@/lib/eligibility/types";

/** Sub-categories (subjects) per main category, from the CBA taxonomy. */
const SUBCATS: Record<string, { id: string; label: string }[]> = Object.fromEntries(
  ALLOCATION_TAXONOMY.map((s) => [s.key, s.subzones.map((z) => ({ id: z.id, label: z.label }))]),
);

/** Shorten with a trailing "*" to signal there's more text than fits. */
function truncStar(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max).trimEnd()}*` : s;
}

type FormState = {
  code: string;
  name: string;
  units: string;
  unitType: UnitType;
  category: CourseCategory;
  subject: string;
  institution: string;
  term: string;
  completed: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  name: "",
  units: "",
  unitType: "semester",
  category: "accounting",
  subject: "",
  institution: "",
  term: "",
  completed: true,
};

export default function CourseworkClient() {
  const { hydrated, courses, addCourse, updateCourse, deleteCourse } = useAppData();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const deleteTarget = courses.find((c) => c.id === deleteId);
  const allLocked = courses.length > 0 && courses.every((c) => c.locked);

  function toggleLockAll() {
    const target = !allLocked;
    courses.forEach((c) => updateCourse(c.id, { locked: target }));
  }

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
      code: form.code.trim() || undefined,
      name: form.name.trim(),
      units,
      unitType: form.unitType,
      category: form.category,
      subject: form.subject || undefined,
      institution: form.institution.trim() || undefined,
      term: form.term.trim() || undefined,
      completed: form.completed,
    };

    if (editingId) updateCourse(editingId, payload);
    else addCourse({ ...payload, locked: true }); // new rows are locked by default
    resetForm();
  }


  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
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

      <div className="space-y-8">
        {/* Import + add form, side by side. The form fades out while importing. */}
        <div className={`grid items-start gap-6 ${importing ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
          <ImportPanel onPreviewActive={setImporting} />

          <div
            aria-hidden={importing}
            className={`transition-all duration-300 ease-out ${
              importing
                ? "max-h-0 -translate-y-2 overflow-hidden opacity-0"
                : "max-h-[200rem] translate-y-0 opacity-100"
            }`}
          >
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
                <span className="mb-1 block font-medium text-slate-700">
                  Course code <span className="text-slate-400">(optional)</span>
                </span>
                <input
                  className={inputClass}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="ACCT 301A"
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
                    setForm({ ...form, category: e.target.value as CourseCategory, subject: "" })
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

              {(SUBCATS[form.category]?.length ?? 0) > 0 && (
                <label className="sm:col-span-2 block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    Sub-category <span className="text-slate-400">(optional)</span>
                  </span>
                  <select
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="">— General / unsorted —</option>
                    {SUBCATS[form.category].map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

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
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-oncolor transition-colors hover:bg-brand-700"
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
          </div>
        </div>

        {/* Courses table (full width) */}
        <div>
          <div className="mt-2 mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Your courses ({courses.length})
              </h2>
              {courses.length > 0 && (
                <button
                  onClick={toggleLockAll}
                  className="rounded-full px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                >
                  {allLocked ? "🔓 Unlock all" : "🔒 Lock all"}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Edit any cell directly. Imported rows are locked 🔒 — click to unlock.
            </p>
          </div>

          {!hydrated ? (
            <LoadingSkeleton />
          ) : courses.length === 0 ? (
            <div className="card text-center text-sm text-slate-500">
              No courses yet. Add your first one above to start tracking your
              eligibility.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="w-full min-w-[94rem] border-collapse text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-32 px-3 py-2 text-left">Code</th>
                    <th className="min-w-[20rem] px-3 py-2 text-left">Course</th>
                    <th className="w-20 px-2 py-2">Units</th>
                    <th className="w-28 px-2 py-2">Type</th>
                    <th className="w-40 px-2 py-2">Category</th>
                    <th className="w-44 px-2 py-2">Sub-category</th>
                    <th className="w-14 px-2 py-2">Done</th>
                    <th className="w-44 px-2 py-2 text-left">School</th>
                    <th className="w-36 px-2 py-2 text-left">Term</th>
                    <th className="w-20 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const locked = !!c.locked;
                    const cls = `w-full rounded-lg border px-2 py-1 text-sm focus:outline-none ${
                      locked
                        ? "cursor-not-allowed border-transparent bg-transparent text-slate-500"
                        : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    }`;
                    return (
                      <tr key={c.id} className={locked ? "bg-slate-50/40" : "bg-white"}>
                        <td className="px-3 py-1 align-top">
                          {locked ? (
                            <span
                              title={c.code || undefined}
                              className="block w-full overflow-hidden whitespace-nowrap px-2 py-1 text-sm text-slate-500"
                            >
                              {truncStar(c.code ?? "", 14)}
                            </span>
                          ) : (
                            <input
                              className={cls}
                              value={c.code ?? ""}
                              onChange={(e) => updateCourse(c.id, { code: e.target.value || undefined })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-1 align-top">
                          {locked ? (
                            <span
                              title={c.name}
                              className="block w-full overflow-hidden whitespace-nowrap px-2 py-1 text-sm text-slate-600"
                            >
                              {truncStar(c.name, 40)}
                            </span>
                          ) : (
                            <input
                              className={cls}
                              value={c.name}
                              onChange={(e) => updateCourse(c.id, { name: e.target.value })}
                            />
                          )}
                        </td>
                        <td className="px-2 py-1 align-top">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className={cls}
                            value={c.units}
                            disabled={locked}
                            onChange={(e) => updateCourse(c.id, { units: Number(e.target.value) || 0 })}
                          />
                          {c.unitType === "quarter" && (
                            <span className="mt-0.5 block text-[10px] text-slate-400">
                              ≈ {round2(toSemesterUnits(c.units, "quarter"))} sem
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 align-top">
                          <select
                            className={cls}
                            value={c.unitType}
                            disabled={locked}
                            onChange={(e) => updateCourse(c.id, { unitType: e.target.value as UnitType })}
                          >
                            <option value="semester">semester</option>
                            <option value="quarter">quarter</option>
                          </select>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <select
                            className={cls}
                            value={c.category}
                            disabled={locked}
                            onChange={(e) =>
                              updateCourse(c.id, { category: e.target.value as CourseCategory, subject: undefined })
                            }
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.key} value={cat.key}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1 align-top">
                          {(SUBCATS[c.category]?.length ?? 0) > 0 ? (
                            <select
                              className={cls}
                              value={c.subject ?? ""}
                              disabled={locked}
                              onChange={(e) => updateCourse(c.id, { subject: e.target.value || undefined })}
                            >
                              <option value="">— general —</option>
                              {SUBCATS[c.category].map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="block px-2 py-1 text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center align-top">
                          <input
                            type="checkbox"
                            className="mt-1.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400 disabled:opacity-40"
                            checked={c.completed}
                            disabled={locked}
                            onChange={(e) => updateCourse(c.id, { completed: e.target.checked })}
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <input
                            className={cls}
                            value={c.institution ?? ""}
                            disabled={locked}
                            onChange={(e) => updateCourse(c.id, { institution: e.target.value || undefined })}
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <input
                            className={cls}
                            value={c.term ?? ""}
                            disabled={locked}
                            onChange={(e) => updateCourse(c.id, { term: e.target.value || undefined })}
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => updateCourse(c.id, { locked: !locked })}
                              title={locked ? "Unlock to edit" : "Lock row"}
                              className="rounded-full px-2 py-1 text-xs hover:bg-slate-100"
                            >
                              {locked ? "🔒" : "🔓"}
                            </button>
                            <button
                              onClick={() => setDeleteId(c.id)}
                              disabled={locked}
                              title={locked ? "Unlock to delete" : "Delete"}
                              className="rounded-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RequirementProgressWidget />

      <ConfirmModal
        open={!!deleteId}
        title="Delete course?"
        message={
          deleteTarget
            ? `Remove "${deleteTarget.name}" from your coursework? This can't be undone.`
            : "Remove this course?"
        }
        onConfirm={() => {
          if (deleteId) deleteCourse(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </main>
  );
}
