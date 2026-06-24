"use client";

import { useMemo, useRef, useState } from "react";
import { useAppData } from "@/lib/data/AppDataProvider";
import { CATEGORIES } from "@/lib/eligibility/categories";
import {
  rawRowsToDrafts,
  validateDraft,
  type DraftCourse,
} from "@/lib/import/courseImport";
import { isSupportedFile, parseFile } from "@/lib/import/parseFile";
import { downloadCsvTemplate, downloadXlsxTemplate } from "@/lib/import/downloads";
import { COLUMN_DOCS } from "@/lib/import/format";

const cell =
  "w-full rounded-lg border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100";

function fieldClass(hasError: boolean) {
  return `${cell} ${hasError ? "border-red-400 bg-red-50" : "border-slate-200"}`;
}

export default function ImportPanel() {
  const { addCourse } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftCourse[] | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const validations = useMemo(
    () => (drafts ? drafts.map(validateDraft) : []),
    [drafts],
  );
  const validCount = validations.filter((v) => v.valid).length;

  function reset() {
    setDrafts(null);
    setMissingColumns([]);
    setFileError(null);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(file: File) {
    setImportedCount(null);
    setFileName(file.name);
    if (!isSupportedFile(file)) {
      setDrafts(null);
      setMissingColumns([]);
      setFileError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    setBusy(true);
    setFileError(null);
    try {
      const rows = await parseFile(file);
      const { drafts: parsed, missingColumns: missing, empty } = rawRowsToDrafts(rows);
      if (empty && missing.length === 0) {
        setDrafts(null);
        setFileError("We couldn't find any rows in that file.");
        return;
      }
      setMissingColumns(missing);
      setDrafts(parsed);
    } catch {
      setDrafts(null);
      setFileError("Sorry, we couldn't read that file. Make sure it isn't open in another program and try again.");
    } finally {
      setBusy(false);
    }
  }

  function updateDraft(index: number, patch: Partial<DraftCourse>) {
    setDrafts((d) => (d ? d.map((row, i) => (i === index ? { ...row, ...patch } : row)) : d));
  }

  function removeDraft(index: number) {
    setDrafts((d) => (d ? d.filter((_, i) => i !== index) : d));
  }

  function doImport() {
    const valid = validations.filter((v) => v.valid);
    // Imported courses are locked by default — unlock to edit in the table.
    valid.forEach((v) => v.course && addCourse({ ...v.course, locked: true }));
    setImportedCount(valid.length);
    reset();
  }

  return (
    <div className="card mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Import from CSV / Excel
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Bulk-add courses from a spreadsheet. Your file is read in your
            browser and never uploaded anywhere.
          </p>
        </div>
        <button
          onClick={() => setShowTutorial((s) => !s)}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {showTutorial ? "Hide tutorial" : "How does this work?"}
        </button>
      </div>

      {/* Tutorial */}
      {showTutorial && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Download a template</strong> below (CSV or Excel) so your
              columns match exactly.
            </li>
            <li>
              Fill in one row per course. <strong>name</strong>,{" "}
              <strong>units</strong>, and <strong>category</strong> are required;
              the rest are optional.
            </li>
            <li>
              Save the file, then <strong>choose it below</strong>. We&apos;ll
              show a preview you can edit before importing.
            </li>
            <li>
              Fix any highlighted cells, then click{" "}
              <strong>Import</strong>. Done!
            </li>
          </ol>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="border-b border-slate-200 py-1 pr-3">Column</th>
                  <th className="border-b border-slate-200 py-1 pr-3">Required?</th>
                  <th className="border-b border-slate-200 py-1 pr-3">Accepted values</th>
                  <th className="border-b border-slate-200 py-1">Example</th>
                </tr>
              </thead>
              <tbody>
                {COLUMN_DOCS.map((c) => (
                  <tr key={c.header} className="align-top">
                    <td className="border-b border-slate-100 py-1 pr-3 font-mono font-medium text-slate-800">
                      {c.header}
                    </td>
                    <td className="border-b border-slate-100 py-1 pr-3">
                      {c.required ? (
                        <span className="font-medium text-brand-700">Required</span>
                      ) : (
                        "Optional"
                      )}
                    </td>
                    <td className="border-b border-slate-100 py-1 pr-3 text-slate-600">{c.accepts}</td>
                    <td className="border-b border-slate-100 py-1 text-slate-600">{c.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Header names are flexible — e.g. <code>course</code>, <code>credits</code>, or{" "}
            <code>school</code> are understood too.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Choose file…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button onClick={downloadCsvTemplate} className="text-sm font-medium text-brand-700 underline">
          Download CSV template
        </button>
        <button
          onClick={() => downloadXlsxTemplate()}
          className="text-sm font-medium text-brand-700 underline"
        >
          Download Excel template
        </button>
        {fileName && !busy && (
          <span className="text-xs text-slate-500">Selected: {fileName}</span>
        )}
        {busy && <span className="text-xs text-slate-500">Reading file…</span>}
      </div>

      {/* Success */}
      {importedCount !== null && (
        <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
          ✓ Imported {importedCount} course{importedCount === 1 ? "" : "s"}. They&apos;ve
          been added to your list below.
        </p>
      )}

      {/* File-level error */}
      {fileError && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{fileError}</p>
      )}

      {/* Missing columns error */}
      {missingColumns.length > 0 && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <strong>Wrong format.</strong> Your file is missing required column
          {missingColumns.length === 1 ? "" : "s"}:{" "}
          <span className="font-mono">{missingColumns.join(", ")}</span>. Please use
          the template above so the columns match.
        </div>
      )}

      {/* Editable preview */}
      {drafts && drafts.length > 0 && missingColumns.length === 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Preview — {validCount} of {drafts.length} row
              {drafts.length === 1 ? "" : "s"} ready to import
            </p>
            <button onClick={reset} className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Clear
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl ring-1 ring-slate-100">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2 w-20">Units</th>
                  <th className="px-2 py-2 w-28">Unit type</th>
                  <th className="px-2 py-2 w-40">Category</th>
                  <th className="px-2 py-2 w-24">Completed</th>
                  <th className="px-2 py-2">School</th>
                  <th className="px-2 py-2">Term</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d, i) => {
                  const v = validations[i];
                  const e = v.fieldErrors;
                  return (
                    <tr key={i} className={v.valid ? "" : "bg-red-50/40"}>
                      <td className="px-2 py-1">
                        <input
                          className={fieldClass(!!e.name)}
                          value={d.name}
                          title={e.name}
                          onChange={(ev) => updateDraft(i, { name: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          className={fieldClass(!!e.units)}
                          value={d.units}
                          title={e.units}
                          inputMode="decimal"
                          onChange={(ev) => updateDraft(i, { units: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          className={fieldClass(!!e.unitType)}
                          value={d.unitType}
                          onChange={(ev) => updateDraft(i, { unitType: ev.target.value })}
                        >
                          <option value="">—</option>
                          <option value="semester">semester</option>
                          <option value="quarter">quarter</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select
                          className={fieldClass(!!e.category)}
                          value={d.category}
                          onChange={(ev) => updateDraft(i, { category: ev.target.value })}
                        >
                          <option value="">— select —</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select
                          className={fieldClass(!!e.completed)}
                          value={d.completed}
                          onChange={(ev) => updateDraft(i, { completed: ev.target.value })}
                        >
                          <option value="">—</option>
                          <option value="yes">yes</option>
                          <option value="no">no</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          className={fieldClass(false)}
                          value={d.institution}
                          onChange={(ev) => updateDraft(i, { institution: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          className={fieldClass(false)}
                          value={d.term}
                          onChange={(ev) => updateDraft(i, { term: ev.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeDraft(i)}
                          className="rounded-full px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                          aria-label="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={doImport}
              disabled={validCount === 0}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Import {validCount} course{validCount === 1 ? "" : "s"}
            </button>
            {validCount < drafts.length && (
              <span className="text-xs text-amber-700">
                {drafts.length - validCount} row
                {drafts.length - validCount === 1 ? "" : "s"} need fixing
                (highlighted) — or remove them with ✕.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
