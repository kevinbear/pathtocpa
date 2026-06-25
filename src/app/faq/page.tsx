import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "FAQ — PathToCPA" };

const HOW_TO: { step: string; title: string; body: string; href?: string; cta?: string }[] = [
  {
    step: "1",
    title: "Find your path",
    body: "Answer three quick questions on the Start page and we'll recommend the most sensible route to your California CPA license.",
    href: "/start",
    cta: "Open Start",
  },
  {
    step: "2",
    title: "Add your coursework",
    body: "Type each course in, or bulk-import a CSV/Excel file (download a template, or have an AI chatbot fill it from your transcript). We tally your units by category automatically.",
    href: "/coursework",
    cta: "Open Coursework",
  },
  {
    step: "3",
    title: "Check your eligibility",
    body: "See whether you can sit for the exam and what's still left for licensure, with a category-by-category breakdown.",
    href: "/eligibility",
    cta: "Open Eligibility",
  },
  {
    step: "4",
    title: "Fine-tune with Allocate",
    body: "Drag each course into the exact requirement and sub-area it should count toward when the automatic guess isn't perfect.",
    href: "/allocate",
    cta: "Open Allocate",
  },
  {
    step: "5",
    title: "Track your journey",
    body: "Follow the real California flow — qualify to sit, then the exam and experience in parallel, then finish licensure education and apply. Enter your exam dates to track the deadline windows.",
    href: "/journey",
    cta: "Open Journey",
  },
  {
    step: "6",
    title: "Plan your costs",
    body: "Budget the whole process from the California template and mark items paid as you go.",
    href: "/costs",
    cta: "Open Costs",
  },
];

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Is this official advice?",
    a: (
      <>
        No. PathToCPA is a planning aid, not a substitute for the{" "}
        <a className="underline" href="https://www.dca.ca.gov/cba/" target="_blank" rel="noreferrer">
          California Board of Accountancy
        </a>
        . Always confirm requirements with the official source before making decisions.
      </>
    ),
  },
  {
    q: "Which state does this cover?",
    a: <>California only. Other states have different CPA requirements, so this tool won&apos;t match them.</>,
  },
  {
    q: "Do I need an account?",
    a: (
      <>
        No. Everything works with no sign-in — your data stays in your browser. Sign in only if you want
        to sync your data across devices.
      </>
    ),
  },
  {
    q: "Where is my data stored, and what happens when I sign out?",
    a: (
      <>
        By default it&apos;s saved in <strong>this browser only</strong> (local). If you sign in and choose{" "}
        <strong>Cloud</strong>, it&apos;s saved to the database and follows you across devices. Signing out
        clears this browser&apos;s copy — cloud data comes back when you sign in again, but{" "}
        <strong>local-only data is removed</strong> (we warn you first).
      </>
    ),
  },
  {
    q: "What's the difference between sitting for the exam and getting licensed?",
    a: (
      <>
        To <strong>sit</strong> for the exam you only need a bachelor&apos;s degree + 24 accounting + 24
        business units. <strong>Licensure</strong> additionally requires 150 total units, 20 accounting-study
        units, 10 ethics-study units, and qualifying experience.
      </>
    ),
  },
  {
    q: "Is there still a PETH ethics exam?",
    a: <>No — California removed the PETH ethics exam on July 1, 2024. It&apos;s no longer required.</>,
  },
  {
    q: "What's the new 2027 pathway?",
    a: (
      <>
        Starting January 1, 2027, California&apos;s AB 1175 adds a route needing a bachelor&apos;s (120 units)
        + 2 years of experience. Both the old and new rules are valid during 2027–2028; only the new ones
        remain from 2029. See the pathways section on the <Link className="underline" href="/start">Start page</Link>.
      </>
    ),
  },
  {
    q: "How do the exam deadline windows work?",
    a: (
      <>
        There are three: 90 days to pay NASBA after authorization, ~9 months to schedule &amp; sit on your
        NTS, and a rolling 30 months to pass the other three sections once you pass your first. Enter your
        dates on the <Link className="underline" href="/journey">Journey page</Link> to track each countdown.
      </>
    ),
  },
  {
    q: "I studied abroad — what do I do?",
    a: (
      <>
        Your foreign transcripts must first be evaluated by a CBA-approved foreign credentials evaluation
        service, which sends the evaluation to the CBA. See the transcripts guide for the approved list.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: (
      <>
        Yes — free and open-source (MIT). You can view the code on{" "}
        <a className="underline" href="https://github.com/kevinbear/pathtocpa" target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <span className="pill bg-brand-100 text-brand-800">Help</span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">FAQ &amp; how to use</h1>
      <p className="mt-2 text-slate-600">
        How PathToCPA works, and answers to common questions about California CPA licensure.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
        How to use PathToCPA
      </h2>
      <ol className="mt-4 space-y-3">
        {HOW_TO.map((s) => (
          <li key={s.step} className="card flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
              {s.step}
            </span>
            <div>
              <p className="font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              {s.href && (
                <Link
                  href={s.href}
                  className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
                >
                  {s.cta} →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Frequently asked questions
      </h2>
      <div className="mt-4 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">{f.q}</span>
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
            <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Still stuck? The{" "}
        <Link href="/guides" className="font-medium text-brand-700 underline dark:text-brand-300">
          step-by-step guides
        </Link>{" "}
        walk through each part of the process in detail.
      </p>
    </main>
  );
}
