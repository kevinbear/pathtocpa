import { evaluate } from "../eligibility/evaluate";
import type { EvaluateOptions, Course } from "../eligibility/types";
import {
  profileHasBachelors,
  profileWaivesAccountingStudy,
  profileTotalUnits,
  type Profile,
  type ExamSection,
} from "../data/types";
import type { RuleSet } from "../rules/types";

export type StageStatus = "not_started" | "in_progress" | "done";
export type StageKey = "qualify" | "exam" | "experience" | "licenseEd" | "license";

export interface Stage {
  key: StageKey;
  title: string;
  emoji: string;
  status: StageStatus;
  /** 0–100. */
  percent: number;
  summary: string;
  nextActions: string[];
  /** True for the Exam and Experience steps, which run concurrently. */
  parallel?: boolean;
}

export interface Journey {
  stages: Stage[];
  overallPercent: number;
  currentStageKey: StageKey;
  nextStep: string;
  allComplete: boolean;
}

export interface JourneyInput {
  courses: Course[];
  profile: Profile;
}

/** All four exam "slots": 3 Core + 1 Discipline. */
export const EXAM_SLOTS: { key: ExamSection; label: string }[] = [
  { key: "AUD", label: "AUD — Auditing & Attestation" },
  { key: "FAR", label: "FAR — Financial Accounting & Reporting" },
  { key: "REG", label: "REG — Taxation & Regulation" },
  { key: "DISC", label: "Discipline (BAR / ISC / TCP)" },
];

const EXPERIENCE_MONTHS_REQUIRED = 12;

function round(n: number): number {
  return Math.round(n);
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function statusFrom(percent: number): StageStatus {
  if (percent >= 100) return "done";
  if (percent > 0) return "in_progress";
  return "not_started";
}

/**
 * Derive the CPA journey from coursework + profile, modeling California's real flow:
 *
 *   1. Qualify to SIT  — bachelor's + 24 accounting + 24 business (the exam verdict).
 *   2. CPA Exam        ┐ these two run in PARALLEL — experience is not gated
 *   3. Experience      ┘ behind the exam.
 *   4. Licensure education — the full 150 units + 20 accounting study + 10 ethics
 *      study (the license verdict). Needed for the license, not to sit.
 *   5. Apply for license — Live Scan + submit the application. (The PETH ethics
 *      exam was removed by California on July 1, 2024, so it's no longer a step.)
 *
 * Pure and deterministic. Education progress comes from the eligibility engine;
 * later steps come from self-reported profile fields.
 */
export function computeJourney(
  input: JourneyInput,
  ruleSet: RuleSet,
  options: EvaluateOptions = {},
): Journey {
  const { profile } = input;
  const hasBachelors = profileHasBachelors(profile);
  const bachelorPct = hasBachelors ? 100 : 0;

  const elig = evaluate(
    {
      courses: input.courses,
      hasBachelorsDegree: hasBachelors,
      waivesAccountingStudy: profileWaivesAccountingStudy(profile),
      totalUnitsSelfReported: profileTotalUnits(profile).value,
      totalUnitsMeetsMinimum: profileTotalUnits(profile).meetsMinimum,
    },
    ruleSet,
    options,
  );

  // --- Step 1: Qualify to sit (bachelor's + 24/24, from the EXAM verdict) ---
  const qualifyPercent = elig.exam.eligible
    ? 100
    : round(mean([bachelorPct, ...elig.exam.categories.map((c) => c.percent)]));
  const qualify: Stage = {
    key: "qualify",
    title: "Qualify to sit",
    emoji: "🎓",
    status: elig.exam.eligible ? "done" : statusFrom(qualifyPercent),
    percent: qualifyPercent,
    summary: elig.exam.eligible
      ? "Eligible to sit — bachelor's + 24 accounting + 24 business ✓"
      : "Bachelor's + 24 accounting + 24 business units",
    nextActions: elig.exam.missing,
  };

  // --- Step 2: CPA Exam (parallel with experience) ---
  const passed = profile.examSectionsPassed.length;
  const examPercent = round(Math.min(100, (passed / EXAM_SLOTS.length) * 100));
  const remainingSlots = EXAM_SLOTS.filter((s) => !profile.examSectionsPassed.includes(s.key));
  const exam: Stage = {
    key: "exam",
    title: "CPA Exam",
    emoji: "📝",
    status: statusFrom(examPercent),
    percent: examPercent,
    summary: `${passed} of ${EXAM_SLOTS.length} sections passed`,
    nextActions: remainingSlots.map((s) => `Pass ${s.label}`),
    parallel: true,
  };

  // --- Step 3: Experience (parallel with the exam) ---
  const months = Math.max(0, profile.experienceMonths || 0);
  const experiencePercent = round(Math.min(100, (months / EXPERIENCE_MONTHS_REQUIRED) * 100));
  const experience: Stage = {
    key: "experience",
    title: "Experience",
    emoji: "💼",
    status: statusFrom(experiencePercent),
    percent: experiencePercent,
    summary: `${months} of ${EXPERIENCE_MONTHS_REQUIRED} months`,
    nextActions:
      months >= EXPERIENCE_MONTHS_REQUIRED
        ? []
        : [`Log ${EXPERIENCE_MONTHS_REQUIRED - months} more month(s) of qualifying experience`],
    parallel: true,
  };

  // --- Step 4: Finish licensure education (full 150 + study units, LICENSE verdict) ---
  const licenseEdPercent = elig.license.eligible
    ? 100
    : round(mean([bachelorPct, ...elig.license.categories.map((c) => c.percent)]));
  const licenseEd: Stage = {
    key: "licenseEd",
    title: "Licensure education",
    emoji: "📚",
    status: elig.license.eligible ? "done" : statusFrom(licenseEdPercent),
    percent: licenseEdPercent,
    summary: `${elig.totalSemesterUnits} of ${ruleSet.license.totalUnits} units · +20 accounting study · +10 ethics study`,
    nextActions: elig.license.missing,
  };

  // --- Step 5: Apply for license (Live Scan + application; no PETH exam) ---
  const liveScan = !!profile.liveScanDone;
  const licenseActions: string[] = [];
  if (!liveScan) licenseActions.push("Complete Live Scan fingerprinting");
  if (!profile.licenseSubmitted) licenseActions.push("Submit your CBA license application");
  const licensePercent = (liveScan ? 50 : 0) + (profile.licenseSubmitted ? 50 : 0);
  const license: Stage = {
    key: "license",
    title: "Apply for license",
    emoji: "✅",
    status: statusFrom(licensePercent),
    percent: licensePercent,
    summary: profile.licenseSubmitted
      ? "License application submitted"
      : liveScan
        ? "Live Scan done — submit your application"
        : "Live Scan + submit application",
    nextActions: licenseActions,
  };

  const stages = [qualify, exam, experience, licenseEd, license];
  const overallPercent = round(mean(stages.map((s) => s.percent)));
  const allComplete = stages.every((s) => s.status === "done");

  const current = stages.find((s) => s.status !== "done") ?? stages[stages.length - 1];
  const nextStep = allComplete
    ? "🎉 You've completed every step — congratulations, you're a CPA!"
    : current.nextActions[0] ?? `Continue your ${current.title.toLowerCase()} progress`;

  return {
    stages,
    overallPercent,
    currentStageKey: current.key,
    nextStep,
    allComplete,
  };
}
