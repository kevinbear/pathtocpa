import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Costs — PathToCPA" };

export default function CostsPage() {
  return (
    <PagePlaceholder
      emoji="💰"
      title="Cost Planner"
      milestone="Coming in M5"
      description="Budget the entire CPA process. Start from a typical California cost template, then adjust every line to match your own plan and see running totals."
      willInclude={[
        "Itemized expenses: review course, per-section exam fees, CBA application & re-exam, transcripts, Live Scan, PETH exam, license fee",
        "Misc costs too: certified mail, commute, and anything you add",
        "Planned vs paid, with running totals",
        "CSV export and seeded California cost templates",
      ]}
    />
  );
}
