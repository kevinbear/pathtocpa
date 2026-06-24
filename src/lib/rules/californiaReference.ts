import type { CourseCategory } from "../eligibility/types";

/**
 * The "size chart" — what subjects count toward each California requirement,
 * transcribed from the CBA Educational Requirements Tip Sheet (Rev. 05/2024).
 * Used by the eligibility breakdown page so students can see exactly what
 * qualifies. This is reference content, not the calculation logic.
 */
export interface CategoryReference {
  key: Exclude<CourseCategory, "other">;
  title: string;
  requiredUnits: number;
  /** Accepted subjects for this requirement. */
  subjects: string[];
  /** Composition rules / important notes. */
  notes: string[];
}

export const CALIFORNIA_REFERENCE: CategoryReference[] = [
  {
    key: "accounting",
    title: "Accounting Subjects",
    requiredUnits: 24,
    subjects: [
      "Accounting",
      "Auditing",
      "Taxation",
      "Financial Reporting",
      "Financial Statement Analysis",
      "External or Internal Reporting",
    ],
    notes: [
      "Required to sit for the CPA Exam.",
      "Accounting units beyond 24 count toward the Business-Related requirement (“Additional Accounting Subjects”).",
    ],
  },
  {
    key: "business",
    title: "Business-Related Subjects",
    requiredUnits: 24,
    subjects: [
      "Business Administration",
      "Business Communications",
      "Business Management",
      "Business Law",
      "Business-Related Law (from an accredited law school)",
      "Economics",
      "Finance",
      "Marketing",
      "Mathematics",
      "Statistics",
      "Computer Science / Information Systems",
      "Additional Accounting Subjects",
      "Internship / Independent Studies (accounting or business-related)",
    ],
    notes: ["Required to sit for the CPA Exam."],
  },
  {
    key: "accountingStudy",
    title: "Accounting Study",
    requiredUnits: 20,
    subjects: [
      "At least 6 units of Accounting Subjects",
      "No more than 14 units of Business-Related Subjects",
      "Skills courses — e.g. English, Communications, Journalism, sciences (max 3 units)",
      "Cultural / Ethnic studies — e.g. foreign languages, cultural courses (max 3 units)",
      "Industry courses — e.g. engineering, real estate, government & society (max 3 units)",
    ],
    notes: [
      "Required for licensure (not for the exam).",
      "✅ Waived entirely if you hold a Master's degree in Accounting, Taxation, or Laws in Taxation.",
      "Sub-caps (the 6-unit minimum, 14-unit maximum, and 3-unit category limits) are shown for reference but not yet enforced by this tool.",
    ],
  },
  {
    key: "ethics",
    title: "Ethics Study",
    requiredUnits: 10,
    subjects: [
      "At least 3 units: Accounting Ethics, Accountants' Professional Responsibilities, Auditing, or Fraud",
      "Up to 7 units: Business Law, Corporate Governance, Corporate Social Responsibility, Ethics, Morals, Organizational Behavior, Business Leadership, Legal Environment of Business, Human Resource Management, Management of Organizations",
      "No more than 3 units: introductory Philosophy, Religion, or Theology",
    ],
    notes: [
      "Required for licensure (not for the exam).",
      "Course titles for the Philosophy/Religion/Theology portion must include words like General, Introduction, Foundations, Fundamentals, Principles, or Survey of.",
    ],
  },
];
