import { describe, expect, it } from "vitest";
import { classifyCourse, looksMismatched, strictFit } from "./classify";

describe("classifyCourse", () => {
  it("recognizes accounting subjects", () => {
    expect(classifyCourse("Auditing").category).toBe("accounting");
    expect(classifyCourse("Concepts of Federal Income Tax").category).toBe("accounting");
    expect(classifyCourse("Intermediate Accounting I").category).toBe("accounting");
    expect(classifyCourse("Seminar in Financial Statement Analysis").subject).toBe("acc-fsa");
  });

  it("recognizes business subjects", () => {
    expect(classifyCourse("Principles of Marketing").category).toBe("business");
    expect(classifyCourse("Microeconomics").category).toBe("business");
    expect(classifyCourse("Business Database Design").subject).toBe("bus-cs");
    expect(classifyCourse("Probability and Statistics").subject).toBe("bus-statistics");
  });

  it("recognizes ethics subjects", () => {
    expect(classifyCourse("Accounting Ethics for Professionals").category).toBe("ethics");
    expect(classifyCourse("Introduction to Philosophy").subject).toBe("eth-philosophy");
  });

  it("returns null for unrecognizable names", () => {
    expect(classifyCourse("Yoga").category).toBeNull();
  });
});

describe("looksMismatched — respects CBA cross-listing", () => {
  it("does NOT flag Auditing in Ethics (it counts toward both)", () => {
    expect(looksMismatched("Auditing", "ethics").mismatch).toBe(false);
  });
  it("does NOT flag Business Law in Ethics", () => {
    expect(looksMismatched("Business Law", "ethics").mismatch).toBe(false);
  });
  it("does NOT flag an accounting course in Business (additional accounting)", () => {
    expect(looksMismatched("Advanced Accounting", "business").mismatch).toBe(false);
  });
  it("DOES flag a business course in Accounting", () => {
    expect(looksMismatched("Principles of Marketing", "accounting").mismatch).toBe(true);
  });
  it("DOES flag a philosophy course in Business", () => {
    expect(looksMismatched("Introduction to Philosophy", "business").mismatch).toBe(true);
  });
});

describe("classifyCourse — widened business coverage", () => {
  it("recognizes Program Design and Calculus as business", () => {
    expect(classifyCourse("Program Design").category).toBe("business");
    expect(classifyCourse("Calculus II").category).toBe("business");
  });
});

describe("strictFit — positive-match guardrail (hard block)", () => {
  it("blocks a math course from Accounting Subjects", () => {
    const f = strictFit("Calculus II", "accounting");
    expect(f.ok).toBe(false);
    expect(f.guess).toBe("business");
  });
  it("allows math/CS in Business-Related", () => {
    expect(strictFit("Calculus II", "business").ok).toBe(true);
    expect(strictFit("Program Design", "business").ok).toBe(true);
  });
  it("allows accounting to overflow into Business-Related", () => {
    expect(strictFit("Advanced Accounting", "business").ok).toBe(true);
  });
  it("blocks a business course from Accounting Subjects", () => {
    expect(strictFit("Business Law", "accounting").ok).toBe(false);
  });
  it("blocks unrecognized courses from every subject requirement", () => {
    expect(strictFit("Yoga", "accounting").ok).toBe(false);
    expect(strictFit("Yoga", "business").ok).toBe(false);
    expect(strictFit("Yoga", "ethics").ok).toBe(false);
  });
  it("keeps Auditing eligible for Ethics Study (cross-listing preserved)", () => {
    expect(strictFit("Auditing", "ethics").ok).toBe(true);
  });
});
