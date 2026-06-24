import type { Expense } from "./types";

/**
 * Typical California CPA-process costs as a starting point. These are rough
 * ESTIMATES (fees change and vary by provider/school) — users edit them to match
 * their own situation. Amounts are in US dollars.
 */
export const CA_COST_TEMPLATE: Omit<Expense, "id">[] = [
  { label: "CPA review course (Becker / UWorld / etc.)", category: "review", amount: 2000, status: "planned" },
  { label: "Exam fee — AUD", category: "exam", amount: 350, status: "planned" },
  { label: "Exam fee — FAR", category: "exam", amount: 350, status: "planned" },
  { label: "Exam fee — REG", category: "exam", amount: 350, status: "planned" },
  { label: "Exam fee — Discipline (BAR/ISC/TCP)", category: "exam", amount: 350, status: "planned" },
  { label: "CBA initial application fee", category: "application", amount: 100, status: "planned" },
  { label: "Official transcripts", category: "transcripts", amount: 30, status: "planned" },
  { label: "Live Scan fingerprinting", category: "fingerprinting", amount: 65, status: "planned" },
  { label: "PETH ethics exam", category: "ethics", amount: 150, status: "planned" },
  { label: "Initial license fee", category: "license", amount: 280, status: "planned" },
  { label: "Certified mail & postage", category: "misc", amount: 20, status: "planned" },
  { label: "Commute / travel to test center", category: "misc", amount: 60, status: "planned" },
];
