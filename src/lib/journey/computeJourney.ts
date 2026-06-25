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
export type StageKey = "education" | "exam" | "experience" | "ethics";

export interface Stage {
  key: StageKey;
  title: string;
  emoji: string;
  status: StageStatus;
  /** 0–100. */
  percent: number;
  summary: string;
  nextActions: string[];
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
 * Derive the four-stage CPA journey from a student's coursework and profile.
 * Pure and deterministic. Education progress comes straight from the eligibility
 * engine; the later stages come from self-reported profile fields.
 */
export function computeJourney(
  input: JourneyInput,
  ruleSet: RuleSet,
  options: EvaluateOptions = {},
): Journey {
  const { profile } = input;

  // --- Stage 1: Education (from the eligibility engine) ---
  const hasBachelors = profileHasBachelors(profile);
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
  const bachelorPct = hasBachelors ? 100 : 0;
  const educationPercent = elig.license.eligible
    ? 100
    : round(mean([bachelorPct, ...elig.license.categories.map((c) => c.percent)]));
  const education: Stage = {
    key: "education",
    title: "Education",
    emoji: "🎓",
    status: elig.license.eligible ? "done" : statusFrom(educationPercent),
    percent: educationPercent,
    summary: `${elig.totalSemesterUnits} of ${ruleSet.license.totalUnits} semester units`,
    nextActions: elig.license.missing,
  };

  // --- Stage 2: Exam ---
  const passed = profile.examSectionsPassed.length;
  const examPercent = round(Math.min(100, (passed / EXAM_SLOTS.length) * 100));
  const remainingSlots = EXAM_SLOTS.filter(
    (s) => !profile.examSectionsPassed.includes(s.key),
  );
  const exam: Stage = {
    key: "exam",
    title: "CPA Exam",
    emoji: "📝",
    status: statusFrom(examPercent),
    percent: examPercent,
    summary: `${passed} of ${EXAM_SLOTS.length} sections passed`,
    nextActions: remainingSlots.map((s) => `Pass ${s.label}`),
  };

  // --- Stage 3: Experience ---
  const months = Math.max(0, profile.experienceMonths || 0);
  const experiencePercent = round(
    Math.min(100, (months / EXPERIENCE_MONTHS_REQUIRED) * 100),
  );
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
  };

  // --- Stage 4: Ethics & License ---
  const ethicsActions: string[] = [];
  if (!profile.pethPassed) ethicsActions.push("Pass the PETH professional ethics exam");
  if (!profile.licenseSubmitted) ethicsActions.push("Submit your CBA license application");
  const ethicsPercent = (profile.pethPassed ? 50 : 0) + (profile.licenseSubmitted ? 50 : 0);
  const ethics: Stage = {
    key: "ethics",
    title: "Ethics & License",
    emoji: "✅",
    status: statusFrom(ethicsPercent),
    percent: ethicsPercent,
    summary: profile.licenseSubmitted
      ? "License application submitted"
      : profile.pethPassed
        ? "Ethics exam passed"
        : "Not started",
    nextActions: ethicsActions,
  };

  const stages = [education, exam, experience, ethics];
  const overallPercent = round(mean(stages.map((s) => s.percent)));
  const allComplete = stages.every((s) => s.status === "done");

  const current = stages.find((s) => s.status !== "done") ?? stages[stages.length - 1];
  const nextStep = allComplete
    ? "🎉 You've completed every stage — congratulations, you're a CPA!"
    : current.nextActions[0] ?? `Continue your ${current.title.toLowerCase()} progress`;

  return {
    stages,
    overallPercent,
    currentStageKey: current.key,
    nextStep,
    allComplete,
  };
}
