import { describe, expect, it } from "vitest";
import { EXAM_WINDOWS, addMonths, computeWindow, remainingLabel } from "./windows";

const att = EXAM_WINDOWS.find((w) => w.key === "att")!;
const nts = EXAM_WINDOWS.find((w) => w.key === "nts")!;
const credit = EXAM_WINDOWS.find((w) => w.key === "credit")!;

describe("addMonths", () => {
  it("adds whole calendar months", () => {
    expect(addMonths(new Date("2026-01-15T00:00:00"), 9).toISOString().slice(0, 10)).toBe(
      "2026-10-15",
    );
  });
});

describe("computeWindow — durations", () => {
  it("ATT is a 90-day window", () => {
    const r = computeWindow(att, "2026-01-01", new Date("2026-01-01T00:00:00"));
    expect(r.totalDays).toBe(90);
    expect(r.deadline.toISOString().slice(0, 10)).toBe("2026-04-01");
  });

  it("NTS is a 9-month window", () => {
    const r = computeWindow(nts, "2026-01-10", new Date("2026-01-10T00:00:00"));
    expect(r.deadline.toISOString().slice(0, 10)).toBe("2026-10-10");
  });

  it("credit is a 30-month window", () => {
    const r = computeWindow(credit, "2026-03-01", new Date("2026-03-01T00:00:00"));
    expect(r.deadline.toISOString().slice(0, 10)).toBe("2028-09-01");
  });
});

describe("computeWindow — state thresholds", () => {
  it("is 'ok' early in the window", () => {
    const r = computeWindow(nts, "2026-01-01", new Date("2026-02-01T00:00:00"));
    expect(r.state).toBe("ok");
    expect(r.remainingDays).toBeGreaterThan(45);
  });

  it("is 'urgent' within 14 days of the deadline", () => {
    const r = computeWindow(att, "2026-01-01", new Date("2026-03-25T00:00:00")); // deadline Apr 1
    expect(r.state).toBe("urgent");
  });

  it("is 'expired' past the deadline", () => {
    const r = computeWindow(att, "2026-01-01", new Date("2026-05-01T00:00:00"));
    expect(r.state).toBe("expired");
    expect(r.remainingDays).toBeLessThan(0);
  });

  it("elapsed percent is clamped to 0–100", () => {
    const r = computeWindow(att, "2026-01-01", new Date("2026-12-01T00:00:00"));
    expect(r.elapsedPct).toBe(100);
  });
});

describe("remainingLabel", () => {
  it("counts days when close", () => {
    expect(remainingLabel(18)).toBe("18 days left");
  });
  it("summarizes months when far", () => {
    expect(remainingLabel(120)).toBe("~4 months left");
  });
  it("reads Expired when negative", () => {
    expect(remainingLabel(-3)).toBe("Expired");
  });
});
