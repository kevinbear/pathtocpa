import { describe, expect, it } from "vitest";
import { rawRowsToDrafts, validateDraft, type DraftCourse } from "./courseImport";

function draft(overrides: Partial<DraftCourse> = {}): DraftCourse {
  return {
    code: "",
    name: "Intermediate Accounting",
    units: "3",
    category: "accounting",
    unitType: "semester",
    completed: "yes",
    institution: "",
    term: "",
    ...overrides,
  };
}

describe("rawRowsToDrafts", () => {
  it("maps standard headers into drafts", () => {
    const { drafts, missingColumns, empty } = rawRowsToDrafts([
      { name: "Intermediate Accounting I", units: "3", category: "accounting" },
    ]);
    expect(empty).toBe(false);
    expect(missingColumns).toEqual([]);
    expect(drafts[0]).toMatchObject({
      name: "Intermediate Accounting I",
      units: "3",
      category: "accounting",
      unitType: "semester", // defaulted
      completed: "yes", // defaulted
    });
  });

  it("accepts header aliases and value aliases", () => {
    const { drafts, missingColumns } = rawRowsToDrafts([
      { Course: "Business Law", Credits: "4", Requirement: "business-related", Type: "quarter", Status: "no" },
    ]);
    expect(missingColumns).toEqual([]);
    expect(drafts[0]).toMatchObject({
      name: "Business Law",
      units: "4",
      category: "business",
      unitType: "quarter",
      completed: "no",
    });
  });

  it("reports missing required columns", () => {
    const { missingColumns } = rawRowsToDrafts([{ name: "X", school: "CSUF" }]);
    expect(missingColumns).toContain("units");
    expect(missingColumns).toContain("category");
    expect(missingColumns).not.toContain("name");
  });

  it("flags unrecognized category as empty (to be fixed in preview)", () => {
    const { drafts } = rawRowsToDrafts([
      { name: "Yoga", units: "1", category: "wellness" },
    ]);
    expect(drafts[0].category).toBe("");
  });

  it("drops entirely-blank rows", () => {
    const { drafts } = rawRowsToDrafts([
      { name: "Real", units: "3", category: "accounting" },
      { name: "", units: "", category: "" },
    ]);
    expect(drafts).toHaveLength(1);
  });

  it("treats no rows as empty with all required columns missing", () => {
    const { empty, missingColumns } = rawRowsToDrafts([]);
    expect(empty).toBe(true);
    expect(missingColumns).toEqual(["name", "units", "category"]);
  });
});

describe("validateDraft", () => {
  it("accepts a well-formed draft and builds a Course", () => {
    const v = validateDraft(draft({ institution: "CSUF", term: "Fall 2025", completed: "no" }));
    expect(v.valid).toBe(true);
    expect(v.course).toMatchObject({
      name: "Intermediate Accounting",
      units: 3,
      unitType: "semester",
      category: "accounting",
      institution: "CSUF",
      term: "Fall 2025",
      completed: false,
    });
  });

  it("rejects missing name and bad units", () => {
    const v = validateDraft(draft({ name: "", units: "-2" }));
    expect(v.valid).toBe(false);
    expect(v.fieldErrors.name).toBeDefined();
    expect(v.fieldErrors.units).toBeDefined();
  });

  it("rejects unrecognized category/unitType/completed", () => {
    const v = validateDraft(draft({ category: "", unitType: "", completed: "" }));
    expect(v.valid).toBe(false);
    expect(v.fieldErrors.category).toBeDefined();
    expect(v.fieldErrors.unitType).toBeDefined();
    expect(v.fieldErrors.completed).toBeDefined();
  });
});
