# Architecture

PathToCPA is a **local-first** Next.js app with **pure, tested domain engines** and an
optional Supabase backend behind a storage adapter. This doc explains how the pieces fit.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  UI (src/app, src/components)                                │
│  Routes + React components. Reads/writes via one hook.       │
└───────────────▲─────────────────────────────────────────────┘
                │ useAppData()
┌───────────────┴─────────────────────────────────────────────┐
│  Data layer (src/lib/data)                                   │
│  AppDataProvider — React context holding {profile, courses,  │
│  expenses}. Persists to localStorage; mirrors to Supabase    │
│  when signed in. Exposes auth (sign in/up/out) + sync status.│
└───────▲───────────────────────────────────▲─────────────────┘
        │ pure functions                     │ optional
┌───────┴───────────────┐         ┌──────────┴──────────────────┐
│  Domain engines       │         │  Supabase (cloud)           │
│  (src/lib/*)          │         │  Postgres + Auth + RLS      │
│  eligibility, journey,│         │  one JSON row per user      │
│  costs, import        │         └─────────────────────────────┘
│  + rules/california   │
└───────────────────────┘
```

## Domain engines (pure, no UI/DB)

These are the trustworthy core. Each is a pure function with unit tests, so the advice the
app gives is deterministic and verifiable.

- **`rules/california.ts`** — the requirements (24/24/20/10/150) as versioned config with a
  `lastVerified` date, source URL, and honest notes on simplifications. The single source of
  truth; designed so other states can be added as sibling rulesets.
- **`eligibility/evaluate.ts`** — `evaluate(input, ruleSet)` → per-category progress plus
  **exam** and **license** verdicts and a human-readable "what's missing" list. Handles
  quarter→semester conversion and completed-vs-planned counting.
- **`journey/computeJourney.ts`** — derives the four stages (Education → Exam → Experience →
  Ethics & License) with status and % complete. Education progress comes from the eligibility
  engine; later stages come from self-reported profile fields.
- **`costs/summary.ts`** — aggregates expenses into totals, paid/planned split, and a
  per-category breakdown.
- **`import/courseImport.ts`** — maps raw spreadsheet rows (flexible header aliases) into
  validated course drafts, reporting missing columns and per-field errors.

## Data layer & the adapter idea

`AppDataProvider` (`src/lib/data/AppDataProvider.tsx`) is the only thing the UI talks to. It:

1. Loads from `localStorage` on mount (instant, offline, no account).
2. Tracks the Supabase auth session (when configured).
3. On sign-in, loads the user's cloud row (or seeds it from local data on first login).
4. On every change, writes to `localStorage` and — if signed in — **debounce-saves** to
   Supabase. A `syncStatus` (`local` / `syncing` / `synced` / `error`) drives the UI dot.

If Supabase env vars are absent, the client is `null` and the app runs in pure local-only
mode — nothing breaks. This is the "adapter" idea in practice: one interface, two backends.

## Cloud schema & security

Cloud sync stores each user's **entire app state as one JSON document**, keyed by their auth
user id, in a single `user_data` table (`docs/supabase-schema.sql`). **Row-Level Security**
policies tie every read/write to `auth.uid()`, so a user can only ever access their own row.
A JSON-blob-per-user model was chosen over normalized tables for simplicity — it mirrors the
local `localStorage` shape exactly, so local and cloud use the same data structure.

## Why these choices

- **Local-first** keeps the barrier to entry at zero (clone & run) and makes the project
  genuinely useful offline — important for an open-source tool others self-host.
- **Pure engines** mean the CPA logic can be tested in isolation and trusted, independent of
  any UI or database.
- **Rules-as-config** keeps the most change-prone part (the requirements) in one auditable
  place and lays the groundwork for multi-state support.

## Adding another state (future)

1. Add `src/lib/rules/<state>.ts` implementing the `RuleSet` interface.
2. Let the user pick a state in their profile; pass the chosen ruleset into `evaluate` and
   `computeJourney`.
3. Add a cost template for that state under `src/lib/costs/`.

The engines are already state-agnostic — they take a `RuleSet` as a parameter.
