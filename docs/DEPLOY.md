# 🚀 Deploying PathToCPA (Vercel + optional Supabase)

The app works **with no backend** (local-only). Add Supabase to enable **accounts + cloud
sync**. Both are below.

---

## 1. Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel: **Add New… → Project → Import** your repo. It auto-detects Next.js.
3. Click **Deploy**. Done — the app is live in local-only mode (no sign-in).

That's enough if you don't want accounts.

---

## 2. Enable accounts + cloud sync (Supabase)

### a. Create the Supabase project + table
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the contents of [`docs/supabase-schema.sql`](supabase-schema.sql).
   This creates the `user_data` table **and its Row-Level Security policies** (so each user
   only sees their own row — required, since the publishable key is exposed in the browser).
3. In **Project Settings → API**, copy your **Project URL** and **publishable key**.

### b. Add the environment variables in Vercel
**Project → Settings → Environment Variables.** Add both:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL, e.g. `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable (anon) key |

- Use the **exact** names above (the app reads these — see `src/lib/data/supabaseClient.ts`).
- **No quotes, no trailing spaces.**
- Enable them for the **Production** environment (and **Preview** if you test preview URLs).

### c. ⚠️ Redeploy — this is the step people miss
`NEXT_PUBLIC_*` variables are **baked into the build**, not read at runtime. Adding them
**does nothing to a deployment that already built without them.** You must trigger a fresh
build:

> **Deployments → ⋯ (latest) → Redeploy** — and make sure *"Use existing Build Cache"* is
> **off** so it rebuilds with the new variables. (Pushing any commit also triggers a rebuild.)

After the redeploy, the **Sign in** button appears.

---

## Troubleshooting "Sign in / Sign up doesn't show"

The app hides all auth UI unless it sees **both** env vars at build time. Check, in order:

1. **Did you redeploy after adding the vars?** (Most common cause — see step 2c.)
2. Both variable **names** are exactly `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a typo = not detected).
3. They're enabled for the **environment you're viewing** (Production vs Preview).
4. **No quotes/spaces** wrapping the values.
5. The publishable key isn't the placeholder (it must not start with `PASTE_`).

Quick check on the live site: open DevTools → Console and run
`!!document.querySelector('button')` won't help — instead just confirm the **Sign in** button
is present in the top-right nav. If it's missing, the build didn't get the vars → redeploy.

If sign-in **shows** but sign-up/login **fails**, the env vars are fine but the database isn't
set up — re-check step 2a (run `supabase-schema.sql`, including the RLS policies).

---

## Local development

Copy `.env.example` to `.env.local`, fill in the same two values, and run `npm run dev`.
Without `.env.local`, the app runs local-only (no sign-in) — which is fine for development.
