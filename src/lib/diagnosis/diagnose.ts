export type DegreeLevel = "none" | "bachelors" | "masters";
export type MastersField = "accounting" | "taxation" | "laws_in_taxation" | "other";
export type MajorKind = "accounting" | "business" | "other";

export interface DiagnosisInput {
  degreeLevel: DegreeLevel;
  mastersField?: MastersField;
  major: MajorKind;
}

export interface PathOption {
  key: string;
  title: string;
  summary: string;
  requirements: string[];
  bestFor: string;
}

export interface Diagnosis {
  recommendedKey: string;
  headline: string;
  reasons: string[];
}

/** A qualifying master's (accounting/taxation/laws-in-taxation) waives Accounting Study. */
export function isQualifyingMasters(degreeLevel: DegreeLevel, field?: MastersField): boolean {
  return (
    degreeLevel === "masters" &&
    (field === "accounting" || field === "taxation" || field === "laws_in_taxation")
  );
}

/** The realistic routes to becoming CPA-eligible in California. */
export const PATHS: PathOption[] = [
  {
    key: "bachelors_first",
    title: "Earn a bachelor's degree first",
    summary:
      "California requires a bachelor's degree to sit for the exam and be licensed. An accounting degree is the most direct foundation.",
    requirements: [
      "Complete a bachelor's degree (any major qualifies; accounting is ideal)",
      "Then meet the 150-unit / 24 accounting / 24 business / 20 accounting-study / 10 ethics requirements",
    ],
    bestFor: "Anyone without a bachelor's degree yet.",
  },
  {
    key: "ready",
    title: "You're close — confirm & finish",
    summary:
      "Your education likely meets most of the CBA requirements. Verify the details and fill any small gaps.",
    requirements: [
      "Confirm 150 total semester units",
      "24 accounting + 24 business units (you probably have these)",
      "10 units ethics study (incl. ≥3 accounting ethics)",
      "20 units accounting study — waived if your master's is in accounting/taxation/laws in taxation",
    ],
    bestFor: "Accounting majors, or holders of a master's in accounting/taxation.",
  },
  {
    key: "topup",
    title: "Top up your units",
    summary:
      "Add the specific courses you're missing through a community college or university extension — often the cheapest, most flexible route.",
    requirements: [
      "Reach 150 total semester units",
      "Fill any gap in the 24 accounting / 24 business units",
      "10 units ethics study (incl. ≥3 accounting ethics)",
      "20 units accounting study",
    ],
    bestFor: "Bachelor's holders who are close but short on units or a category.",
  },
  {
    key: "postbacc",
    title: "Post-baccalaureate accounting certificate",
    summary:
      "A focused, lower-cost program that delivers the accounting and business coursework you're missing — without a full master's.",
    requirements: [
      "Complete accounting + business coursework to reach 24 + 24",
      "Reach 150 total units",
      "10 units ethics study + 20 units accounting study",
    ],
    bestFor: "Non-accounting bachelor's holders who don't want a full master's.",
  },
  {
    key: "ms",
    title: "Master's in Accounting or Taxation",
    summary:
      "A graduate degree adds units, deepens your knowledge, and — for accounting/taxation/laws-in-taxation — waives the 20-unit Accounting Study requirement.",
    requirements: [
      "Earn the MS (counts toward the 150 total)",
      "A master's in accounting/taxation/laws-in-taxation waives Accounting Study",
      "Still need 24 accounting + 24 business + 10 ethics overall",
    ],
    bestFor: "Non-accounting majors, or anyone wanting a structured, resume-boosting path.",
  },
];

export function diagnose(input: DiagnosisInput): Diagnosis {
  const { degreeLevel, mastersField, major } = input;

  if (degreeLevel === "none") {
    return {
      recommendedKey: "bachelors_first",
      headline: "Start with a bachelor's degree.",
      reasons: ["California requires a bachelor's degree to sit for the exam and be licensed."],
    };
  }

  if (isQualifyingMasters(degreeLevel, mastersField)) {
    return {
      recommendedKey: "ready",
      headline: "You're in great shape.",
      reasons: [
        "Your master's in accounting, taxation, or laws in taxation waives the 20-unit Accounting Study requirement.",
        "Most of your accounting and business units are likely covered — focus on confirming 150 total units and the 10 ethics units.",
      ],
    };
  }

  if (major === "accounting") {
    return {
      recommendedKey: "topup",
      headline: "You likely have the core — top up the rest.",
      reasons: [
        "As an accounting major you probably meet the 24 accounting + 24 business units.",
        "Focus on reaching 150 total units, the 20-unit accounting study, and 10 ethics units — a master's in accounting/tax would also waive accounting study.",
      ],
    };
  }

  if (major === "business") {
    return {
      recommendedKey: "topup",
      headline: "You're partway there.",
      reasons: [
        "A business major usually covers the 24 business units.",
        "You'll need accounting coursework to reach 24 accounting units, plus the ethics and accounting-study units, and 150 total.",
      ],
    };
  }

  // Non-accounting/business background.
  return {
    recommendedKey: degreeLevel === "masters" ? "topup" : "postbacc",
    headline: "You'll need accounting & business coursework.",
    reasons: [
      "With a non-accounting background, the 24 accounting + 24 business units are the main gap.",
      "A post-baccalaureate accounting certificate or a master's in accounting is usually the cleanest way to get them — and a qualifying master's also waives accounting study.",
    ],
  };
}
