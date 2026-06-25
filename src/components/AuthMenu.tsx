"use client";

import { useState } from "react";
import { useAppData, type SyncStatus } from "@/lib/data/AppDataProvider";
import ConfirmModal from "@/components/ConfirmModal";

function SyncDot({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { color: string; label: string }> = {
    local: { color: "bg-slate-300", label: "Local only" },
    syncing: { color: "bg-amber-400", label: "Syncing…" },
    synced: { color: "bg-brand-500", label: "Synced to cloud" },
    error: { color: "bg-red-500", label: "Sync error" },
  };
  const s = map[status];
  return (
    <span className="flex items-center gap-1" title={s.label}>
      <span className={`h-2 w-2 rounded-full ${s.color}`} />
    </span>
  );
}

export default function AuthMenu() {
  const {
    cloudEnabled,
    user,
    syncStatus,
    storageMode,
    setStorageMode,
    signIn,
    signUp,
    signOut,
    clearAll,
  } = useAppData();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!cloudEnabled) return null;

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setAccountOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-100"
        >
          <SyncDot status={syncStatus} />
          <span className="hidden max-w-[10rem] truncate text-xs text-slate-500 sm:inline">
            {user.email}
          </span>
          <span className="text-xs text-slate-400">⌄</span>
        </button>

        {accountOpen && (
          <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100">
            <p className="px-1 pb-2 text-xs text-slate-400 truncate">{user.email}</p>

            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Where to save your data
            </p>
            <div className="mt-1 flex gap-1">
              <button
                onClick={() => setStorageMode("cloud")}
                className={`flex-1 rounded-xl px-2 py-1.5 text-sm ${
                  storageMode === "cloud"
                    ? "bg-brand-100 font-medium text-brand-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                ☁️ Cloud
              </button>
              <button
                onClick={() => setStorageMode("local")}
                className={`flex-1 rounded-xl px-2 py-1.5 text-sm ${
                  storageMode === "local"
                    ? "bg-brand-100 font-medium text-brand-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                💾 This device
              </button>
            </div>
            <p className="mt-1 px-1 text-[11px] leading-snug text-slate-400">
              {storageMode === "cloud"
                ? "Synced to the database — available on any device you sign in to."
                : "Stored only in this browser for this account — not uploaded, and not on other devices."}
            </p>

            <div className="mt-3 border-t border-slate-100 pt-2">
              <button
                onClick={() => {
                  setConfirmClear(true);
                  setAccountOpen(false);
                }}
                className="block w-full rounded-xl px-1 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Clear all my data
              </button>
              <button
                onClick={() => signOut()}
                className="block w-full rounded-xl px-1 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <ConfirmModal
          open={confirmClear}
          title="Clear all your data?"
          message="This permanently erases all coursework, costs, and progress for this account. This can't be undone."
          confirmLabel="Clear everything"
          onConfirm={() => {
            clearAll();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await (mode === "signin" ? signIn : signUp)(email, password);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
    } else if (res.needsConfirmation) {
      setMsg("Almost there — check your email to confirm your account, then sign in.");
      setMode("signin");
    } else {
      setOpen(false);
      setEmail("");
      setPassword("");
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-oncolor hover:bg-brand-700"
      >
        Sign in
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
          <div className="mb-3 flex gap-1 text-sm">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
                mode === "signin" ? "bg-brand-100 text-brand-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
                mode === "signup" ? "bg-brand-100 text-brand-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-2">
            <input
              type="email"
              required
              className={input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              className={input}
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-oncolor hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}

          <p className="mt-3 text-[11px] leading-snug text-slate-400">
            Optional — sign in to sync your data across devices. The app works
            without an account too.
          </p>
        </div>
      )}
    </div>
  );
}
