import type { Expense } from "./types";
import { EXPENSE_CATEGORY_LABEL } from "./categories";

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Export expenses to a downloadable CSV file. */
export function exportExpensesCsv(expenses: Expense[]) {
  const headers = ["label", "category", "amount", "status", "dueDate", "notes"];
  const rows = expenses.map((e) => [
    e.label,
    EXPENSE_CATEGORY_LABEL[e.category],
    e.amount.toFixed(2),
    e.status,
    e.dueDate ?? "",
    e.notes ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => escapeCsv(String(c))).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pathtocpa-costs.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
