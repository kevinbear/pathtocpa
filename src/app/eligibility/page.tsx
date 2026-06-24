import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Eligibility — PathToCPA" };

export default function EligibilityPage() {
  return (
    <PagePlaceholder
      emoji="✅"
      title="Eligibility Check"
      milestone="Coming in M2–M3"
      description="See whether you meet California's education requirements — both to sit for the CPA Exam and to be licensed (the 150-unit rule) — with an exact list of what's still missing."
      willInclude={[
        "Per-category breakdown: accounting (24), business (24), accounting study (20), ethics (10), total (150)",
        "Two clear verdicts: Exam-eligible? and License-eligible?",
        "A 'what's missing' checklist of remaining units",
        "Powered by a tested California rules engine",
      ]}
    />
  );
}
