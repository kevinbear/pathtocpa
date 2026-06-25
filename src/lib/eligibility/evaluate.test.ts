import { describe, expect, it } from "vitest";
import { californiaRuleSet as CA } from "../rules/california";
import { evaluate } from "./evaluate";
import { toSemesterUnits } from "./units";
import type { Course, CourseCategory, UnitType } from "./types";

let idCounter = 0;

function course(
  category: CourseCategory,
  units: number,
  opts: { unitType?: UnitType; completed?: boolean } = {},
): Course {
  idCounter += 1;
  return {
    id: `c${idCounter}`,
    name: `${category} course ${idCounter}`,
    units,
    unitType: opts.unitType ?? "semester",
    category,
    completed: opts.completed ?? true,
  };
}

/** A coursework set that fully satisfies California licensure. */
function licensedCourses(): Course[] {
  return [
    course("accounting", 24),
    course("business", 24),
    course("accountingStudy", 20),
    course("ethics", 10),
    course("other", 72), // brings total to 150
  ];
}

describe("toSemesterUnits", () => {
  it("passes semester units through unchanged", () => {
    expect(toSemesterUnits(24, "semester")).toBe(24);
  });

  it("converts quarter units exactly for clean cases", () => {
    expect(toSemesterUnits(36, "quarter")).toBe(24);
    expect(toSemesterUnits(3, "quarter")).toBe(2);
  });
});

describe("evaluate — exam eligibility", () => {
  it("is not eligible with no coursework", () => {
    const r = evaluate({ courses: [], hasBachelorsDegree: true }, CA);
    expect(r.exam.eligible).toBe(false);
    expect(r.exam.missing).toContain(
      "24 more accounting units needed (have 0 of 24).",
    );
  });

  it("is exam-eligible with 24 accounting + 24 business + a degree", () => {
    const r = evaluate(
      { courses: [course("accounting", 24), course("business", 24)], hasBachelorsDegree: true },
      CA,
    );
    expect(r.exam.eligible).toBe(true);
    expect(r.exam.missing).toEqual([]);
  });

  it("blocks exam eligibility without a bachelor's degree", () => {
    const r = evaluate(
      { courses: [course("accounting", 24), course("business", 24)], hasBachelorsDegree: false },
      CA,
    );
    expect(r.exam.eligible).toBe(false);
    expect(r.exam.missing).toContain(
      "A bachelor's degree is required to sit for the exam.",
    );
  });

  it("reports the exact remaining accounting units", () => {
    const r = evaluate(
      { courses: [course("accounting", 18), course("business", 24)], hasBachelorsDegree: true },
      CA,
    );
    expect(r.exam.eligible).toBe(false);
    const acct = r.exam.categories.find((c) => c.key === "accounting");
    expect(acct?.remaining).toBe(6);
    expect(acct?.percent).toBe(75);
  });
});

describe("evaluate — license eligibility", () => {
  it("can be exam-eligible but not license-eligible", () => {
    const r = evaluate(
      { courses: [course("accounting", 24), course("business", 24)], hasBachelorsDegree: true },
      CA,
    );
    expect(r.exam.eligible).toBe(true);
    expect(r.license.eligible).toBe(false);
    expect(r.license.missing).toContain(
      "102 more total semester units needed (have 48 of 150).",
    );
  });

  it("is fully license-eligible with a complete 150-unit plan", () => {
    const r = evaluate({ courses: licensedCourses(), hasBachelorsDegree: true }, CA);
    expect(r.totalSemesterUnits).toBe(150);
    expect(r.license.eligible).toBe(true);
    expect(r.license.missing).toEqual([]);
    expect(r.exam.eligible).toBe(true);
  });

  it("requires accounting study and ethics for licensure specifically", () => {
    const r = evaluate(
      {
        courses: [
          course("accounting", 24),
          course("business", 24),
          course("other", 102), // 150 total, but no accounting study / ethics
        ],
        hasBachelorsDegree: true,
      },
      CA,
    );
    expect(r.totalSemesterUnits).toBe(150);
    expect(r.license.eligible).toBe(false);
    expect(r.license.missing).toContain(
      "20 more accounting study units needed (have 0 of 20).",
    );
    expect(r.license.missing).toContain(
      "10 more ethics study units needed (have 0 of 10).",
    );
  });
});

