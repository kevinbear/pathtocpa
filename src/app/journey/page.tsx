import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Journey — PathToCPA" };

export default function JourneyPage() {
  return (
    <PagePlaceholder
      emoji="🧭"
      title="Your Journey"
      milestone="Coming in M4"
      description="Track where you are across the four stages of California CPA licensure — what's done, what you're working on, and what's next — with a percent-complete for each stage and overall."
      willInclude={[
        "Timeline of the 4 stages: Education → Exam → Experience → Ethics & License",
        "Status badges: Not started / In progress / Done",
        "A 'your next step' callout",
        "Percent complete per stage and overall (education % comes from the eligibility engine)",
      ]}
    />
  );
}
