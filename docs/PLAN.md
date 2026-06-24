# PathToCPA — Project Plan

> A free, open-source web app that gives any California accounting student a clear,
> personalized picture of their CPA licensure journey — *am I eligible, what stage am
> I in, what's next, what % am I done,* and *what will it all cost.*

## Decisions

| Area | Decision |
|---|---|
| State scope | **California (CBA) first**, designed to add states later |
| Data | **Local-first now, optional accounts + cloud sync** (Supabase) |
| MVP heart | **Eligibility checker + Process/stage tracker** (cost tracker next) |
| Stack | **Next.js + React + TypeScript + Tailwind + Supabase** |
| Visual style | **Friendly & modern** (rounded cards, soft accents, progress rings) |
| Accent color | **Teal** (`brand` scale in `tailwind.config.ts`) |
| Course input | **Course-by-course list**, app tallies categories |
| Device | **Responsive, desktop-first** |

## The domain — California CPA journey

Rules are encoded as **versioned config** (`src/lib/rules/california.ts`) with a
`lastVerified` date, never hardcoded in components. This keeps them auditable and
makes adding another state straightforward.

**Four stages:**

1. **Education** — Bachelor's + units
   - *To sit for the exam:* bachelor's degree + **24 semester units accounting** + **24 semester units business-related**
   - *To be licensed:* **150 total semester units** + the 24 + 24, **plus 20 units accounting study**, **plus 10 units ethics study**
2. **Exam** — Uniform CPA Exam (CPA Evolution): 3 Core (AUD, FAR, REG) + 1 Discipline (BAR / ISC / TCP)
3. **Experience** — 12 months general accounting experience (+ attest hours if signing attest reports)
4. **Ethics & Licensure** — PETH ethics exam, then the license application

**Details the app handles:** semester vs quarter units (quarter ×2/3 → semester),
category mapping with overlap rules, and completed-vs-planned courses.

> ⚠️ **Not official advice.** Every rules surface links to the official CBA source and
> shows a "rules last verified" date. Always confirm with the
> [California Board of Accountancy](https://www.dca.ca.gov/cba/).

## Features by phase

**MVP (v0.1) — the two anchors**
- Course list (add/edit/delete; name, units, unit-type, category, institution, term, completed?)
- Eligibility engine: per-category required / completed / remaining + two verdicts (exam-eligible? license-eligible?) + "what's missing" list
- Journey tracker: 4 stages, current stage, next step, % complete per stage and overall
- Friendly dashboard with progress rings
- Local storage (zero setup, no login)

**v0.2 — Cost tracker**
- Itemized expenses (review course, per-section exam fees, CBA application/re-exam, transcripts, Live Scan, PETH, license fee, certified mail, commute, misc)
- Planned vs paid, running totals, CSV export, seeded CA cost templates

**v0.3 — Accounts + cloud sync**
- Supabase auth (email/Google), sync local → cloud, Row-Level Security

**Later (v1+)** — more states, exam scheduling/reminders, shareable progress, transcript import, community-maintained rules.

## Architecture

```
Next.js (App Router) + TypeScript + Tailwind
 ├─ Eligibility engine = pure functions (unit-tested, no UI/DB deps)
 ├─ Rules as versioned config (src/lib/rules/california.ts)
 ├─ Data layer = adapter interface (DataStore)
 │     ├─ LocalStorageAdapter  (default, no login)
 │     └─ SupabaseAdapter      (when logged in)
 └─ Supabase: Postgres + Auth + Row-Level Security
```

The **adapter pattern** lets "local-only" and "cloud sync" be two implementations of
one `DataStore` interface — local-first now, cloud later, no rewrite.

**Entities:** `Profile`, `Course`, `JourneyStage` (derived), `Expense`, `RuleSet`.

**Eligibility engine:**
```
evaluate(courses, ruleSet) → {
  categories: { accounting, business, accountingStudy, ethics, total }
              each → { required, completed, remaining, satisfied },
  examEligible: boolean,
  licenseEligible: boolean,
  missing: string[]
}
```

## UI / UX (friendly & modern, desktop-first responsive)

Pages: **Dashboard** (overall ring + current stage + next step), **My Coursework**
(course table + live tally), **Eligibility** (per-category breakdown + missing list),
**Journey** (stage timeline), **Costs** (v0.2), **About/Rules** (plain-language rules +
CBA links + disclaimer).

Design language: rounded `2xl` cards, soft shadows, teal accent, progress **rings** as
the signature motif, generous whitespace, encouraging microcopy, accessible contrast.

## Repo structure

```
/
├─ README.md
├─ docs/PLAN.md            ← this file
├─ .env.example            ← Supabase keys (optional; app runs without them)
├─ src/
│   ├─ app/                ← pages
│   ├─ components/
│   ├─ lib/eligibility/    ← engine + tests
│   ├─ lib/rules/california.ts
│   └─ lib/data/           ← adapters (local + supabase)
└─ LICENSE (MIT)
```

Runs with `npm install && npm run dev` — no Supabase needed for the local experience.
Deploy free to Vercel. MIT licensed.

## Milestones

1. **M1 – Scaffold** ✅ Next.js + TS + Tailwind, layout, teal tokens, landing, docs.
2. **M2 – Engine** ✅ CA ruleset + eligibility engine + unit tests (no UI).
3. **M3 – Coursework + Eligibility UI** ✅ wired to local storage (+ CSV/Excel import).
4. **M4 – Journey tracker** ✅ dashboard with progress rings.
5. **M5 – Cost tracker** ✅ with CA templates + CSV export.
6. **M6 – Supabase auth + cloud sync** ✅ behind the adapter, with RLS.
7. **M7 – Polish, docs, screenshots, deploy.** ⬜ in progress.

A genuinely useful app ships at the end of **M4**.