describe("evaluate — accounting → business overflow", () => {
  it("counts accounting units beyond 24 toward the business requirement", () => {
    // 48 accounting, 0 business → 24 overflow satisfies the 24 business requirement.
    const r = evaluate(
      { courses: [course("accounting", 48)], hasBachelorsDegree: true },
      CA,
    );
    const business = r.exam.categories.find((c) => c.key === "business")!;
    expect(business.completed).toBe(24);
    expect(business.overflow).toBe(24);
    expect(r.exam.eligible).toBe(true);
  });

  it("does not overflow when accounting is at or below 24", () => {
    const r = evaluate(
      { courses: [course("accounting", 24), course("business", 10)], hasBachelorsDegree: true },
      CA,
    );
    const business = r.exam.categories.find((c) => c.key === "business")!;
    expect(business.completed).toBe(10);
    expect(business.overflow).toBeUndefined();
  });
});

describe("evaluate — contributors", () => {
  it("lists real courses with their id and category for the breakdown", () => {
    const c = course("accounting", 3);
    const r = evaluate({ courses: [c], hasBachelorsDegree: true }, CA);
    const accounting = r.license.categories.find((x) => x.key === "accounting")!;
    const contributor = accounting.contributors?.find((x) => x.courseId === c.id);
    expect(contributor).toBeDefined();
    expect(contributor?.category).toBe("accounting");
    expect(contributor?.units).toBe(3);
  });
});

describe("evaluate — accounting study waiver", () => {
  it("waives the accounting study requirement for a qualifying master's", () => {
    const r = evaluate(
      {
        courses: [course("accounting", 24), course("business", 24), course("ethics", 10), course("other", 92)],
        hasBachelorsDegree: true,
        waivesAccountingStudy: true,
      },
      CA,
    );
    const study = r.license.categories.find((c) => c.key === "accountingStudy")!;
    expect(study.satisfied).toBe(true);
    expect(study.waived).toBe(true);
    expect(r.license.eligible).toBe(true);
    expect(r.license.missing).not.toContain(
      "20 more accounting study units needed (have 0 of 20).",
    );
  });

  it("still requires accounting study without the waiver", () => {
    const r = evaluate(
      {
        courses: [course("accounting", 24), course("business", 24), course("ethics", 10), course("other", 92)],
        hasBachelorsDegree: true,
      },
      CA,
    );
    const study = r.license.categories.find((c) => c.key === "accountingStudy")!;
    expect(study.satisfied).toBe(false);
    expect(r.license.eligible).toBe(false);
  });
});

describe("evaluate — quarter units & options", () => {
  it("counts converted quarter units toward requirements", () => {
    const r = evaluate(
      {
        courses: [
          course("accounting", 36, { unitType: "quarter" }), // → 24 semester
          course("business", 36, { unitType: "quarter" }), // → 24 semester
        ],
        hasBachelorsDegree: true,
      },
      CA,
    );
    expect(r.unitsByCategory.accounting).toBe(24);
    expect(r.exam.eligible).toBe(true);
  });

  it("ignores planned courses by default but counts them with countPlanned", () => {
    const courses = [
      course("accounting", 24, { completed: false }),
      course("business", 24, { completed: false }),
    ];
    const current = evaluate({ courses, hasBachelorsDegree: true }, CA);
    expect(current.exam.eligible).toBe(false);

    const projected = evaluate({ courses, hasBachelorsDegree: true }, CA, {
      countPlanned: true,
    });
    expect(projected.exam.eligible).toBe(true);
  });
});
