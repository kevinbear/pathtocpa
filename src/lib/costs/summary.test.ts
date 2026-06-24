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

describe("summarize — installments", () => {
  it("counts partial installment payments as paid", () => {
    const s = summarize([
      {
        id: "i1",
        label: "Review course",
        category: "review",
        amount: 2000,
        status: "planned",
        paymentMethod: "installment",
        installmentsTotal: 4,
        installmentsPaid: 1,
      },
    ]);
    expect(s.total).toBe(2000);
    expect(s.paid).toBe(500); // 1 of 4 installments
    expect(s.planned).toBe(1500);
    expect(s.paidPercent).toBe(25);
    expect(s.byCategory.review).toEqual({ total: 2000, paid: 500, planned: 1500 });
  });

  it("treats a fully-paid installment plan as 100%", () => {
    const s = summarize([
      {
        id: "i2",
        label: "Plan",
        category: "exam",
        amount: 1000,
        status: "planned",
        paymentMethod: "installment",
        installmentsTotal: 5,
        installmentsPaid: 5,
      },
    ]);
    expect(s.paid).toBe(1000);
    expect(s.paidPercent).toBe(100);
  });
});

describe("formatUSD", () => {
  it("formats with thousands separators and cents", () => {
    expect(formatUSD(2000)).toBe("$2,000.00");
    expect(formatUSD(65.5)).toBe("$65.50");
  });
});
