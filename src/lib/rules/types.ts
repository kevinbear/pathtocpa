/**
 * Shape of a state's CPA education ruleset.
 *
 * Rules live as versioned config (never hardcoded in components) so they're easy
 * to audit and update. Every ruleset carries a `lastVerified` date and a source
 * URL — this is a planning aid, not official advice.
 */
export interface RuleSet {
  /** Short id, e.g. "CA". */
  id: string;
  state: string;
  authority: string;
  sourceUrl: string;
  /** ISO date (YYYY-MM-DD) the rules were last checked against the source. */
  lastVerified: string;

  requiresBachelorsForExam: boolean;
  requiresBachelorsForLicense: boolean;

  /** Semester-unit thresholds to sit for the CPA Exam. */
  exam: {
    accounting: number;
    business: number;
  };

  /** Semester-unit thresholds for licensure. */
  license: {
    totalUnits: number;
    accounting: number;
    business: number;
    accountingStudy: number;
    ethics: number;
  };

  /** Honest notes on scope and known simplifications. */
  notes: string[];
}
