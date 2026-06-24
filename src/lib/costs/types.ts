export type ExpenseStatus = "planned" | "paid";

export type PaymentMethod = "full" | "installment";

export type ExpenseCategory =
  | "review"
  | "exam"
  | "application"
  | "transcripts"
  | "fingerprinting"
  | "ethics"
  | "license"
  | "misc";

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  /** US dollars (the full cost). */
  amount: number;
  status: ExpenseStatus;
  /** How the bill is paid. Defaults to "full". */
  paymentMethod?: PaymentMethod;
  /** For installment plans: total number of installments. */
  installmentsTotal?: number;
  /** For installment plans: how many installments have been paid. */
  installmentsPaid?: number;
  /** Optional ISO date the expense is due / was paid. */
  dueDate?: string;
  notes?: string;
}

/** Dollars actually paid so far for an expense (handles installments). */
export function amountPaid(e: Expense): number {
  if (e.paymentMethod === "installment" && e.installmentsTotal && e.installmentsTotal > 0) {
    const frac = Math.min(1, Math.max(0, (e.installmentsPaid ?? 0) / e.installmentsTotal));
    return e.amount * frac;
  }
  return e.status === "paid" ? e.amount : 0;
}

/** Percent of an expense paid so far (0–100). */
export function percentPaid(e: Expense): number {
  if (e.amount <= 0) return 100;
  return Math.round((amountPaid(e) / e.amount) * 100);
}
