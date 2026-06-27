import type { StageKey } from "./computeJourney";

/** A resource link shown on a step's detail page (internal route or external CBA/NASBA URL). */
export interface StepResource {
  label: string;
  href: string;
  /** External links open in a new tab. */
  external?: boolean;
}

/** Static "what to do" reference content for a single journey step. */
export interface StepDetail {
  key: StageKey;
  emoji: string;
  title: string;
  /** Where this step falls (e.g. "Step 2 of 6"). */
  stepLabel: string;
  /** One- or two-sentence plain-English explanation of the step. */
  what: string;
  /** Ordered checklist of concrete things to do. */
  checklist: string[];
  /** Optional tips / gotchas. */
  tips?: string[];
  /** Helpful links (in-app guides + official sources). */
  resources: StepResource[];
}

const CBA_EXAM = "https://www.dca.ca.gov/cba/applicants/index.shtml";
const CBA_LICENSE = "https://www.dca.ca.gov/cba/applicants/license-application.shtml";

/** Per-step detail, keyed by StageKey. Mirrors the 6-step model in computeJourney. */
export const STEP_DETAILS: Record<StageKey, StepDetail> = {
  qualify: {
    key: "qualify",
    emoji: "🎓",
    title: "Qualify to sit",
    stepLabel: "Step 1 of 6",
    what: "Before you can apply, your education has to meet California's minimum to sit for the exam: a bachelor's degree plus 24 semester units of accounting and 24 of business-related subjects. This step is the part you can self-check here.",
    checklist: [
      "Earn (or be close to finishing) a bachelor's degree",
      "Complete 24 semester units of accounting subjects",
      "Complete 24 semester units of business-related subjects",
      "Enter your courses in Coursework so the app can tally them",
      "Check the Eligibility page until the 'can you sit' verdict is green",
    ],
    tips: [
      "You only need 24/24 + a degree to SIT — the full 150 units and study units come later, for the license.",
      "Studied abroad? Foreign transcripts must be evaluated by a CBA-approved service first (see the transcripts guide).",
    ],
    resources: [
      { label: "Add your coursework", href: "/coursework" },
      { label: "Check eligibility", href: "/eligibility" },
      { label: "Full requirement breakdown", href: "/eligibility/breakdown" },
    ],
  },
  applySit: {
    key: "applySit",
    emoji: "📄",
    title: "Apply to sit — the CBA verifies your education",
    stepLabel: "Step 2 of 6",
    what: "The app estimates your eligibility, but the California Board of Accountancy (CBA) is the one that actually decides. You send your official transcripts and the exam application (with a fee) to the CBA, and they review your education before authorizing you to sit. Nothing is official until they approve it.",
    checklist: [
      "Create your CBA client account",
      "Request OFFICIAL transcripts — each college must send them directly to the CBA, not to you",
      "Submit the CPA Exam application and pay the application fee",
      "Wait for the CBA to review and approve your education",
      "Receive your Authorization To Test (ATT), then NASBA's Notice To Schedule (NTS)",
    ],
    tips: [
      "Transcripts emailed/handed to you usually don't count — they must come straight from the registrar.",
      "Once you get the payment coupon, you have 90 days to pay; the NTS is valid 9 months. Track both on the Journey page.",
      "Foreign coursework needs a CBA-approved foreign credentials evaluation sent to the CBA.",
    ],
    resources: [
      { label: "Guide: request your transcripts", href: "/guides" },
      { label: "Guide: create your CBA account & apply", href: "/guides" },
      { label: "CBA — exam applicants (official)", href: CBA_EXAM, external: true },
      { label: "Plan the fees in Costs", href: "/costs" },
    ],
  },
  exam: {
    key: "exam",
    emoji: "📝",
    title: "Pass the CPA Exam",
    stepLabel: "Step 3 of 6 · runs alongside experience",
    what: "Pass all four sections: three Core (AUD, FAR, REG) plus one Discipline of your choice (BAR, ISC, or TCP). You can work on experience at the same time.",
    checklist: [
      "Pay NASBA within 90 days of receiving the payment coupon",
      "Schedule each section with Prometric using your NTS",
      "Pass AUD, FAR, REG, and your chosen Discipline (75+ each)",
      "Pass all four within the rolling 30-month conditional-credit window",
    ],
    tips: [
      "Set your section order on the Journey page so the app tracks what's next.",
      "Watch the three countdowns (90-day pay, 9-month NTS, 30-month credit) on the Journey page.",
    ],
    resources: [
      { label: "Guide: select sections & set up NASBA", href: "/guides" },
      { label: "Guide: NTS & scheduling with Prometric", href: "/guides" },
    ],
  },
  experience: {
    key: "experience",
    emoji: "💼",
    title: "Gain qualifying experience",
    stepLabel: "Step 4 of 6 · runs alongside the exam",
    what: "California requires 12 months (about 2,000 hours) of general accounting experience, supervised and verified by an active licensed CPA. It can run in parallel with the exam.",
    checklist: [
      "Find a qualifying accounting role (public, private, government, or academia)",
      "Make sure an active licensed CPA can supervise and verify your work",
      "Accumulate 12 months / ~2,000 hours of general accounting experience",
      "Have your CPA complete the Certificate of General Experience form for the CBA",
    ],
    tips: [
      "Attest/audit experience is only required if you want signing authority — general accounting is enough for the license itself.",
      "Log your months on the Journey page to watch this step fill in.",
    ],
    resources: [{ label: "Guide: log your qualifying experience", href: "/guides" }],
  },
  licenseEd: {
    key: "licenseEd",
    emoji: "📚",
    title: "Finish your licensure education",
    stepLabel: "Step 5 of 6",
    what: "To be licensed (not just to sit), you need 150 total semester units, including 20 units of accounting study and 10 units of ethics study — on top of the 24/24 from Step 1.",
    checklist: [
      "Reach 150 total semester units",
      "Complete 20 semester units of accounting study",
      "Complete 10 semester units of ethics study",
      "Use Allocate to map each course to the requirement it best satisfies",
      "Confirm the 'are you licensed' verdict is green on Eligibility",
    ],
    tips: [
      "Accounting units beyond the first 24 can count toward business-related and accounting study — Allocate helps you place them.",
      "A qualifying master's can waive the accounting-study requirement.",
    ],
    resources: [
      { label: "Add / edit coursework", href: "/coursework" },
      { label: "Requirement breakdown", href: "/eligibility/breakdown" },
      { label: "Fine-tune with Allocate", href: "/allocate" },
    ],
  },
  license: {
    key: "license",
    emoji: "✅",
    title: "Apply for your license — the CBA verifies everything",
    stepLabel: "Step 6 of 6",
    what: "The final CBA submission. You send your license application (with a fee), final official transcripts showing the full 150 units, your signed experience certificate, and complete Live Scan fingerprinting. The CBA verifies it all and issues your license.",
    checklist: [
      "Complete Live Scan fingerprinting",
      "Have final OFFICIAL transcripts (showing 150 units) sent to the CBA",
      "Submit your signed Certificate of General Experience",
      "Submit the license application and pay the licensing fee",
      "Complete the CBA-approved regulatory review course before your first renewal (this replaced the old PETH exam)",
    ],
    tips: [
      "California removed the PETH ethics exam on July 1, 2024 — you no longer take it.",
      "Budget the Live Scan, application, and transcript fees in the Costs planner.",
    ],
    resources: [
      { label: "Guide: Live Scan fingerprinting", href: "/guides" },
      { label: "Guide: apply for your license", href: "/guides" },
      { label: "CBA — license application (official)", href: CBA_LICENSE, external: true },
      { label: "Plan the fees in Costs", href: "/costs" },
    ],
  },
};

export const STEP_ORDER: StageKey[] = [
  "qualify",
  "applySit",
  "exam",
  "experience",
  "licenseEd",
  "license",
];
