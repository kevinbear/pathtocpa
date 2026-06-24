const stages = [
  {
    n: 1,
    title: "Education",
    blurb: "150 semester units + accounting, business, ethics & accounting-study requirements.",
    emoji: "🎓",
  },
  {
    n: 2,
    title: "Exam",
    blurb: "The CPA Exam: 3 Core sections (AUD, FAR, REG) + 1 Discipline.",
    emoji: "📝",
  },
  {
    n: 3,
    title: "Experience",
    blurb: "12 months of general accounting experience (plus attest hours if needed).",
    emoji: "💼",
  },
  {
    n: 4,
    title: "Ethics & License",
    blurb: "Pass the PETH ethics exam, then submit your CBA license application.",
    emoji: "✅",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <span className="pill bg-brand-100 text-brand-800">
          California · CPA planning
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Path<span className="text-brand-600">To</span>CPA
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          A free, open-source planner for California accounting students. See if
          you meet the education requirements, track exactly where you are in
          the licensure journey, and budget the whole process — all in one
          place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="pill bg-slate-100 text-slate-600">Eligibility checker</span>
          <span className="pill bg-slate-100 text-slate-600">Stage tracker</span>
          <span className="pill bg-slate-100 text-slate-600">Cost planner</span>
        </div>
      </header>

      <section aria-label="The CPA journey" className="grid gap-5 sm:grid-cols-2">
        {stages.map((s) => (
          <div key={s.n} className="card">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                {s.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Stage {s.n}
                </p>
                <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{s.blurb}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer className="mt-14 rounded-2xl bg-brand-50 p-6 text-sm text-brand-900 ring-1 ring-brand-100">
        <strong>🚧 Milestone 1 — scaffold.</strong> Next up: the California
        rules engine and eligibility checker (M2). This is a planning aid, not
        official advice — always confirm requirements with the{" "}
        <a
          className="font-medium underline"
          href="https://www.dca.ca.gov/cba/"
          target="_blank"
          rel="noreferrer"
        >
          California Board of Accountancy
        </a>
        .
      </footer>
    </main>
  );
}
