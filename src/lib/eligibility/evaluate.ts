import type { RuleSet } from "../rules/types";
import type {
  CategoryProgress,
  Contributor,
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
  return { accounting: 0, business: 0, accountingStudy: 0, ethics: 0, other: 0 };
}

/** Sum semester units per category and collect contributing courses. */
function tally(courses: Course[], countPlanned: boolean) {
  const byCategory = emptyTotals();
  const contributorsByCategory: Record<CourseCategory, Contributor[]> = {
    accounting: [],
    business: [],
    accountingStudy: [],
    ethics: [],
    other: [],
  };
  let total = 0;

  for (const course of courses) {
    if (!course.completed && !countPlanned) continue;
    const semUnits = toSemesterUnits(course.units, course.unitType);
    byCategory[course.category] += semUnits;
    contributorsByCategory[course.category].push({
      name: course.name,
      units: round2(semUnits),
      note: course.completed ? undefined : "planned",
    });
    total += semUnits;
  }

  for (const key of Object.keys(byCategory) as CourseCategory[]) {
    byCategory[key] = round2(byCategory[key]);
  }
  return { byCategory, contributorsByCategory, total: round2(total) };
}

function makeProgress(
  key: CategoryProgress["key"],
  label: string,
  required: number,
  completed: number,
  extra: Partial<CategoryProgress> = {},
): CategoryProgress {
  const satisfied = extra.waived === true || completed + EPSILON >= required;
  const remaining = satisfied ? 0 : round2(required - completed);
  const percent =
    extra.waived === true || required === 0
      ? 100
      : Math.min(100, round2((completed / required) * 100));
  return {
    key,
    label,
    required,
    completed: round2(completed),
    remaining,
    satisfied,
    percent,
    ...extra,
  };
}

function unmetMessage(p: CategoryProgress): string {
  return `${p.remaining} more ${p.label} unit${p.remaining === 1 ? "" : "s"} needed (have ${p.completed} of ${p.required}).`;
}

/**
 * Evaluate a student's coursework against a state's CPA education ruleset.
 *
 * Flyer-accurate behaviors:
 *  - Accounting units beyond the 24 required count toward the business-related
 *    requirement ("Additional Accounting Subjects").
 *  - A qualifying master's degree waives the 20-unit Accounting Study requirement.
 *
 * Pure and deterministic. By default only completed courses count; pass
 * `{ countPlanned: true }` to project with planned courses included.
 */
export function evaluate(
  input: EligibilityInput,
  ruleSet: RuleSet,
  options: EvaluateOptions = {},
): EligibilityResult {
  const { byCategory, contributorsByCategory, total } = tally(
    input.courses,
    options.countPlanned ?? false,
  );

  // Accounting beyond the 24-unit requirement overflows into business-related.
  const accountingOverflow = round2(
    Math.max(0, byCategory.accounting - ruleSet.license.accounting),
  );
  const effectiveBusiness = round2(byCategory.business + accountingOverflow);
  const businessOverflowExtra: Contributor[] =
    accountingOverflow > 0
      ? [
          {
            name: "Additional accounting subjects",
            units: accountingOverflow,
            note: "accounting units beyond 24 count as business-related",
          },
        ]
      : [];

  const accountingExtra = (): Partial<CategoryProgress> => ({
    direct: byCategory.accounting,
    contributors: contributorsByCategory.accounting,
    overflowNote:
      accountingOverflow > 0
        ? `${accountingOverflow} unit(s) above 24 also count toward business-related.`
        : undefined,
  });

  const businessExtra = (): Partial<CategoryProgress> => ({
    direct: byCategory.business,
    overflow: accountingOverflow || undefined,
    overflowNote:
      accountingOverflow > 0
        ? `Includes ${accountingOverflow} unit(s) from additional accounting subjects.`
        : undefined,
    contributors: [...contributorsByCategory.business, ...businessOverflowExtra],
  });

  // --- Exam eligibility ---
  const examCategories: CategoryProgress[] = [
    makeProgress("accounting", CATEGORY_LABELS.accounting, ruleSet.exam.accounting, byCategory.accounting, accountingExtra()),
    makeProgress("business", CATEGORY_LABELS.business, ruleSet.exam.business, effectiveBusiness, businessExtra()),
  ];
  const examMissing: string[] = [];
  if (ruleSet.requiresBachelorsForExam && !input.hasBachelorsDegree) {
    examMissing.push("A bachelor's degree is required to sit for the exam.");
  }
  for (const c of examCategories) if (!c.satisfied) examMissing.push(unmetMessage(c));
  const exam: Verdict = {
    eligible: examMissing.length === 0,
    categories: examCategories,
    missing: examMissing,
  };

  // --- License eligibility ---
  const waived = input.waivesAccountingStudy === true;
  const licenseCategories: CategoryProgress[] = [
    makeProgress("total", "total semester", ruleSet.license.totalUnits, total, {
      contributors: (Object.keys(byCategory) as CourseCategory[])
        .filter((k) => byCategory[k] > 0)
        .map((k) => ({ name: CATEGORY_LABELS[k], units: byCategory[k] })),
    }),
    makeProgress("accounting", CATEGORY_LABELS.accounting, ruleSet.license.accounting, byCategory.accounting, accountingExtra()),
    makeProgress("business", CATEGORY_LABELS.business, ruleSet.license.business, effectiveBusiness, businessExtra()),
    makeProgress(
      "accountingStudy",
      CATEGORY_LABELS.accountingStudy,
      ruleSet.license.accountingStudy,
      byCategory.accountingStudy,
      waived
        ? {
            waived: true,
            waivedNote: "Waived by your master's degree in accounting, taxation, or laws in taxation.",
            contributors: [],
          }
        : { direct: byCategory.accountingStudy, contributors: contributorsByCategory.accountingStudy },
    ),
    makeProgress("ethics", CATEGORY_LABELS.ethics, ruleSet.license.ethics, byCategory.ethics, {
      direct: byCategory.ethics,
      contributors: contributorsByCategory.ethics,
    }),
  ];
  const licenseMissing: string[] = [];
  if (ruleSet.requiresBachelorsForLicense && !input.hasBachelorsDegree) {
    licenseMissing.push("A bachelor's degree is required for licensure.");
  }
  for (const c of licenseCategories) if (!c.satisfied) licenseMissing.push(unmetMessage(c));
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
