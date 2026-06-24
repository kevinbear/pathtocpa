import type { Course } from "../eligibility/types";
import {
  DraftField,
  REQUIRED_FIELDS,
  headerToField,
  parseCategory,
  parseCompleted,
  parseUnitType,
} from "./format";

export type RawRow = Record<string, unknown>;

/** An editable, all-strings representation of a row in the import preview. */
export interface DraftCourse {
  name: string;
  units: string;
  category: string; // canonical key ("accounting"...) or "" if unrecognized
  unitType: string; // "semester" | "quarter" | ""
  completed: string; // "yes" | "no" | ""
  institution: string;
  term: string;
}

export interface DraftValidation {
  valid: boolean;
  course: Omit<Course, "id"> | null;
  fieldErrors: Partial<Record<keyof DraftCourse, string>>;
  messages: string[];
}

export interface ParseResult {
  drafts: DraftCourse[];
  /** Required columns that weren't found — a non-empty list is a format error. */
  missingColumns: DraftField[];
  /** True if no data rows were found at all. */
  empty: boolean;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

const EMPTY_DRAFT: DraftCourse = {
  name: "",
  units: "",
  category: "",
  unitType: "semester",
  completed: "yes",
  institution: "",
  term: "",
};

/**
 * Convert raw spreadsheet rows (objects keyed by their original headers) into
 * editable drafts, and report any missing required columns. Pure — no I/O.
 */
export function rawRowsToDrafts(rawRows: RawRow[]): ParseResult {
  if (rawRows.length === 0) {
    return { drafts: [], missingColumns: [...REQUIRED_FIELDS], empty: true };
  }

  // Map each canonical field to the first original header key that matches.
  const fieldToKey = new Map<DraftField, string>();
  const allKeys = new Set<string>();
  for (const row of rawRows) {
    for (const key of Object.keys(row)) allKeys.add(key);
  }
  for (const key of allKeys) {
    const field = headerToField(key);
    if (field && !fieldToKey.has(field)) fieldToKey.set(field, key);
  }

  const missingColumns = REQUIRED_FIELDS.filter((f) => !fieldToKey.has(f));

  const get = (row: RawRow, field: DraftField): string => {
    const key = fieldToKey.get(field);
    return key ? str(row[key]) : "";
  };

  const drafts: DraftCourse[] = rawRows
    .map((row) => ({
      name: get(row, "name"),
      units: get(row, "units"),
      category: parseCategory(get(row, "category")),
      unitType: parseUnitType(get(row, "unitType")),
      completed: parseCompleted(get(row, "completed")),
      institution: get(row, "institution"),
      term: get(row, "term"),
    }))
    // Drop entirely-blank rows (common trailing rows in spreadsheets).
    .filter((d) => d.name || d.units || d.institution || d.term);

  return { drafts, missingColumns, empty: drafts.length === 0 };
}

/** Validate a single draft and, if valid, produce the Course payload. */
export function validateDraft(d: DraftCourse): DraftValidation {
  const fieldErrors: Partial<Record<keyof DraftCourse, string>> = {};

  if (!d.name.trim()) fieldErrors.name = "Course name is required.";

  const units = Number(d.units);
  if (!d.units.trim()) fieldErrors.units = "Units are required.";
  else if (!Number.isFinite(units) || units <= 0)
    fieldErrors.units = "Units must be a number greater than 0.";

  if (d.category === "")
    fieldErrors.category =
      "Category must be accounting, business, accounting_study, ethics, or other.";

  if (d.unitType === "") fieldErrors.unitType = "Unit type must be semester or quarter.";
  if (d.completed === "") fieldErrors.completed = "Completed must be yes or no.";

  const messages = Object.values(fieldErrors);
  if (messages.length > 0) {
    return { valid: false, course: null, fieldErrors, messages };
  }

  return {
    valid: true,
    fieldErrors: {},
    messages: [],
    course: {
      name: d.name.trim(),
      units,
      unitType: d.unitType as "semester" | "quarter",
      category: d.category as Course["category"],
      institution: d.institution.trim() || undefined,
      term: d.term.trim() || undefined,
      completed: d.completed === "yes",
    },
  };
}

export { EMPTY_DRAFT };
