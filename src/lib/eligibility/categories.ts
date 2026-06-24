import type { CourseCategory } from "./types";

/** Shared category metadata for forms, tallies, and labels. */
export const CATEGORIES: {
  key: CourseCategory;
  label: string;
  help: string;
}[] = [
  {
    key: "accounting",
    label: "Accounting",
    help: "Accounting, auditing, taxation, financial reporting & analysis.",
  },
  {
    key: "business",
    label: "Business-related",
    help: "Economics, finance, business law, marketing, management, statistics.",
  },
  {
    key: "accountingStudy",
    label: "Accounting study",
    help: "Counts toward the 20-unit accounting study requirement (licensure).",
  },
  {
    key: "ethics",
    label: "Ethics study",
    help: "Counts toward the 10-unit ethics study requirement (licensure).",
  },
  {
    key: "other",
    label: "Other",
    help: "General units that count toward the 150 total only.",
  },
];

export const CATEGORY_LABEL: Record<CourseCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
) as Record<CourseCategory, string>;
