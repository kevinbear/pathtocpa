export type GuideStage = "education" | "exam" | "experience" | "ethics";

export interface Guide {
  id: string;
  stage: GuideStage;
  emoji: string;
  title: string;
  summary: string;
  steps: string[];
  links: { label: string; url: string }[];
  tips?: string[];
}

export const STAGE_LABELS: Record<GuideStage, string> = {
  education: "🎓 Education",
  exam: "📝 Exam",
  experience: "💼 Experience",
  ethics: "✅ Ethics & License",
};

/**
 * Step-by-step guides for the California CPA process. Links point to official
 * sites; if one moves, navigate from cba.ca.gov. Always confirm details with the
 * California Board of Accountancy — this is a planning aid, not official advice.
 */
export const GUIDES: Guide[] = [
  {
    id: "transcripts",
    stage: "education",
    emoji: "📄",
    title: "Request your official transcripts",
    summary:
      "The CBA needs OFFICIAL transcripts sent directly from each school you attended — transcripts that pass through your own hands usually aren't accepted.",
    steps: [
      "Log in to each school's registrar / records portal (often the National Student Clearinghouse or your campus system).",
      "Order an official transcript for every institution where you earned units that count.",
      "Send each one directly to the California Board of Accountancy (electronic delivery or mail, per the CBA's instructions).",
      "Keep your order confirmations until the CBA confirms receipt.",
    ],
    links: [
      { label: "CBA — Educational Requirements", url: "https://www.cba.ca.gov/applicants/educational-requirements.shtml" },
      { label: "CBA — Applicants", url: "https://www.cba.ca.gov/applicants/" },
    ],
    tips: [
      "Order early — transcripts can take 1–2 weeks to arrive.",
      "Foreign coursework must be evaluated by a CBA-approved credential evaluation service first.",
    ],
  },
  {
    id: "cba-account",
    stage: "exam",
    emoji: "🧾",
    title: "Create your CBA account & apply for the exam",
    summary:
      "First-time California candidates apply for the Uniform CPA Exam directly through the CBA's online system.",
    steps: [
      "Go to the CBA Applicants section and create your online account.",
      "Complete the first-time Uniform CPA Exam application.",
      "Pay the application fee.",
      "Make sure your transcripts are sent to the CBA (see the transcripts guide).",
      "Wait for the CBA to review your education and approve you to sit.",
    ],
    links: [
      { label: "CBA — Apply for the CPA Exam", url: "https://www.cba.ca.gov/applicants/exam.shtml" },
      { label: "CBA — Home", url: "https://www.cba.ca.gov/" },
    ],
    tips: ["Enter your legal name exactly as it appears on the ID you'll bring to the test center."],
  },
  {
    id: "schedule-exam",
    stage: "exam",
    emoji: "🗓️",
    title: "Get your NTS and schedule with Prometric",
    summary:
      "Once the CBA approves you and you've paid section fees, you'll get a Notice to Schedule (NTS), then book each section with Prometric.",
    steps: [
      "After CBA approval, pay the exam section fees (billed through NASBA).",
      "Receive your Notice to Schedule (NTS) by email.",
      "Go to Prometric and schedule your section before the NTS expires.",
      "Pick a test center (or online option, where available) and a date.",
    ],
    links: [
      { label: "Prometric — Schedule the CPA Exam", url: "https://www.prometric.com/test-takers/search/cpa" },
      { label: "NASBA", url: "https://nasba.org/" },
    ],
    tips: [
      "Schedule early for your preferred date and location.",
      "Watch your NTS expiration date — fees are forfeited if it lapses unused.",
    ],
  },
  {
    id: "experience",
    stage: "experience",
    emoji: "💼",
    title: "Log your qualifying experience",
    summary:
      "California requires 12 months of general accounting experience, verified by a licensed CPA. Attest work needs additional hours.",
    steps: [
      "Work in a role providing accounting, attest, compilation, management advisory, tax, or consulting skills.",
      "Track your start/end dates and duties.",
      "Have a licensed CPA who supervised you ready to sign your experience verification.",
      "If you'll sign attest reports, complete the additional attest experience (e.g. 500 hours).",
    ],
    links: [{ label: "CBA — Applicants", url: "https://www.cba.ca.gov/applicants/" }],
    tips: ["Confirm your supervisor's CPA license is active and in good standing."],
  },
  {
    id: "live-scan",
    stage: "ethics",
    emoji: "🖐️",
    title: "Complete Live Scan fingerprinting",
    summary:
      "California requires fingerprinting (Live Scan) for a background check before licensure.",
    steps: [
      "Download the CBA's Request for Live Scan Service form.",
      "Take it to a Live Scan provider (many UPS Stores, police departments, and vendors offer it).",
      "Bring a government-issued photo ID and pay the rolling + DOJ/FBI fees.",
      "Results are sent electronically to the CBA.",
    ],
    links: [{ label: "CBA — Applicants", url: "https://www.cba.ca.gov/applicants/" }],
    tips: ["Do this well before you submit your license application so results are on file."],
  },
  {
    id: "peth",
    stage: "ethics",
    emoji: "📘",
    title: "Pass the PETH ethics exam",
    summary:
      "California requires the Professional Ethics for CPAs (PETH) exam, administered by CalCPA, before licensure. It's open-book and requires 90% to pass.",
    steps: [
      "Purchase the PETH exam from CalCPA.",
      "Work through the self-study materials.",
      "Take the open-book exam online; you need 90% or higher.",
      "Your passing score is reported toward your license.",
    ],
    links: [{ label: "CalCPA — Ethics (PETH) Exam", url: "https://www.calcpa.org/" }],
    tips: [
      "It's open-book but thorough — set aside real study time.",
      "The pass is valid for a limited window before licensure, so time it near the end.",
    ],
  },
  {
    id: "apply-license",
    stage: "ethics",
    emoji: "🏅",
    title: "Apply for your CPA license",
    summary:
      "After passing all exam sections, the PETH, clearing Live Scan, and completing experience, submit your licensure application to the CBA.",
    steps: [
      "Confirm all four CPA Exam sections are passed.",
      "Confirm 12 months of qualifying experience is verified by a licensed CPA.",
      "Confirm PETH passed and Live Scan results are on file.",
      "Submit the licensure application and fees through your CBA account.",
    ],
    links: [{ label: "CBA — Applicants", url: "https://www.cba.ca.gov/applicants/" }],
    tips: ["Double-check every requirement is marked complete before submitting to avoid delays."],
  },
];

export const CBA_CONTACT = {
  phone: "(916) 561-1701",
  email: "licensinginfo@cba.ca.gov",
  website: "https://www.cba.ca.gov/",
};
