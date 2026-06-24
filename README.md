# PathToCPA 🎓

**Plan your California CPA licensure journey — eligibility, stages, and costs, all in one place.**

PathToCPA is a free, open-source web app for California accounting students. It runs
**locally with zero setup** (your data stays in your browser), and optionally syncs to
the cloud if you sign in.

> ⚠️ **Not official advice.** This is a planning aid. Requirements and fees change —
> always confirm with the [California Board of Accountancy (CBA)](https://www.dca.ca.gov/cba/).

---

## ✨ Features

- **✅ Eligibility checker** — add your coursework and instantly see whether you meet the
  education requirements to **sit for the CPA Exam** and to be **licensed** (the 150-unit
  rule), with an exact list of what's still missing. Powered by a tested rules engine.
- **🧭 Journey tracker** — see which of the four stages (Education → Exam → Experience →
  Ethics & License) you're in, what to do next, and your **% complete** per stage and overall.
- **💰 Cost planner** — itemize every expense (review course, exam fees, transcripts, CBA
  application, Live Scan, PETH, certified mail, commute…), track **planned vs paid**, see a
  spending-by-category breakdown, and **export to CSV**. Seeded with a California template.
- **📥 CSV / Excel import** — bulk-add courses from a spreadsheet with an **editable,
  validated preview**, downloadable templates, and an in-app tutorial. Files are parsed
  entirely in your browser — nothing is uploaded.
- **☁️ Optional accounts + cloud sync** — sign in (Supabase) to save your data and sync it
  across devices. Fully optional; the app works without an account.
- **📊 Interactive requirement breakdown** — a "size chart" showing exactly what counts in
  each category, what you've used, and what's left, with the flyer's accepted-subject lists.
- **🎓 Degree-aware rules** — a master's in Accounting/Taxation/Laws-in-Taxation waives the
  Accounting Study requirement; accounting units beyond 24 count toward business-related.
- **📚 Editable coursework table** — edit any cell inline; imported rows lock by default.
- **🧭 Step-by-step CBA guides** — transcripts, exam application, Live Scan, PETH, and more.
- **🎨 Color themes** — pick teal, indigo, violet, emerald, or rose.

---

## 🧰 Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | React framework, file-based routing, easy free hosting |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety across the rules engine and UI |
| **UI** | [React 18](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/) | Component model + a friendly, teal, responsive design system |
| **Spreadsheet parsing** | [SheetJS](https://sheetjs.com/) (`xlsx`) | Reads CSV **and** Excel in-browser; loaded on demand |
| **Backend (optional)** | [Supabase](https://supabase.com/) | Hosted Postgres **+ authentication**, with Row-Level Security |
| **Testing** | [Vitest](https://vitest.dev/) | Fast unit tests for the pure engines |
| **Hosting** | [Vercel](https://vercel.com/) | One-click deploys from GitHub |

**Design principles**
- **Local-first.** Everything works offline in `localStorage`; cloud sync is an opt-in add-on.
- **Pure, tested engines.** Eligibility, journey, and cost logic are pure functions with no
  UI/DB dependencies — easy to test and trust.
- **Rules as versioned config.** California's requirements live in one auditable file with a
  `lastVerified` date, so they're easy to update and to extend to other states later.
- **Adapter pattern for storage.** The UI talks to one data layer; local-only and cloud-sync
  are two implementations behind it — no rewrite to add cloud.

---

## 🚀 Getting started (run it locally)

**Prerequisites:** [Node.js](https://nodejs.org/) 18.18+ and npm.

```bash
git clone https://github.com/kevinbear/pathtocpa.git
cd pathtocpa
npm install
npm run dev
# open http://localhost:3000
```

That's it — **no account or database needed**. Your data saves in your browser.

### Optional: enable cloud sync (Supabase)

1. Create a free project at [supabase.com](https://supabase.com/).
2. In the Supabase **SQL Editor**, run [`docs/supabase-schema.sql`](docs/supabase-schema.sql)
   to create the `user_data` table and its Row-Level Security policies.
3. Copy `.env.example` to `.env.local` and fill in your **Project URL** and **Publishable key**
   (Supabase dashboard → Connect):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   ```
4. Restart `npm run dev`. A **Sign in** button appears in the nav.

---

## 📜 Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
npm run test    # run the unit tests (Vitest)
```

---

## 🗂️ Project structure

```
src/
├─ app/                    # routes (App Router): dashboard, coursework, eligibility, journey, costs, about
├─ components/             # UI components (per feature) + shared (ProgressRing, ProgressBar, Nav, AuthMenu)
└─ lib/
   ├─ rules/california.ts  # California requirements as versioned config (the source of truth)
   ├─ eligibility/         # pure eligibility engine + tests
   ├─ journey/             # pure four-stage journey engine + tests
   ├─ costs/               # cost summary engine, CA template, CSV export + tests
   ├─ import/              # CSV/Excel parsing + validation + tests
   └─ data/                # local-first store, Supabase client, sync logic
docs/                      # PLAN.md, ARCHITECTURE.md, supabase-schema.sql
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit together.

---

## 🧭 Project status

Built in milestones — see [`docs/PLAN.md`](docs/PLAN.md) for the full plan.

- [x] **M1 — Scaffold** (Next.js + Tailwind, theme, docs)
- [x] **M2 — California rules engine + eligibility checker** (pure engine + tests)
- [x] **M3 — Coursework + eligibility UI** (local storage)
- [x] **CSV / Excel import** (validated preview, templates, tutorial)
- [x] **M4 — Journey tracker + dashboard** (progress rings, stage tracking)
- [x] **M5 — Cost tracker** (planned-vs-paid, CA template, CSV export)
- [x] **M6 — Accounts + cloud sync** (Supabase auth + per-user data with RLS)
- [ ] **M7 — Polish + deploy** (public URL on Vercel)

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full list of shipped features and what's next.

---

## 🤝 Contributing

Contributions are welcome — especially keeping the California rules accurate and (eventually)
adding other states. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE) — free to use, run locally, and build on.
