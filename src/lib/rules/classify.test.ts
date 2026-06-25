import { describe, expect, it } from "vitest";
import { classifyCourse } from "./classify";

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
