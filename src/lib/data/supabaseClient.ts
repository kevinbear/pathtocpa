import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True when both env vars are present — i.e. cloud sync is available. */
export const isSupabaseConfigured = Boolean(
  url && publishableKey && !publishableKey.startsWith("PASTE_"),
);

// Diagnostic: when cloud sync is off, log WHY in the browser console so a misconfigured
// deploy is obvious. NEXT_PUBLIC_* values are inlined at BUILD time — if these read as
// "MISSING" on a deploy where you set them, the build is stale (redeploy with build cache
// OFF). Nothing is logged when correctly configured.
if (typeof window !== "undefined" && !isSupabaseConfigured) {
  console.warn(
    "[PathToCPA] Cloud sync is OFF, so sign-in is hidden.\n" +
      `  NEXT_PUBLIC_SUPABASE_URL: ${url ? "present" : "MISSING at build time"}\n` +
      `  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${
        publishableKey
          ? publishableKey.startsWith("PASTE_")
            ? "placeholder (still PASTE_…)"
            : "present"
          : "MISSING at build time"
      }\n` +
      "  On Vercel: set both, then REDEPLOY with 'Use existing Build Cache' OFF — NEXT_PUBLIC_* vars are baked into the build.",
  );
}

/**
 * A single shared Supabase client, or null when not configured.
 * Null keeps the app fully working in local-only mode (no account needed).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, publishableKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Row shape of the per-user data document in Postgres. */
export interface UserDataRow {
  user_id: string;
  data: unknown;
  updated_at: string;
}
