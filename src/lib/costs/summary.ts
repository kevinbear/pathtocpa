import { amountPaid, type Expense, type ExpenseCategory } from "./types";

export interface CategorySummary {
  total: number;
  paid: number;
  planned: number;
}

export interface CostSummary {
  total: number;
  paid: number;
  planned: number;
  /** 0–100, share of the total that's already paid. */
  paidPercent: number;
  byCategory: Record<ExpenseCategory, CategorySummary>;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Aggregate a list of expenses into totals and per-category breakdowns. Pure. */
export function summarize(expenses: Expense[]): CostSummary {
  const byCategory = {} as Record<ExpenseCategory, CategorySummary>;
  let total = 0;
  let paid = 0;

  for (const e of expenses) {
    const amount = Number.isFinite(e.amount) ? e.amount : 0;
    const paidSoFar = amountPaid(e);
    total += amount;
    paid += paidSoFar;

    const bucket = byCategory[e.category] ?? { total: 0, paid: 0, planned: 0 };
    bucket.total += amount;
    bucket.paid += paidSoFar;
    bucket.planned += amount - paidSoFar;
    byCategory[e.category] = bucket;
  }

  for (const key of Object.keys(byCategory) as ExpenseCategory[]) {
    byCategory[key] = {
      total: round2(byCategory[key].total),
      paid: round2(byCategory[key].paid),
      planned: round2(byCategory[key].planned),
    };
  }

  total = round2(total);
  paid = round2(paid);
  const planned = round2(total - paid);

  return {
    total,
    paid,
    planned,
    paidPercent: total === 0 ? 0 : Math.round((paid / total) * 100),
    byCategory,
  };
}

/** Format a dollar amount for display, e.g. 2000 → "$2,000.00". */
export function formatUSD(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
