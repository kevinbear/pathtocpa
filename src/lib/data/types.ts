import type { Course } from "../eligibility/types";
import type { Expense } from "../costs/types";

/** CPA Exam sections under the CPA Evolution model: 3 Core + 1 Discipline. */
export type ExamSection = "AUD" | "FAR" | "REG" | "DISC";
export type Discipline = "BAR" | "ISC" | "TCP";

export type DegreeLevel = "none" | "bachelors" | "masters";
export type MastersField = "accounting" | "taxation" | "laws_in_taxation" | "other";

export interface Profile {
  /** Highest degree earned (or in progress). A bachelor's is required for licensure. */
  degreeLevel: DegreeLevel;
  /** If a master's, the field — only accounting/taxation/laws-in-taxation waives Accounting Study. */
  mastersField?: MastersField;
  /** Optional ISO date the student is aiming to be licensed by. */
  targetLicenseDate?: string;

  // --- Journey progress beyond education ---
  /** Which exam sections have been passed (subset of the 4 slots). */
  examSectionsPassed: ExamSection[];
  /** Chosen discipline section, if decided. */
  disciplineChoice?: Discipline;
  /** Months of qualifying accounting experience completed (12 required). */
  experienceMonths: number;
  /** Passed the PETH professional ethics exam. */
  pethPassed: boolean;
  /** Submitted the CBA license application. */
  licenseSubmitted: boolean;
}

export interface AppData {
  profile: Profile;
  courses: Course[];
  expenses: Expense[];
}

export const DEFAULT_APP_DATA: AppData = {
  profile: {
    degreeLevel: "none",
    examSectionsPassed: [],
    experienceMonths: 0,
    pethPassed: false,
    licenseSubmitted: false,
  },
  courses: [],
  expenses: [],
};

/** Storage key namespace — bump the version suffix on breaking shape changes. */
export const STORAGE_KEY = "pathtocpa.appdata.v1";

const WAIVER_FIELDS: MastersField[] = ["accounting", "taxation", "laws_in_taxation"];

/** A master's implies a bachelor's, so either level satisfies the degree requirement. */
export function profileHasBachelors(p: Profile): boolean {
  return p.degreeLevel === "bachelors" || p.degreeLevel === "masters";
}

/** Per the CBA flyer: a master's in accounting, taxation, or laws in taxation waives Accounting Study. */
export function profileWaivesAccountingStudy(p: Profile): boolean {
  return (
    p.degreeLevel === "masters" && !!p.mastersField && WAIVER_FIELDS.includes(p.mastersField)
  );
}
