import type { RuleSet } from "./types";

/**
 * California Board of Accountancy (CBA) CPA education requirements.
 *
 * Headline requirements:
 *  - To SIT FOR THE EXAM: a bachelor's degree + 24 semester units of accounting
 *    subjects + 24 semester units of business-related subjects.
 *  - For LICENSURE: 150 total semester units, the same 24 + 24, plus 20 units of
 *    accounting study and 10 units of ethics study.
 *
 * ⚠️ Known simplifications (see `notes`): this MVP counts each course in a single
 * category and does not yet model California's detailed overlap allowances or the
 * sub-composition rules within accounting study / ethics study. Always confirm
 * with the CBA before relying on the result.
 */
export const californiaRuleSet: RuleSet = {
  id: "CA",
  state: "California",
  authority: "California Board of Accountancy (CBA)",
  sourceUrl:
    "https://www.dca.ca.gov/cba/applicants/educational-requirements.shtml",
  lastVerified: "2026-06-24",

  requiresBachelorsForExam: true,
  requiresBachelorsForLicense: true,

  exam: {
    accounting: 24,
    business: 24,
  },

  license: {
    totalUnits: 150,
    accounting: 24,
    business: 24,
    accountingStudy: 20,
    ethics: 10,
  },

  notes: [
    "To sit for the exam you need a bachelor's degree plus 24 accounting and 24 business-related semester units.",
    "Licensure additionally requires 150 total semester units, 20 units of accounting study, and 10 units of ethics study.",
    "Quarter units are converted to semester units (quarter × 2/3).",
    "Simplification: each course is counted toward a single category; California's allowances for units that overlap multiple categories are not yet modeled.",
    "Simplification: detailed sub-composition rules (e.g. a minimum of 3 units of accounting ethics within the 10 ethics units, or the 6-unit accounting minimum within accounting study) are not yet modeled.",
  ],
};

export default californiaRuleSet;
