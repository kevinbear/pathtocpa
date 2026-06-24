import { describe, expect, it } from "vitest";
import { californiaRuleSet as CA } from "../rules/california";
import { computeJourney } from "./computeJourney";
import type { Profile } from "../data/types";
import type { Course } from "../eligibility/types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    hasBachelorsDegree: false,
    examSectionsPassed: [],
    experienceMonths: 0,
    pethPassed: false,
    licenseSubmitted: false,
    ...overrides,
  };
}

let n = 0;
function course(category: Course["category"], units: number): Course {
  n += 1;
  return {
    id: `c${n}`,
    name: `course ${n}`,
    units,
    unitType: "semester",
    category,
    completed: true,
  };
}

function licensedCourses(): Course[] {
  return [
    course("accounting", 24),
    course("business", 24),
    course("accountingStudy", 20),
    course("ethics", 10),
    course("other", 72),
  ];
}

describe("computeJourney", () => {
  it("starts everyone at the education stage with 0% overall", () => {
    const j = computeJourney({ courses: [], profile: profile() }, CA);
    expect(j.currentStageKey).toBe("education");
    expect(j.overallPercent).toBe(0);
    expect(j.allComplete).toBe(false);
    expect(j.stages).toHaveLength(4);
  });

  it("marks education done once licensure education is met", () => {
    const j = computeJourney(
      { courses: licensedCourses(), profile: profile({ hasBachelorsDegree: true }) },
      CA,
    );
    const edu = j.stages.find((s) => s.key === "education")!;
    expect(edu.status).toBe("done");
    expect(edu.percent).toBe(100);
    // With education done, the current stage advances to the exam.
    expect(j.currentStageKey).toBe("exam");
  });

  it("tracks exam progress as a fraction of the four sections", () => {
    const j = computeJourney(
      { courses: [], profile: profile({ examSectionsPassed: ["AUD", "FAR"] }) },
      CA,
    );
    const exam = j.stages.find((s) => s.key === "exam")!;
    expect(exam.percent).toBe(50);
    expect(exam.status).toBe("in_progress");
  });

  it("caps experience at 12 months", () => {
    const j = computeJourney(
      { courses: [], profile: profile({ experienceMonths: 18 }) },
      CA,
    );
    const exp = j.stages.find((s) => s.key === "experience")!;
    expect(exp.percent).toBe(100);
    expect(exp.status).toBe("done");
  });

  it("reaches 100% overall and allComplete when every stage is finished", () => {
    const j = computeJourney(
      {
        courses: licensedCourses(),
        profile: profile({
          hasBachelorsDegree: true,
          examSectionsPassed: ["AUD", "FAR", "REG", "DISC"],
          experienceMonths: 12,
          pethPassed: true,
          licenseSubmitted: true,
        }),
      },
      CA,
    );
    expect(j.overallPercent).toBe(100);
    expect(j.allComplete).toBe(true);
    expect(j.nextStep).toContain("congratulations");
  });
});
