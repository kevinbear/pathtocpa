import type { CourseCategory } from "../eligibility/types";

export type AllocCategory = Exclude<CourseCategory, "other" | "accountingStudy">;

export interface Classification {
  /** Best-guess sub-zone id, or null if unknown. */
  subject: string | null;
  /** Best-guess top-level category, or null if unknown. */
  category: AllocCategory | null;
}

/**
 * Heuristic, name-based guess of what a course counts toward — used only for
 * soft "this looks like X, not Y" hints on the Allocate board and breakdown.
 * It is NOT authoritative; the student's own placement always wins.
 *
 * Rules are checked in order, most specific first.
 */
const RULES: { re: RegExp; subject: string; category: AllocCategory }[] = [
  // Ethics
  { re: /\bfraud\b/, subject: "eth-core", category: "ethics" },
  { re: /professional responsibilit/, subject: "eth-core", category: "ethics" },
  { re: /\bethic/, subject: "eth-core", category: "ethics" },
  { re: /philosoph|religion|theolog/, subject: "eth-philosophy", category: "ethics" },
  // Accounting (specific before generic)
  { re: /audit/, subject: "acc-auditing", category: "accounting" },
  { re: /\btax/, subject: "acc-taxation", category: "accounting" },
  { re: /statement analysis/, subject: "acc-fsa", category: "accounting" },
  { re: /external|internal reporting/, subject: "acc-ext-int-reporting", category: "accounting" },
  { re: /financial reporting/, subject: "acc-financial-reporting", category: "accounting" },
  { re: /account/, subject: "acc-accounting", category: "accounting" },
  // Business
  { re: /business law|\blaw\b|legal/, subject: "bus-law", category: "business" },
  { re: /econom/, subject: "bus-economics", category: "business" },
  { re: /market/, subject: "bus-marketing", category: "business" },
  { re: /statistic|probabilit/, subject: "bus-statistics", category: "business" },
  {
    re: /computer science|information systems|programming|program design|software|systems analysis|web develop|web application|\bnetwork|operating system|data structure|database|digital logic|assembly|data mining|data science|analytics|machine learning|artificial intelligence/,
    subject: "bus-cs",
    category: "business",
  },
  { re: /calculus|algebra|discrete math|mathematic|\bmath\b/, subject: "bus-math", category: "business" },
  { re: /finance|financial management|corporate finance|investment/, subject: "bus-finance", category: "business" },
  { re: /communicat|journalism|english/, subject: "bus-comms", category: "business" },
  { re: /administration/, subject: "bus-admin", category: "business" },
  {
    re: /management|organization|human resource|leadership|operations|supply chain|project management|entrepreneur/,
    subject: "bus-management",
    category: "business",
  },
];

export function classifyCourse(name: string): Classification {
  const n = name.toLowerCase();
  for (const r of RULES) {
    if (r.re.test(n)) return { subject: r.subject, category: r.category };
  }
  return { subject: null, category: null };
}

export const ALLOC_CATEGORY_LABEL: Record<AllocCategory, string> = {
  accounting: "Accounting",
  business: "Business-related",
  ethics: "Ethics",
};

/**
 * Which course types each requirement legitimately accepts (the CBA categories
 * overlap a lot):
 *  - Accounting Subjects: accounting only.
 *  - Business-Related: business AND accounting ("Additional Accounting Subjects").
 *  - Ethics Study: accounting (Auditing/Fraud), business (Business Law, Corporate
 *    Governance, …), and ethics — so it accepts essentially anything related.
 */
const ACCEPTS: Record<AllocCategory, AllocCategory[]> = {
  accounting: ["accounting"],
  business: ["business", "accounting"],
  ethics: ["accounting", "business", "ethics"],
};

/** Soft check: does a course's guessed type clash with where it's placed? */
export function looksMismatched(
  name: string,
  expected: AllocCategory,
): { mismatch: boolean; guess: AllocCategory | null } {
  const guess = classifyCourse(name).category;
  if (!guess) return { mismatch: false, guess: null };
  return { mismatch: !ACCEPTS[expected].includes(guess), guess };
}

/**
 * Strict check used to hard-block drops: a course may enter a requirement only
 * if it POSITIVELY classifies as a type that requirement accepts. An
 * unrecognized course (guess === null) does not positively fit, so it's blocked
 * out of the subject requirements (it can still live in the Unused pool).
 */
export function strictFit(
  name: string,
  expected: AllocCategory,
): { ok: boolean; guess: AllocCategory | null } {
  const guess = classifyCourse(name).category;
  if (!guess) return { ok: false, guess: null };
  return { ok: ACCEPTS[expected].includes(guess), guess };
}
