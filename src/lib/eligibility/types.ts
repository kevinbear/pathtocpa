export type UnitType = "semester" | "quarter";

export type CourseCategory =
  | "accounting"
  | "business"
  | "accountingStudy"
  | "ethics"
  | "other";

export interface Course {
  id: string;
  /** Optional course code / catalog number, e.g. "ACCT 415". */
  code?: string;
  name: string;
  units: number;
  unitType: UnitType;
  category: CourseCategory;
  institution?: string;
  term?: string;
  /** Completed courses count toward "current" eligibility; planned ones don't (unless countPlanned). */
  completed: boolean;
  /** Imported rows are locked by default (read-only until unlocked). */
  locked?: boolean;
  /** Fine-grained sub-zone id within a category, set by the Allocate board. */
  subject?: string;
}

export interface Contributor {
  name: string;
  units: number;
  note?: string;
  /** Present when this entry is a real course (movable). Absent for synthetic rows. */
  courseId?: string;
  /** The course's current category (for the "move" control). */
  category?: CourseCategory;
}

/** Progress toward a single requirement, all in semester units. */
export interface CategoryProgress {
  key: CourseCategory | "total";
  label: string;
  required: number;
  completed: number;
  remaining: number;
  satisfied: boolean;
  /** 0–100, capped. */
  percent: number;
  // --- Detail for the breakdown page (optional) ---
  /** Units that came from courses directly in this category. */
  direct?: number;
  /** Units credited from another category (e.g. accounting overflow → business). */
  overflow?: number;
  overflowNote?: string;
  /** True if this requirement was satisfied by a degree waiver rather than units. */
  waived?: boolean;
  waivedNote?: string;
  /** Courses (and synthetic entries) that counted toward this requirement. */
  contributors?: Contributor[];
}

export interface Verdict {
  eligible: boolean;
  categories: CategoryProgress[];
  /** Human-readable list of what's still missing. */
  missing: string[];
}

export interface EligibilityInput {
  courses: Course[];
  hasBachelorsDegree: boolean;
  /** When true, the 20-unit Accounting Study requirement is waived (qualifying master's). */
  waivesAccountingStudy?: boolean;
}

export interface EligibilityResult {
  /** Total semester units across all counted courses (incl. "other"). */
  totalSemesterUnits: number;
  unitsByCategory: Record<CourseCategory, number>;
  /** Eligibility to sit for the CPA Exam. */
  exam: Verdict;
  /** Eligibility for licensure (the 150-unit rule). */
  license: Verdict;
}

export interface EvaluateOptions {
  /** When true, planned (not-yet-completed) courses also count — useful for projections. */
  countPlanned?: boolean;
}
