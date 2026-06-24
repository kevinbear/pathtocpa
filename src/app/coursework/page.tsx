import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Coursework — PathToCPA" };

export default function CourseworkPage() {
  return (
    <PagePlaceholder
      emoji="📚"
      title="My Coursework"
      milestone="Coming in M3"
      description="Add your courses one by one and the app tallies your units by category automatically — so your eligibility updates live as you plan."
      willInclude={[
        "Add / edit / delete courses (name, units, unit type, category, school, term)",
        "Quarter-to-semester unit conversion (quarter units × 2/3)",
        "Mark courses as completed vs planned",
        "A live category tally that feeds the eligibility check",
      ]}
    />
  );
}
