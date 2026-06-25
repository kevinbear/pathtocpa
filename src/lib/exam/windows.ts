// California CPA exam time windows. Durations verified against the CBA and NASBA
// (June 2026). These are a planning aid — always confirm on the official pages
// linked in each window's `sources`.

export type ExamWindowKey = "att" | "nts" | "credit";

export type ProfileDateField =
  | "attIssuedDate"
  | "ntsIssuedDate"
  | "firstSectionPassedDate";

export interface ExamWindowDef {
  key: ExamWindowKey;
  title: string;
  blurb: string;
  /** Window length — exactly one of months/days is set. */
  months?: number;
  days?: number;
  /** Plain-English label for the length (e.g. "90 days", "9 months"). */
  lengthLabel: string;
  /** What happens if the window lapses. */
  lapseNote: string;
  /** Which profile date starts the clock, and a label for its input. */
  startField: ProfileDateField;
  startLabel: string;
  sources: { label: string; url: string }[];
}

export const EXAM_WINDOWS: ExamWindowDef[] = [
  {
    key: "att",
    title: "Pay NASBA before your authorization expires",
    blurb:
      "After the CBA approves you and sends your authorization to NASBA, you have 90 days to select your sections and pay the fees.",
    days: 90,
    lengthLabel: "90 days",
    lapseNote:
      "Your application expires and the application fee is forfeited — you'd re-apply with the CBA and pay the $50 re-application fee.",
    startField: "attIssuedDate",
    startLabel: "Date your payment coupon / authorization was issued",
    sources: [
      { label: "CBA Exam FAQs", url: "https://www.dca.ca.gov/cba/applicants/exam-faqs.shtml" },
      { label: "Log in to NASBA", url: "https://okta.nasba.org/" },
    ],
  },
  {
    key: "nts",
    title: "Schedule & sit your section (NTS window)",
    blurb:
      "California's Notice to Schedule is valid for 9 months (longer than the typical 6). Schedule and take each paid section before it expires.",
    months: 9,
    lengthLabel: "9 months",
    lapseNote: "The NTS expires and the exam fees for those sections are forfeited.",
    startField: "ntsIssuedDate",
    startLabel: "Date your NTS was issued",
    sources: [
      { label: "CBA Exam FAQs", url: "https://www.dca.ca.gov/cba/applicants/exam-faqs.shtml" },
      { label: "Log in to NASBA", url: "https://okta.nasba.org/" },
    ],
  },
  {
    key: "credit",
    title: "Pass the remaining sections (30-month credit)",
    blurb:
      "Once your first section's passing score is released, a rolling 30-month clock starts to pass the other three (California, for sections passed from January 2024).",
    months: 30,
    lengthLabel: "30 months",
    lapseNote: "Your earliest passed section expires and must be retaken.",
    startField: "firstSectionPassedDate",
    startLabel: "Date your first section's score was released",
    sources: [
      {
        label: "CBA credit period",
        url: "https://www.dca.ca.gov/cba/applicants/exam-credit-extensions.shtml",
      },
      {
        label: "NASBA 30-month rule",
        url: "https://nasba.org/blog/2023/04/24/nasba-announces-historic-exam-rule-amendment/",
      },
    ],
  },
];

export type WindowState = "ok" | "soon" | "urgent" | "expired";

export interface WindowStatus {
  deadline: Date;
  totalDays: number;
  remainingDays: number;
  /** 0–100, how much of the window has elapsed. */
  elapsedPct: number;
  state: WindowState;
}

const MS_PER_DAY = 86_400_000;

/** Add whole calendar months to a date (clamps end-of-month overflow). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

/**
 * Compute a window's status from its start date and "now". Pure — pass `now`
 * explicitly so it's deterministic and testable.
 */
export function computeWindow(def: ExamWindowDef, startISO: string, now: Date): WindowStatus {
  const start = new Date(`${startISO}T00:00:00`);
  const deadline =
    def.months != null
      ? addMonths(start, def.months)
      : new Date(start.getTime() + (def.days ?? 0) * MS_PER_DAY);

  const totalDays = Math.round((deadline.getTime() - start.getTime()) / MS_PER_DAY);
  const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / MS_PER_DAY);
  const elapsedPct = Math.min(
    100,
    Math.max(0, Math.round(((totalDays - remainingDays) / totalDays) * 100)),
  );

  let state: WindowState;
  if (remainingDays < 0) state = "expired";
  else if (remainingDays <= 14) state = "urgent";
  else if (remainingDays <= 45) state = "soon";
  else state = "ok";

  return { deadline, totalDays, remainingDays, elapsedPct, state };
}

/** Human "X days / months left" label. */
export function remainingLabel(remainingDays: number): string {
  if (remainingDays < 0) return "Expired";
  if (remainingDays <= 60) return `${remainingDays} day${remainingDays === 1 ? "" : "s"} left`;
  const months = Math.round(remainingDays / 30);
  return `~${months} months left`;
}
