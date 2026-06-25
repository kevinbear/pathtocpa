"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/hooks";

export const THEMES = [
  { key: "teal", label: "Teal", color: "#14b8a6" },
  { key: "indigo", label: "Indigo", color: "#6366f1" },
  { key: "violet", label: "Violet", color: "#8b5cf6" },
  { key: "emerald", label: "Emerald", color: "#10b981" },
  { key: "rose", label: "Rose", color: "#f43f5e" },
];

export const THEME_KEY = "pathtocpa.theme";
export const MODE_KEY = "pathtocpa.mode";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("teal");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, () => setOpen(false), open);

  useEffect(() => {
    const savedTheme = (typeof localStorage !== "undefined" && localStorage.getItem(THEME_KEY)) || "teal";
    const savedMode = (typeof localStorage !== "undefined" && localStorage.getItem(MODE_KEY)) || "light";
    setTheme(savedTheme);
    setMode(savedMode === "dark" ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedMode === "dark");
  }, []);

  function pickTheme(t: string) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      // ignore
    }
  }

  function pickMode(m: "light" | "dark") {
    setMode(m);
    document.documentElement.classList.toggle("dark", m === "dark");
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // ignore
    }
  }

  const current = THEMES.find((t) => t.key === theme) ?? THEMES[0];

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change appearance"
        className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        <span className="h-4 w-4 rounded-full" style={{ background: current.color }} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-44 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-100">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Appearance
          </p>
          <div className="mb-2 flex gap-1 px-1">
            <button
              onClick={() => pickMode("light")}
              className={`flex-1 rounded-xl px-2 py-1.5 text-sm ${
                mode === "light" ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => pickMode("dark")}
              className={`flex-1 rounded-xl px-2 py-1.5 text-sm ${
                mode === "dark" ? "bg-slate-100 font-medium text-slate-900" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              🌙 Dark
            </button>
          </div>
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Accent
          </p>
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => pickTheme(t.key)}
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
