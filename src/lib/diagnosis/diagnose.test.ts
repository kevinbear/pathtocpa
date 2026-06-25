import { describe, expect, it } from "vitest";
import { diagnose } from "./diagnose";

describe("diagnose", () => {
  it("recommends finishing a bachelor's when there's no degree", () => {
    expect(diagnose({ degreeLevel: "none", major: "other" }).recommendedKey).toBe("bachelors_first");
  });

  it("marks a qualifying master's as ready (accounting study waived)", () => {
    const d = diagnose({ degreeLevel: "masters", mastersField: "taxation", major: "other" });
    expect(d.recommendedKey).toBe("ready");
    expect(d.reasons.join(" ")).toMatch(/waives/i);
  });

  it("recommends topping up for an accounting bachelor's", () => {
    expect(diagnose({ degreeLevel: "bachelors", major: "accounting" }).recommendedKey).toBe("topup");
  });

  it("recommends a post-bacc cert for a non-accounting bachelor's", () => {
    expect(diagnose({ degreeLevel: "bachelors", major: "other" }).recommendedKey).toBe("postbacc");
  });

  it("non-qualifying master's still routes by undergrad major", () => {
    const d = diagnose({ degreeLevel: "masters", mastersField: "other", major: "business" });
    expect(d.recommendedKey).toBe("topup");
  });
});
