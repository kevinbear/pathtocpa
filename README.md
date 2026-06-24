# PathToCPA 🎓

**Plan your California CPA licensure journey — eligibility, stages, and costs, all in one place.**

PathToCPA is a free, open-source web app for California accounting students. It helps you:

- ✅ **Check your eligibility** — enter your coursework and see whether you meet the
  education requirements to sit for the CPA Exam and to be licensed (the 150-unit rule),
  plus exactly what's still missing.
- 🧭 **Track your journey** — see which of the four stages (Education → Exam →
  Experience → Ethics & License) you're in, what to do next, and how far along you are.
- 💰 **Budget the process** *(coming soon)* — itemize every cost (review course, exam
  fees, transcripts, CBA application, Live Scan, certified mail, commute, and more).

> ⚠️ **Not official advice.** This is a planning aid. Requirements change — always
> confirm with the [California Board of Accountancy (CBA)](https://www.dca.ca.gov/cba/).

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling (teal, friendly-modern theme)
- [Supabase](https://supabase.com/) for optional accounts + cloud sync *(added in M6)*
- The app runs fully **local-first** — no account or backend required to use it.

## Getting started (run it locally)

**Prerequisites:** [Node.js](https://nodejs.org/) 18.18+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open the app
# Visit http://localhost:3000
```

That's it — no environment variables or database needed for the local experience.
Cloud sync (optional) is configured later via `.env.local`; see `.env.example` once M6 lands.

### Other commands

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
npm run test    # run unit tests (eligibility engine, added in M2)
```

## Project status

This project is built in milestones — see [`docs/PLAN.md`](docs/PLAN.md) for the full plan.

- [x] **M1 — Scaffold** (Next.js + Tailwind, theme, landing page, docs)
- [ ] **M2 — California rules engine + eligibility checker** (with tests)
- [ ] **M3 — Coursework + eligibility UI** (local storage)
- [ ] **M4 — Journey tracker + dashboard**
- [ ] **M5 — Cost tracker**
- [ ] **M6 — Accounts + cloud sync (Supabase)**
- [ ] **M7 — Polish + deploy**

## Contributing

Contributions are welcome — especially help keeping the California rules accurate and
(eventually) adding other states. See [`docs/PLAN.md`](docs/PLAN.md) for architecture.

## License

[MIT](LICENSE) — free to use, run locally, and build on.
