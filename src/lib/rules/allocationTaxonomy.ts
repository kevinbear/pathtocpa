import type { CourseCategory } from "../eligibility/types";

/**
 * Drop-zone taxonomy for the Allocate board, transcribed from the CBA flyer.
 * Each section maps to a top-level requirement category; each leaf sub-zone is a
 * droppable target. `cap` marks "no more than N units" sub-limits; `min` marks
 * "at least N units" sub-requirements (shown as guidance on the board).
 */
export interface SubZone {
  id: string;
  label: string;
  /** Example subjects that belong here (shown as a hint). */
  examples?: string;
  /** "No more than N units" cap for this sub-zone. */
  cap?: number;
  /** "At least N units" guidance for this sub-zone. */
  min?: number;
}

export interface AllocSection {
  key: Exclude<CourseCategory, "other">;
  title: string;
  requiredUnits: number;
  subzones: SubZone[];
}

export const ALLOCATION_TAXONOMY: AllocSection[] = [
  {
    key: "accounting",
    title: "Accounting Subjects",
    requiredUnits: 24,
    subzones: [
      { id: "acc-accounting", label: "Accounting" },
      { id: "acc-auditing", label: "Auditing" },
      { id: "acc-taxation", label: "Taxation" },
      { id: "acc-financial-reporting", label: "Financial Reporting" },
      { id: "acc-fsa", label: "Financial Statement Analysis" },
      { id: "acc-ext-int-reporting", label: "External / Internal Reporting" },
    ],
  },
  {
    key: "business",
    title: "Business-Related Subjects",
    requiredUnits: 24,
    subzones: [
      { id: "bus-admin", label: "Business Administration" },
      { id: "bus-comms", label: "Business Communications" },
      { id: "bus-management", label: "Business Management" },
      { id: "bus-law", label: "Business Law" },
      { id: "bus-economics", label: "Economics" },
      { id: "bus-finance", label: "Finance" },
      { id: "bus-marketing", label: "Marketing" },
      { id: "bus-math", label: "Mathematics" },
      { id: "bus-statistics", label: "Statistics" },
      { id: "bus-cs", label: "Computer Science / Information Systems" },
      { id: "bus-additional-accounting", label: "Additional Accounting Subjects" },
      { id: "bus-related-law", label: "Business-Related Law", examples: "from an accredited law school" },
      { id: "bus-internship", label: "Internship / Independent Studies" },
    ],
  },
  {
    key: "accountingStudy",
    title: "Accounting Study",
    requiredUnits: 20,
    subzones: [
      { id: "as-accounting", label: "Accounting Subjects", min: 6, examples: "at least 6 units" },
      { id: "as-business", label: "Business-Related Subjects", cap: 14, examples: "no more than 14 units" },
      { id: "as-skills", label: "Skills", cap: 3, examples: "English, Communications, Journalism, sciences" },
      { id: "as-cultural", label: "Cultural / Ethnic", cap: 3, examples: "languages, culture, ethnic studies" },
      { id: "as-industry", label: "Industry", cap: 3, examples: "engineering, real estate, government & society" },
    ],
  },
  {
    key: "ethics",
    title: "Ethics Study",
    requiredUnits: 10,
    subzones: [
      { id: "eth-core", label: "Accounting Ethics / Prof. Responsibilities / Auditing / Fraud", min: 3, examples: "at least 3 units" },
      {
        id: "eth-broad",
        label: "Business ethics & related",
        cap: 7,
        examples: "business law, corporate governance, CSR, organizational behavior…",
      },
      { id: "eth-philosophy", label: "Philosophy / Religion / Theology", cap: 3, examples: "intro-level only" },
    ],
  },
];

/** Look up which section a sub-zone id belongs to. */
export const SUBZONE_TO_CATEGORY: Record<string, Exclude<CourseCategory, "other">> =
  Object.fromEntries(
    ALLOCATION_TAXONOMY.flatMap((s) => s.subzones.map((z) => [z.id, s.key])),
  );

/** Look up a sub-zone's full definition (label, cap, min) by id. */
export const SUBZONE_BY_ID: Record<string, SubZone> = Object.fromEntries(
  ALLOCATION_TAXONOMY.flatMap((s) => s.subzones.map((z) => [z.id, z])),
);
