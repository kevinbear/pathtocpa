import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** True when both env vars are present — i.e. cloud sync is available. */
export const isSupabaseConfigured = Boolean(
  url && publishableKey && !publishableKey.startsWith("PASTE_"),
);

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
