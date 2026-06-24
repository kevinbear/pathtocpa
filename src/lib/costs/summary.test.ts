import { describe, expect, it } from "vitest";
import { summarize, formatUSD } from "./summary";
import type { Expense } from "./types";

let n = 0;
function expense(
  amount: number,
  status: Expense["status"],
  category: Expense["category"] = "misc",
): Expense {
  n += 1;
  return { id: `e${n}`, label: `e${n}`, amount, status, category };
}

describe("summarize", () => {
  it("returns zeros for an empty list", () => {
    const s = summarize([]);
    expect(s.total).toBe(0);
    expect(s.paid).toBe(0);
    expect(s.planned).toBe(0);
    expect(s.paidPercent).toBe(0);
  });

  it("splits total into paid and planned", () => {
    const s = summarize([
      expense(2000, "planned", "review"),
      expense(350, "paid", "exam"),
      expense(150, "paid", "ethics"),
    ]);
    expect(s.total).toBe(2500);
    expect(s.paid).toBe(500);
    expect(s.planned).toBe(2000);
    expect(s.paidPercent).toBe(20);
  });

  it("aggregates per category", () => {
    const s = summarize([
      expense(350, "paid", "exam"),
      expense(350, "planned", "exam"),
    ]);
    expect(s.byCategory.exam).toEqual({ total: 700, paid: 350, planned: 350 });
  });
});

describe("formatUSD", () => {
  it("formats with thousands separators and cents", () => {
    expect(formatUSD(2000)).toBe("$2,000.00");
    expect(formatUSD(65.5)).toBe("$65.50");
  });
});
