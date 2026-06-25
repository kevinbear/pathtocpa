import Link from "next/link";
import { GUIDES, STAGE_LABELS, CBA_CONTACT, type GuideStage } from "@/lib/guides/guides";
import ExamFlowDiagram from "@/components/guides/ExamFlowDiagram";

export const metadata = { title: "Guides — PathToCPA" };

const STAGE_ORDER: GuideStage[] = ["education", "exam", "experience", "ethics"];

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6">
        <Link href="/journey" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to Journey
        </Link>
      </div>
      <div className="mb-8">
        <span className="pill bg-brand-100 text-brand-800">Guides</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Step-by-step CBA guides
        </h1>
        <p className="mt-2 text-slate-600">
          Plain-English walkthroughs for each part of the California CPA process —
          creating your CBA account, sending transcripts, scheduling the exam,
          fingerprinting, the ethics exam, and applying for your license.
        </p>
      </div>

      {STAGE_ORDER.map((stage) => {
        const guides = GUIDES.filter((g) => g.stage === stage);
        if (guides.length === 0) return null;
        return (
          <section key={stage} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {STAGE_LABELS[stage]}
            </h2>
            {stage === "exam" && <ExamFlowDiagram />}
            <div className="space-y-3">
              {guides.map((g) => (
                <details key={g.id} className="card group">
                  <summary className="flex cursor-pointer items-center gap-3 list-none">
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-slate-900">{g.title}</span>
                      <span className="block text-sm text-slate-500">{g.summary}</span>
                    </span>
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 8l5 5 5-5" />
                    </svg>
                  </summary>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                      {g.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>

                    {g.tips && g.tips.length > 0 && (
                      <div className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
                        <p className="font-semibold">Tips</p>
                        <ul className="mt-1 space-y-1">
                          {g.tips.map((t) => (
                            <li key={t} className="flex gap-2">
                              <span>•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      {g.links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}

      <div className="card mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Need help from the CBA?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Phone <span className="font-medium text-slate-800">{CBA_CONTACT.phone}</span> · Email{" "}
          <a href={`mailto:${CBA_CONTACT.email}`} className="font-medium text-brand-700 underline">
            {CBA_CONTACT.email}
          </a>{" "}
          · Website{" "}
          <a href={CBA_CONTACT.website} target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline">
            cba.ca.gov
          </a>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        These guides are a planning aid, not official advice. Steps and links may
        change — always confirm the current process on the official CBA website.
      </p>
    </main>
  );
}
