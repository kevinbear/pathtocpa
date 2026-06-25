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
    id: "track-coursework",
    stage: "education",
    emoji: "📊",
    title: "Track & match your coursework",
    summary:
      "Start here: add your courses on the Coursework page and we'll tally your units against every California requirement — so you know your gaps before you do anything else.",
    steps: [
      "Open the Coursework page and add each course — or import them all from an Excel/CSV file.",
      "We total your units by category — accounting, business-related, accounting study, and ethics study.",
      "Check the Eligibility page to see what's met and what's still missing, both to SIT and to LICENSE.",
      "Use the Allocate board to fine-tune which course counts toward which requirement.",
    ],
    links: [
      { label: "Open the Coursework page", url: "/coursework" },
      { label: "Check your eligibility", url: "/eligibility" },
    ],
    tips: [
      "Knowing your gaps now tells you exactly which transcripts and extra units you'll need next.",
      "Fastest fill: upload your transcript to an AI chatbot and have it complete our import template.",
    ],
  },
  {
    id: "transcripts",
    stage: "education",
    emoji: "📄",
    title: "Request your official transcripts",
    summary:
      "The CBA needs OFFICIAL transcripts from EVERY school where you earned units — community college AND university, not just the one that granted your degree — sent directly from the school.",
    steps: [
      "List every institution where you earned units that count — community colleges, transfer schools, your degree-granting university, and any study-abroad/foreign school.",
      "For each U.S. school, have its registrar send an official transcript DIRECTLY to the CBA — electronically to CBAtranscripts@cba.ca.gov through an approved vendor, or by sealed-envelope mail if your school uses a different provider. One you carry yourself is treated as unofficial.",
      "Approved electronic vendors: Parchment, National Student Clearinghouse, eScrip-Safe, Credential Solutions, Certree, and The University of Texas at Austin. Your school chooses which one it uses.",
      "Studied abroad? Foreign transcripts can't go straight to the CBA — first have them evaluated by a CBA-approved foreign credentials evaluation service, which then sends the evaluation to the CBA.",
      "Keep every order and evaluation confirmation until the CBA confirms it has received them all.",
    ],
    links: [
      {
        label: "CBA — Approved foreign credential evaluators",
        url: "https://www.dca.ca.gov/cba/applicants/foreign.shtml",
      },
      {
        label: "CBA — Send transcripts electronically",
        url: "https://www.dca.ca.gov/cba/send_transcripts_electronically.shtml",
      },
      {
        label: "CBA — Educational requirements",
        url: "https://www.dca.ca.gov/cba/applicants/ed-requirements.shtml",
      },
    ],
    tips: [
      "Order early — U.S. transcripts take 1–2 weeks; a foreign credential evaluation can take several weeks.",
      "Don't skip the small schools: a 3-unit community-college course can be exactly what tips you over a requirement.",
      "Foreign coursework MUST be evaluated by a CBA-approved service first — pick one from the approved list above.",
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
      { label: "Create your CBA account / apply", url: "https://www.cba.ca.gov/cbt_public" },
      { label: "CBA — Apply for the CPA Exam", url: "https://www.dca.ca.gov/cba/applicants/" },
      { label: "CBA — Home", url: "https://www.dca.ca.gov/cba/" },
    ],
    tips: ["Enter your legal name exactly as it appears on the ID you'll bring to the test center."],
  },
  {
    id: "select-sections-nasba",
    stage: "exam",
    emoji: "🎯",
    title: "Select your sections & set up NASBA",
    summary:
      "After the CBA approves your education, you choose which exam sections to take in your CBA account; that's sent to NASBA, which bills you and then issues your NTS.",
    steps: [
      "Once the CBA approves you, log in to your CBA account and create an Application Remittance Form.",
      "Select the exam section(s) you want to take now. The CBA sends your Authorization to Test (ATT) — with those sections — to NASBA.",
      "NASBA emails you a 'CPA Examination Payment Coupon Notification' with your Jurisdiction Candidate ID and a link to the NASBA CPA Portal (dashboard.nasba.org).",
      "No NASBA CPA Portal account yet? Use the CPA Portal Sign-Up link in that email — sign up with the SAME email as your exam application and your Jurisdiction Candidate ID (omit leading zeroes unless you're a Texas or Maryland applicant).",
      "Pay your section fees in the portal within 90 days. After payment, NASBA issues your Notice to Schedule (NTS).",
    ],
    links: [
      { label: "NASBA CPA Portal (dashboard)", url: "https://dashboard.nasba.org/" },
      { label: "Log in to NASBA", url: "https://okta.nasba.org/" },
      { label: "Email NASBA — CPAExam@nasba.org", url: "mailto:CPAExam@nasba.org" },
    ],
    tips: [
      "Only pick sections you'll sit within the next few months — each one starts its own NTS clock once you pay.",
      "No NASBA email? Check spam, confirm the email on your CBA application matches, then call NASBA at 1-866-MY-NASBA.",
    ],
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
    links: [{ label: "CBA — Applicants", url: "https://www.dca.ca.gov/cba/applicants/" }],
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
    links: [{ label: "CBA — Applicants", url: "https://www.dca.ca.gov/cba/applicants/" }],
    tips: ["Do this well before you submit your license application so results are on file."],
  },
  {
    id: "peth",
    stage: "ethics",
    emoji: "📘",
    title: "Ethics exam (PETH) — no longer required",
    summary:
      "California removed the Professional Ethics for CPAs (PETH) exam on July 1, 2024. You no longer take it for licensure. (The 10 units of ethics study still count toward your 150 units.)",
    steps: [
      "No action needed — the PETH exam is no longer part of California licensure.",
      "Make sure your 10 ethics-study units are covered in your coursework instead.",
    ],
    links: [
      {
        label: "CBA — Initial Licensing FAQs",
        url: "https://www.dca.ca.gov/cba/applicants/initial-license-faqs.shtml",
      },
    ],
    tips: ["If a study provider or older guide still lists PETH, it's out of date as of July 2024."],
  },
  {
    id: "apply-license",
    stage: "ethics",
    emoji: "🏅",
    title: "Apply for your CPA license",
    summary:
      "After passing all exam sections, clearing Live Scan, and completing experience, submit your licensure application to the CBA. (The PETH exam is no longer required.)",
    steps: [
      "Confirm all four CPA Exam sections are passed.",
      "Confirm 12 months of qualifying experience is verified by a licensed CPA.",
      "Confirm your Live Scan results are on file.",
      "Submit the licensure application and fees through your CBA account.",
    ],
    links: [{ label: "CBA — Applicants", url: "https://www.dca.ca.gov/cba/applicants/" }],
    tips: ["Double-check every requirement is marked complete before submitting to avoid delays."],
  },
];

export const CBA_CONTACT = {
  phone: "(916) 561-1701",
  email: "licensinginfo@cba.ca.gov",
  website: "https://www.dca.ca.gov/cba/",
};
