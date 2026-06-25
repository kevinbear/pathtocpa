import Link from "next/link";

const GITHUB_URL = "https://github.com/kevinbear/pathtocpa";

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
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 5 18 5.3 18 5.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
                </svg>
                GitHub
              </a>
            </div>
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
          <span className="font-medium text-slate-500">California only.</span> PathToCPA covers
          California CPA requirements — it doesn&apos;t include other states&apos; rules, which
          differ. Always confirm with the{" "}
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
