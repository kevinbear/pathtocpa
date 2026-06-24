import type { ExpenseCategory } from "./types";

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string }[] = [
  { key: "review", label: "Review course" },
  { key: "exam", label: "Exam fees" },
  { key: "application", label: "Application / registration" },
  { key: "transcripts", label: "Transcripts" },
  { key: "fingerprinting", label: "Fingerprinting (Live Scan)" },
  { key: "ethics", label: "Ethics exam (PETH)" },
  { key: "license", label: "License fee" },
  { key: "misc", label: "Miscellaneous" },
];

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> =
  Object.fromEntries(
    EXPENSE_CATEGORIES.map((c) => [c.key, c.label]),
  ) as Record<ExpenseCategory, string>;
