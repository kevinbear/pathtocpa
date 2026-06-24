import type { RuleSet } from "../rules/types";
import type {
  CategoryProgress,
  Course,
  CourseCategory,
  EligibilityInput,
  EligibilityResult,
  EvaluateOptions,
  Verdict,
} from "./types";
import { round2, toSemesterUnits } from "./units";

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  accounting: "accounting",
  business: "business-related",
  accountingStudy: "accounting study",
  ethics: "ethics study",
  other: "other",
};

// Tiny tolerance so 23.999999 (FP drift) still counts as meeting 24.
const EPSILON = 1e-6;

function emptyTotals(): Record<CourseCategory, number> {
  return {
    accounting: 0,
    business: 0,
    accountingStudy: 0,
    ethics: 0,
    other: 0,
  };
}

/** Sum semester units per category (and overall) for the courses that count. */
function sumUnits(
  courses: Course[],
  countPlanned: boolean,
): { byCategory: Record<CourseCategory, number>; total: number } {
  const byCategory = emptyTotals();
  let total = 0;

  for (const course of courses) {
    if (!course.completed && !countPlanned) continue;
    const semUnits = toSemesterUnits(course.units, course.unitType);
    byCategory[course.category] += semUnits;
    total += semUnits;
  }

  for (const key of Object.keys(byCategory) as CourseCategory[]) {
    byCategory[key] = round2(byCategory[key]);
  }

  return { byCategory, total: round2(total) };
}

function progress(
  key: CategoryProgress["key"],
  label: string,
  required: number,
  completed: number,
): CategoryProgress {
  const satisfied = completed + EPSILON >= required;
  const remaining = satisfied ? 0 : round2(required - completed);
  const percent =
    required === 0 ? 100 : Math.min(100, round2((completed / required) * 100));
  return { key, label, required, completed: round2(completed), remaining, satisfied, percent };
}

function unmetMessage(p: CategoryProgress): string {
  return `${p.remaining} more ${p.label} unit${
    p.remaining === 1 ? "" : "s"
  } needed (have ${p.completed} of ${p.required}).`;
}

/**
 * Evaluate a student's coursework against a state's CPA education ruleset.
 *
 * Pure and deterministic — the trustworthy core of the app. By default only
 * completed courses count; pass `{ countPlanned: true }` to project with
 * planned courses included.
 */
export function evaluate(
  input: EligibilityInput,
  ruleSet: RuleSet,
  options: EvaluateOptions = {},
): EligibilityResult {
  const { byCategory, total } = sumUnits(input.courses, options.countPlanned ?? false);

  // --- Exam eligibility ---
  const examCategories: CategoryProgress[] = [
    progress("accounting", CATEGORY_LABELS.accounting, ruleSet.exam.accounting, byCategory.accounting),
    progress("business", CATEGORY_LABELS.business, ruleSet.exam.business, byCategory.business),
  ];
  const examMissing: string[] = [];
  if (ruleSet.requiresBachelorsForExam && !input.hasBachelorsDegree) {
    examMissing.push("A bachelor's degree is required to sit for the exam.");
  }
  for (const c of examCategories) {
    if (!c.satisfied) examMissing.push(unmetMessage(c));
  }
  const exam: Verdict = {
    eligible: examMissing.length === 0,
    categories: examCategories,
    missing: examMissing,
  };

  // --- License eligibility ---
  const licenseCategories: CategoryProgress[] = [
    progress("total", "total semester", ruleSet.license.totalUnits, total),
    progress("accounting", CATEGORY_LABELS.accounting, ruleSet.license.accounting, byCategory.accounting),
    progress("business", CATEGORY_LABELS.business, ruleSet.license.business, byCategory.business),
    progress("accountingStudy", CATEGORY_LABELS.accountingStudy, ruleSet.license.accountingStudy, byCategory.accountingStudy),
    progress("ethics", CATEGORY_LABELS.ethics, ruleSet.license.ethics, byCategory.ethics),
  ];
  const licenseMissing: string[] = [];
  if (ruleSet.requiresBachelorsForLicense && !input.hasBachelorsDegree) {
    licenseMissing.push("A bachelor's degree is required for licensure.");
  }
  for (const c of licenseCategories) {
    if (!c.satisfied) licenseMissing.push(unmetMessage(c));
  }
  const license: Verdict = {
    eligible: licenseMissing.length === 0,
    categories: licenseCategories,
    missing: licenseMissing,
  };

  return {
    totalSemesterUnits: total,
    unitsByCategory: byCategory,
    exam,
    license,
  };
}
