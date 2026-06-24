"use client";

import { useEffect, useState } from "react";

export const THEMES = [
  { key: "teal", label: "Teal", color: "#14b8a6" },
  { key: "indigo", label: "Indigo", color: "#6366f1" },
  { key: "violet", label: "Violet", color: "#8b5cf6" },
  { key: "emerald", label: "Emerald", color: "#10b981" },
  { key: "rose", label: "Rose", color: "#f43f5e" },
];

export const THEME_KEY = "pathtocpa.theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("teal");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem(THEME_KEY)) || "teal";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function pick(t: string) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  }

  const current = THEMES.find((t) => t.key === theme) ?? THEMES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change color theme"
        className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        <span className="h-4 w-4 rounded-full" style={{ background: current.color }} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-40 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-100">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Color theme
          </p>
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => pick(t.key)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${
                theme === t.key ? "bg-slate-100 font-medium" : "hover:bg-slate-50"
              }`}
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: t.color }} />
              {t.label}
              {theme === t.key && <span className="ml-auto text-xs text-slate-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
