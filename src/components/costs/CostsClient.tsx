"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/data/AppDataProvider";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL } from "@/lib/costs/categories";
import { summarize, formatUSD } from "@/lib/costs/summary";
import { CA_COST_TEMPLATE } from "@/lib/costs/template";
import { exportExpensesCsv } from "@/lib/costs/export";
import ProgressBar from "@/components/ProgressBar";
import {
  amountPaid,
  percentPaid,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
  type PaymentMethod,
} from "@/lib/costs/types";

type FormState = {
  label: string;
  category: ExpenseCategory;
  amount: string;
  status: ExpenseStatus;
  notes: string;
  paymentMethod: PaymentMethod;
  installmentsTotal: string;
  installmentsPaid: string;
};

const EMPTY_FORM: FormState = {
  label: "",
  category: "exam",
  amount: "",
  status: "planned",
  notes: "",
  paymentMethod: "full",
  installmentsTotal: "4",
  installmentsPaid: "0",
};

export default function CostsClient() {
  const {
    hydrated,
    expenses,
    addExpense,
    addExpenses,
    updateExpense,
    deleteExpense,
  } = useAppData();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => summarize(expenses), [expenses]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.label.trim()) return setError("Please enter a label.");
    if (!Number.isFinite(amount) || amount < 0)
      return setError("Amount must be 0 or greater.");

    const isInstallment = form.paymentMethod === "installment";
    const total = Math.max(1, Math.floor(Number(form.installmentsTotal) || 1));
    const paidCount = Math.min(total, Math.max(0, Math.floor(Number(form.installmentsPaid) || 0)));

    const payload: Omit<Expense, "id"> = {
      label: form.label.trim(),
      category: form.category,
      amount,
      status: isInstallment ? (paidCount >= total ? "paid" : "planned") : form.status,
      notes: form.notes.trim() || undefined,
      paymentMethod: form.paymentMethod,
      installmentsTotal: isInstallment ? total : undefined,
      installmentsPaid: isInstallment ? paidCount : undefined,
    };
    if (editingId) updateExpense(editingId, payload);
    else addExpense(payload);
    resetForm();
  }

  function startEdit(e: Expense) {
    setEditingId(e.id);
    setError(null);
    setForm({
      label: e.label,
      category: e.category,
      amount: String(e.amount),
      status: e.status,
      notes: e.notes ?? "",
      paymentMethod: e.paymentMethod ?? "full",
      installmentsTotal: String(e.installmentsTotal ?? 4),
      installmentsPaid: String(e.installmentsPaid ?? 0),
    });
  }

  function toggleStatus(e: Expense) {
    updateExpense(e.id, { status: e.status === "paid" ? "planned" : "paid" });
  }

  /** Bump installments paid up/down for a quick interaction on the row. */
  function adjustInstallment(e: Expense, delta: number) {
    const total = e.installmentsTotal ?? 1;
    const next = Math.min(total, Math.max(0, (e.installmentsPaid ?? 0) + delta));
    updateExpense(e.id, {
      installmentsPaid: next,
      status: next >= total ? "paid" : "planned",
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Costs</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Cost Planner
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Budget the whole CPA process. Start from the California template, then
          edit every line to match your plan. Mark items paid as you go.
        </p>
      </div>

      {!hydrated ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          {/* Summary */}
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total estimated
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatUSD(summary.total)}
              </p>
            </div>
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Paid
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-600">
                {formatUSD(summary.paid)}
              </p>
            </div>
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Remaining
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {formatUSD(summary.planned)}
              </p>
            </div>
          </section>

          {expenses.length > 0 && (
            <div className="card mb-6">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-700">Paid so far</span>
                <span className="text-slate-500">{summary.paidPercent}%</span>
              </div>
              <ProgressBar percent={summary.paidPercent} satisfied={summary.paidPercent === 100} />
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => addExpenses(CA_COST_TEMPLATE)}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            >
              + Add California template
            </button>
            <button
              onClick={() => exportExpensesCsv(expenses)}
              disabled={expenses.length === 0}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>

          {/* Add / edit form + breakdown */}
          <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {editingId ? "Edit expense" : "Add an expense"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Label</span>
                <input
                  className={inputClass}
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Exam fee — FAR"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Category</span>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ExpenseCategory })
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Amount (USD)</span>
                <input
                  className={inputClass}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  inputMode="decimal"
                  placeholder="350"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Payment method</span>
                <select
                  className={inputClass}
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })
                  }
                >
                  <option value="full">Pay in full</option>
                  <option value="installment">Installments</option>
                </select>
              </label>

              {form.paymentMethod === "full" ? (
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Status</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as ExpenseStatus })
                    }
                  >
                    <option value="planned">Planned</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Paid</span>
                    <input
                      className={inputClass}
                      value={form.installmentsPaid}
                      onChange={(e) => setForm({ ...form, installmentsPaid: e.target.value })}
                      inputMode="numeric"
                      placeholder="0"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">of total</span>
                    <input
                      className={inputClass}
                      value={form.installmentsTotal}
                      onChange={(e) => setForm({ ...form, installmentsTotal: e.target.value })}
                      inputMode="numeric"
                      placeholder="4"
                    />
                  </label>
                </div>
              )}

              <label className="sm:col-span-2 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Notes <span className="text-slate-400">(optional)</span>
                </span>
                <input
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {editingId ? "Save changes" : "Add expense"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Spending by category
              </h2>
              {expenses.length === 0 ? (
                <p className="mt-3 text-xs text-slate-400">
                  Add expenses to see a breakdown.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {EXPENSE_CATEGORIES.filter(
                    (c) => (summary.byCategory[c.key]?.total ?? 0) > 0,
                  ).map((c) => {
                    const b = summary.byCategory[c.key];
                    const paidPct = b.total === 0 ? 0 : Math.round((b.paid / b.total) * 100);
                    return (
                      <div key={c.key}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-600">{c.label}</span>
                          <span className="text-slate-500">{formatUSD(b.total)}</span>
                        </div>
                        <ProgressBar percent={paidPct} satisfied={paidPct === 100} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
          </div>

          {/* List */}
          {expenses.length === 0 ? (
            <div className="card text-center text-sm text-slate-500">
              No expenses yet. Add the California template above for a quick start,
              or add your own.
            </div>
          ) : (
            <ul className="space-y-2">
              {expenses.map((e) => {
                const isInstallment = e.paymentMethod === "installment" && !!e.installmentsTotal;
                return (
                  <li
                    key={e.id}
                    className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{e.label}</p>
                        <p className="text-xs text-slate-500">
                          {EXPENSE_CATEGORY_LABEL[e.category]}
                          {e.notes ? ` · ${e.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {formatUSD(e.amount)}
                        </span>
                        {isInstallment ? (
                          <span className="pill bg-slate-100 text-slate-600">Installments</span>
                        ) : (
                          <button
                            onClick={() => toggleStatus(e)}
                            className={`pill ${
                              e.status === "paid"
                                ? "bg-brand-100 text-brand-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {e.status === "paid" ? "✓ Paid" : "Planned"}
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(e)}
                          className="rounded-full px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isInstallment && (
                      <div className="mt-3">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500">
                            {e.installmentsPaid ?? 0} / {e.installmentsTotal} installments ·{" "}
                            <span className="font-semibold text-brand-700">{percentPaid(e)}% paid</span>{" "}
                            · {formatUSD(amountPaid(e))} of {formatUSD(e.amount)}
                          </span>
                          <span className="flex gap-1">
                            <button
                              onClick={() => adjustInstallment(e, -1)}
                              className="rounded-full px-2 py-0.5 font-medium text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
                              aria-label="One fewer installment paid"
                            >
                              −
                            </button>
                            <button
                              onClick={() => adjustInstallment(e, 1)}
                              className="rounded-full bg-brand-600 px-2 py-0.5 font-medium text-white hover:bg-brand-700"
                            >
                              + mark paid
                            </button>
                          </span>
                        </div>
                        <ProgressBar percent={percentPaid(e)} satisfied={percentPaid(e) === 100} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-8 text-xs text-slate-400">
            Amounts are rough estimates you should adjust — fees change and vary by
            provider, school, and county. This is a planning aid, not official
            advice.
          </p>
        </>
      )}
    </main>
  );
}
