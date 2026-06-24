import type { CourseCategory } from "../eligibility/types";

/** The canonical fields we import into a Course. */
export type DraftField =
  | "name"
  | "units"
  | "category"
  | "unitType"
  | "completed"
  | "institution"
  | "term";

/** Required columns — a file missing any of these is a format error. */
export const REQUIRED_FIELDS: DraftField[] = ["name", "units", "category"];

/** Normalize a header or value for matching: lowercase, punctuation → spaces, collapse. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Accepted header aliases (normalized) → canonical field. */
const HEADER_ALIASES: { field: DraftField; aliases: string[] }[] = [
  { field: "name", aliases: ["name", "course", "course name", "title", "class", "course title"] },
  { field: "units", aliases: ["units", "unit", "credits", "credit", "semester units", "unit count"] },
  { field: "category", aliases: ["category", "cat", "requirement", "subject"] },
  { field: "unitType", aliases: ["unit type", "unittype", "type", "units type"] },
  { field: "completed", aliases: ["completed", "complete", "status", "done", "finished"] },
  { field: "institution", aliases: ["institution", "school", "college", "university"] },
  { field: "term", aliases: ["term", "semester taken", "quarter taken", "when", "term taken", "semester"] },
];

const HEADER_LOOKUP = new Map<string, DraftField>();
for (const { field, aliases } of HEADER_ALIASES) {
  for (const a of aliases) HEADER_LOOKUP.set(a, field);
}

export function headerToField(rawHeader: string): DraftField | null {
  return HEADER_LOOKUP.get(normalize(rawHeader)) ?? null;
}

/** Category value aliases (normalized) → canonical category. */
const CATEGORY_ALIASES: Record<string, CourseCategory> = {
  accounting: "accounting",
  acct: "accounting",
  "accounting subjects": "accounting",
  business: "business",
  "business related": "business",
  bus: "business",
  "accounting study": "accountingStudy",
  "acct study": "accountingStudy",
  ethics: "ethics",
  "ethics study": "ethics",
  other: "other",
  general: "other",
  "general education": "other",
  elective: "other",
  ge: "other",
};

/** Returns the canonical category, or "" if unrecognized. */
export function parseCategory(value: string): CourseCategory | "" {
  if (!value.trim()) return "";
  return CATEGORY_ALIASES[normalize(value)] ?? "";
}

const QUARTER = new Set(["quarter", "qtr", "q"]);
const SEMESTER = new Set(["semester", "sem", "s"]);

/** Blank → "semester"; recognized → that value; otherwise "" (invalid). */
export function parseUnitType(value: string): "semester" | "quarter" | "" {
  if (!value.trim()) return "semester";
  const n = normalize(value);
  if (QUARTER.has(n)) return "quarter";
  if (SEMESTER.has(n)) return "semester";
  return "";
}

const TRUTHY = new Set(["yes", "y", "true", "t", "1", "completed", "complete", "done", "finished", "passed"]);
const FALSY = new Set(["no", "n", "false", "f", "0", "planned", "in progress", "future", "not completed", "incomplete"]);

/** Blank → "yes"; recognized → "yes"/"no"; otherwise "" (invalid). */
export function parseCompleted(value: string): "yes" | "no" | "" {
  if (!value.trim()) return "yes";
  const n = normalize(value);
  if (TRUTHY.has(n)) return "yes";
  if (FALSY.has(n)) return "no";
  return "";
}

/** Column documentation used by the in-app tutorial and the templates. */
export const COLUMN_DOCS: {
  header: string;
  required: boolean;
  accepts: string;
  example: string;
}[] = [
  { header: "name", required: true, accepts: "Any text (the course name)", example: "Intermediate Accounting I" },
  { header: "units", required: true, accepts: "A number greater than 0", example: "3" },
  {
    header: "category",
    required: true,
    accepts: "accounting, business, accounting_study, ethics, or other",
    example: "accounting",
  },
  { header: "unit_type", required: false, accepts: "semester or quarter (default: semester)", example: "semester" },
  { header: "completed", required: false, accepts: "yes/no or true/false (default: yes)", example: "yes" },
  { header: "institution", required: false, accepts: "Any text", example: "CSU Fullerton" },
  { header: "term", required: false, accepts: "Any text", example: "Fall 2025" },
];

export const TEMPLATE_HEADERS = COLUMN_DOCS.map((c) => c.header);

export const TEMPLATE_ROWS: string[][] = [
  ["Intermediate Accounting I", "3", "accounting", "semester", "yes", "CSU Fullerton", "Fall 2025"],
  ["Business Law", "3", "business", "semester", "yes", "CSU Fullerton", "Spring 2025"],
  ["Accounting Ethics", "3", "ethics", "semester", "no", "CSU Fullerton", "Fall 2026"],
];
