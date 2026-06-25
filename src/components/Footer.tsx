import Link from "next/link";

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Plan",
    links: [
      { href: "/start", label: "Find your path" },
      { href: "/coursework", label: "Coursework" },
      { href: "/eligibility", label: "Eligibility" },
      { href: "/allocate", label: "Allocate courses" },
    ],
  },
  {
    title: "Track",
    links: [
      { href: "/journey", label: "Journey" },
      { href: "/costs", label: "Cost planner" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/guides", label: "Guides" },
      { href: "/about", label: "About" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-100 bg-white/40">
      <div className="mx-auto max-w-[104rem] px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Path<span className="text-brand-600">To</span>CPA
            </p>
            <p className="mt-2 text-sm text-slate-500">
              A free, open-source planner for California CPA licensure — check eligibility,
              track your journey, and budget the whole process. A planning aid, not official
              advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {g.title}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-slate-600 hover:text-brand-700">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
          PathToCPA · Always confirm requirements with the{" "}
          <a
            href="https://www.dca.ca.gov/cba/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-600"
          >
            California Board of Accountancy
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
