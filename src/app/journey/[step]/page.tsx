import Link from "next/link";
import { notFound } from "next/navigation";
import { STEP_DETAILS, STEP_ORDER } from "@/lib/journey/stepDetails";
import type { StageKey } from "@/lib/journey/computeJourney";
import StepChecklist from "@/components/journey/StepChecklist";
import ExamOrderList from "@/components/journey/ExamOrderList";

export function generateStaticParams() {
  return STEP_ORDER.map((step) => ({ step }));
}

export function generateMetadata({ params }: { params: { step: string } }) {
  const detail = STEP_DETAILS[params.step as StageKey];
  return { title: detail ? `${detail.title} — PathToCPA` : "Journey step — PathToCPA" };
}

export default function JourneyStepPage({ params }: { params: { step: string } }) {
  const detail = STEP_DETAILS[params.step as StageKey];
  if (!detail) notFound();

  const idx = STEP_ORDER.indexOf(detail.key);
  const prev = idx > 0 ? STEP_DETAILS[STEP_ORDER[idx - 1]] : null;
  const next = idx < STEP_ORDER.length - 1 ? STEP_DETAILS[STEP_ORDER[idx + 1]] : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/journey"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 dark:text-brand-300"
        >
          ← Back to your journey
        </Link>
        <span className="pill bg-brand-100 text-brand-800">{detail.stepLabel}</span>
      </div>
      <h1 className="mt-4 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
        <span aria-hidden>{detail.emoji}</span> {detail.title}
      </h1>
      <p className="mt-3 text-slate-600">{detail.what}</p>

      {/* Exam step: the same drag-to-order, check-as-you-pass box from the journey card. */}
      {detail.key === "exam" && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Your exam sections
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Drag the ⠿ handle to set your order, and check each section as you pass it — this is
            the same tracker as on your journey.
          </p>
          <div className="card mt-3">
            <ExamOrderList />
          </div>
        </section>
      )}

      {/* What to do — the checklist */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        What you need to do
      </h2>
      <div className="mt-4">
        <StepChecklist stepKey={detail.key} items={detail.checklist} />
      </div>

      {/* Tips */}
      {detail.tips && detail.tips.length > 0 && (
        <div className="mt-6 rounded-2xl bg-brand-50 p-5 dark:bg-brand-900/30">
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">💡 Good to know</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {detail.tips.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-500">▸</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Where to go next
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {detail.resources.map((r) =>
          r.external ? (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 dark:text-brand-300"
            >
              {r.label} ↗
            </a>
          ) : (
            <Link
              key={r.label}
              href={r.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 dark:text-brand-300"
            >
              {r.label} →
            </Link>
          ),
        )}
      </div>

      {/* Prev / next step nav */}
      <div className="mt-12 flex items-stretch justify-between gap-3 border-t border-slate-100 pt-6">
        {prev ? (
          <Link href={`/journey/${prev.key}`} className="group max-w-[48%] text-left">
            <span className="text-xs text-slate-400">← Previous</span>
            <span className="block text-sm font-semibold text-slate-700 group-hover:text-brand-700">
              {prev.emoji} {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/journey/${next.key}`} className="group max-w-[48%] text-right">
            <span className="text-xs text-slate-400">Next →</span>
            <span className="block text-sm font-semibold text-slate-700 group-hover:text-brand-700">
              {next.emoji} {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
