import Link from "next/link";

export const metadata = { title: "About — PathToCPA" };

const requirements = [
  { label: "Total semester units", value: "150", note: "required for licensure" },
  { label: "Accounting subjects", value: "24", note: "units" },
  { label: "Business-related subjects", value: "24", note: "units" },
  { label: "Accounting study", value: "20", note: "units (licensure)" },
  { label: "Ethics study", value: "10", note: "units (licensure)" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <span className="pill bg-brand-100 text-brand-800">About</span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        About PathToCPA
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        PathToCPA is a free, open-source planner for California accounting
        students. It helps you check your eligibility, track your licensure
        journey, and budget the whole process — with no account required to get
        started.
      </p>

      <h2 className="mt-12 text-xl font-semibold text-slate-900">
        California education requirements (summary)
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requirements.map((r) => (
          <div key={r.label} className="card">
            <p className="text-3xl font-bold text-brand-600">{r.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{r.label}</p>
            <p className="text-xs text-slate-500">{r.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        To <em>sit for the exam</em> you need a bachelor&apos;s degree plus 24
        accounting and 24 business-related units. The 20 accounting-study and 10
        ethics-study units (and 150 total) are required for{" "}
        <em>licensure</em>.
      </p>

      <div className="mt-12 rounded-2xl bg-amber-50 p-6 text-sm text-amber-900 ring-1 ring-amber-100">
        <strong>⚠️ Not official advice.</strong> PathToCPA is a planning aid, not
        a substitute for the California Board of Accountancy. Requirements change
        — always confirm with the official source before making decisions.
        <div className="mt-3 flex flex-wrap gap-4">
          <a
            className="font-medium underline"
            href="https://www.dca.ca.gov/cba/"
            target="_blank"
            rel="noreferrer"
          >
            California Board of Accountancy →
          </a>
          <a
            className="font-medium underline"
            href="https://www.dca.ca.gov/cba/applicants/"
            target="_blank"
            rel="noreferrer"
          >
            CBA educational requirements →
          </a>
        </div>
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Open source under the MIT license. See the{" "}
        <Link href="/" className="font-medium text-brand-700 underline">
          home page
        </Link>{" "}
        to get started.
      </p>
    </main>
  );
}
