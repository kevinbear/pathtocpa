import { describe, expect, it } from "vitest";
import { californiaRuleSet as CA } from "../rules/california";
import { computeJourney } from "./computeJourney";
import type { Profile } from "../data/types";
import type { Course } from "../eligibility/types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    degreeLevel: "none",
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

/** Just enough to SIT: a degree + 24 accounting + 24 business (no 150 / study units). */
function sitCourses(): Course[] {
  return [course("accounting", 24), course("business", 24)];
}

/** Full licensure education: 150 units incl. accounting study + ethics study. */
function licensedCourses(): Course[] {
  return [
    course("accounting", 24),
    course("business", 24),
    course("accountingStudy", 20),
    course("ethics", 10),
    course("other", 72),
  ];
}

describe("computeJourney — 5-step model", () => {
  it("starts everyone at 'qualify to sit' with 0% and five steps", () => {
    const j = computeJourney({ courses: [], profile: profile() }, CA);
    expect(j.currentStageKey).toBe("qualify");
    expect(j.overallPercent).toBe(0);
    expect(j.allComplete).toBe(false);
    expect(j.stages).toHaveLength(5);
    expect(j.stages.map((s) => s.key)).toEqual([
      "qualify",
      "exam",
      "experience",
      "licenseEd",
      "license",
    ]);
  });

  it("separates sitting from licensure: 24/24 + degree qualifies to sit but NOT licensure education", () => {
    const j = computeJourney(
      { courses: sitCourses(), profile: profile({ degreeLevel: "bachelors" }) },
      CA,
    );
    const qualify = j.stages.find((s) => s.key === "qualify")!;
    const licenseEd = j.stages.find((s) => s.key === "licenseEd")!;
    expect(qualify.status).toBe("done"); // can sit for the exam
    expect(licenseEd.status).not.toBe("done"); // but not done with licensure education (no 150 / study)
  });

  it("marks exam and experience as parallel steps", () => {
    const j = computeJourney({ courses: [], profile: profile() }, CA);
    expect(j.stages.find((s) => s.key === "exam")!.parallel).toBe(true);
    expect(j.stages.find((s) => s.key === "experience")!.parallel).toBe(true);
  });

  it("tracks exam progress as a fraction of the four sections", () => {
    const j = computeJourney(
      { courses: [], profile: profile({ examSectionsPassed: ["AUD", "FAR"] }) },
      CA,
    );
    expect(j.stages.find((s) => s.key === "exam")!.percent).toBe(50);
  });

  it("caps experience at 12 months", () => {
    const j = computeJourney({ courses: [], profile: profile({ experienceMonths: 18 }) }, CA);
    const exp = j.stages.find((s) => s.key === "experience")!;
    expect(exp.percent).toBe(100);
    expect(exp.status).toBe("done");
  });

  it("uses Live Scan + application for the license step (no PETH exam)", () => {
    const partial = computeJourney(
      { courses: [], profile: profile({ liveScanDone: true }) },
      CA,
    );
    expect(partial.stages.find((s) => s.key === "license")!.percent).toBe(50);
  });

  it("reaches 100% overall and allComplete when every step is finished", () => {
    const j = computeJourney(
      {
        courses: licensedCourses(),
        profile: profile({
          degreeLevel: "bachelors",
          examSectionsPassed: ["AUD", "FAR", "REG", "DISC"],
          experienceMonths: 12,
          liveScanDone: true,
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
