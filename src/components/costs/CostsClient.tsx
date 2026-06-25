"use client";
import { LoadingSkeleton } from "@/components/Skeleton";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAppData } from "@/lib/data/AppDataProvider";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL } from "@/lib/costs/categories";
import { summarize, formatUSD } from "@/lib/costs/summary";
import { CA_COST_TEMPLATE } from "@/lib/costs/template";
import { exportExpensesCsv } from "@/lib/costs/export";
import ProgressBar from "@/components/ProgressBar";
import ConfirmModal from "@/components/ConfirmModal";
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

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

/** Validate a form and build an expense payload, or return an error message. */
function formToPayload(form: FormState): { payload?: Omit<Expense, "id">; error?: string } {
  const amount = Number(form.amount);
  if (!form.label.trim()) return { error: "Please enter a label." };
  if (!Number.isFinite(amount) || amount < 0) return { error: "Amount must be 0 or greater." };

  const isInstallment = form.paymentMethod === "installment";
  const total = Math.max(1, Math.floor(Number(form.installmentsTotal) || 1));
  const paidCount = Math.min(total, Math.max(0, Math.floor(Number(form.installmentsPaid) || 0)));

  return {
    payload: {
      label: form.label.trim(),
      category: form.category,
      amount,
      status: isInstallment ? (paidCount >= total ? "paid" : "planned") : form.status,
      notes: form.notes.trim() || undefined,
      paymentMethod: form.paymentMethod,
      installmentsTotal: isInstallment ? total : undefined,
      installmentsPaid: isInstallment ? paidCount : undefined,
    },
  };
}

function expenseToForm(e: Expense): FormState {
  return {
    label: e.label,
    category: e.category,
    amount: String(e.amount),
    status: e.status,
    notes: e.notes ?? "",
    paymentMethod: e.paymentMethod ?? "full",
    installmentsTotal: String(e.installmentsTotal ?? 4),
    installmentsPaid: String(e.installmentsPaid ?? 0),
  };
}

/** The expense fields, shared by the add form and the edit modal. */
function ExpenseFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
          onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
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
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
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
            onChange={(e) => setForm({ ...form, status: e.target.value as ExpenseStatus })}
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
  );
}

/** Edit an existing expense in a centered modal (portaled to escape the blurred nav). */
function EditExpenseModal({
  expense,
  onSave,
  onClose,
}: {
  expense: Expense;
  onSave: (id: string, patch: Omit<Expense, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => expenseToForm(expense));
  const [error, setError] = useState<string | null>(null);

  function save() {
    const { payload, error: err } = formToPayload(form);
    if (err) return setError(err);
    onSave(expense.id, payload as Omit<Expense, "id">);
    onClose();
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold text-slate-900">Edit expense</h2>
        <div className="mt-4">
          <ExpenseFields form={form} setForm={setForm} />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [confirmTemplate, setConfirmTemplate] = useState(false);

  const deleteExpenseTarget = expenses.find((e) => e.id === deleteExpenseId);

  const summary = useMemo(() => summarize(expenses), [expenses]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { payload, error: err } = formToPayload(form);
    if (err) return setError(err);
    addExpense(payload as Omit<Expense, "id">);
    setForm(EMPTY_FORM);
    setError(null);
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
    <main className="mx-auto max-w-[104rem] px-6 py-12">
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
        <LoadingSkeleton />
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
              onClick={() =>
                expenses.length > 0 ? setConfirmTemplate(true) : addExpenses(CA_COST_TEMPLATE)
              }
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
              Add an expense
            </h2>
            <div className="mt-4">
              <ExpenseFields form={form} setForm={setForm} />
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-4">
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700"
              >
                Add expense
              </button>
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
                          onClick={() => setEditingExpense(e)}
                          aria-label={`Edit ${e.label}`}
                          title="Edit"
                          className="rounded-full p-1.5 text-brand-700 hover:bg-brand-50"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M13.5 3.5l3 3L7 16H4v-3z" />
                            <path d="M12 5l3 3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteExpenseId(e.id)}
                          aria-label={`Delete ${e.label}`}
                          title="Delete"
                          className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M4 6h12M8 6V4h4v2M6 6l.8 9.5h6.4L14 6" />
                          </svg>
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
                              className="rounded-full bg-brand-600 px-2 py-0.5 font-medium text-oncolor hover:bg-brand-700"
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

      {editingExpense && (
        <EditExpenseModal
          key={editingExpense.id}
          expense={editingExpense}
          onSave={updateExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteExpenseId}
        title="Delete expense?"
        message={
          deleteExpenseTarget
            ? `Remove "${deleteExpenseTarget.label}" from your budget? This can't be undone.`
            : "Remove this expense?"
        }
        onConfirm={() => {
          if (deleteExpenseId) deleteExpense(deleteExpenseId);
          setDeleteExpenseId(null);
        }}
        onCancel={() => setDeleteExpenseId(null)}
      />

      <ConfirmModal
        open={confirmTemplate}
        tone="brand"
        confirmLabel="Add template anyway"
        title="Add the California template?"
        message="You already have expenses. This adds the 12 template items to the bottom of your list — it won't replace or merge with what's there, so you may end up with duplicates. Continue?"
        onConfirm={() => {
          addExpenses(CA_COST_TEMPLATE);
          setConfirmTemplate(false);
        }}
        onCancel={() => setConfirmTemplate(false)}
      />
    </main>
  );
}
