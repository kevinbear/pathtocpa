export type UnitType = "semester" | "quarter";

export type CourseCategory =
  | "accounting"
  | "business"
  | "accountingStudy"
  | "ethics"
  | "other";

export interface Course {
  id: string;
  name: string;
  units: number;
  unitType: UnitType;
  category: CourseCategory;
  institution?: string;
  term?: string;
  /** Completed courses count toward "current" eligibility; planned ones don't (unless countPlanned). */
  completed: boolean;
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
