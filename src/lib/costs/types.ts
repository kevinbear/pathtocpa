export type ExpenseStatus = "planned" | "paid";

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
  /** US dollars. */
  amount: number;
  status: ExpenseStatus;
  /** Optional ISO date the expense is due / was paid. */
  dueDate?: string;
  notes?: string;
}
