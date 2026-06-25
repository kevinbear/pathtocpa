# Roadmap

A living list of what's built and what's still open. See [PLAN.md](PLAN.md) for the
original milestone plan and [ARCHITECTURE.md](ARCHITECTURE.md) for the design.

## ✅ Done

**Core milestones**
- [x] Scaffold (Next.js 14 + TS + Tailwind, themeable design system)
- [x] California rules engine + eligibility checker (pure, tested)
- [x] Coursework + eligibility UI (local-first)
- [x] Journey tracker + dashboard (progress rings, four stages)
- [x] Cost planner (planned vs paid, CA template, CSV export, spending-by-category)
- [x] Accounts + cloud sync (Supabase auth + per-user data with Row-Level Security)

**Added features**
- [x] CSV / Excel import with editable validated preview, templates, tutorial
- [x] Flyer-accurate eligibility: degree model, Accounting Study **waiver** (master's in
      Accounting/Taxation/Laws-in-Taxation), accounting→business **overflow**
- [x] Interactive requirement **breakdown** page ("size chart" with accepted-subject reference)
- [x] Cost **installments** (per-expense % paid, quick mark-paid)
- [x] **Color theme** switcher (teal / indigo / violet / emerald / rose)
- [x] Coursework **editable table** with inline cell editing + lock/unlock for imports
- [x] Step-by-step **CBA guides** (transcripts, exam, Live Scan, PETH, license)
- [x] Cost **installments** (per-expense % paid)
- [x] **Color themes** + **dark mode**
- [x] Coursework: floating progress widget, delete confirmation, default-locked rows
- [x] **Drag-and-drop Allocate board** (full nested subject taxonomy + unused pool, dnd-kit)

## 🔜 Not yet implemented / ideas

**Eligibility accuracy**
- [ ] Enforce Accounting Study / Ethics sub-caps in the eligibility *verdict* (the Allocate
      board already shows them as guidance via the `subject` field — wire them into the engine)
- [ ] Foreign credential evaluation flow (currently only mentioned in guides)

**Features**
- [ ] Deploy to Vercel for a public URL (M7) — and add screenshots to the README
- [ ] Multi-state support (engines already take a `RuleSet`; add more state rulesets)
- [ ] Track which discipline (BAR/ISC/TCP) was chosen/passed, not just the slot
- [ ] Target-date countdown / reminders for exam NTS expiry and deadlines
- [ ] Duplicate detection when importing coursework
- [ ] Export a full plan (PDF) and shareable read-only progress link
- [ ] Cost planner: due dates, payment dates, reminders
- [ ] Dark mode (in addition to accent themes)
- [ ] Account niceties: password reset UI, a profile/settings page

**Quality**
- [ ] Component/integration tests (only the pure engines are unit-tested today)
- [ ] Accessibility audit (keyboard nav, contrast, ARIA on interactive widgets)
