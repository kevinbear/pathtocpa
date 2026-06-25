"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthMenu from "@/components/AuthMenu";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useClickOutside } from "@/lib/hooks";

// Top-nav tabs. Allocate is intentionally omitted (you reach it from the
// Eligibility → breakdown page); Guides live alongside the Journey page and in
// the footer rather than as their own tab.
const links = [
  { href: "/", label: "Home" },
  { href: "/start", label: "Start" },
  { href: "/journey", label: "Journey" },
  { href: "/coursework", label: "Coursework" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/costs", label: "Costs" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);

  // Close the mobile menu on click-outside and whenever the route changes.
  useClickOutside(headerRef, close, open);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur"
    >
      <nav className="mx-auto flex max-w-[104rem] items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-slate-900">
          Path<span className="text-brand-600">To</span>CPA
        </Link>
        <div className="flex items-center gap-3">
          {/* Desktop tabs — hidden on small screens */}
          <ul className="hidden items-center gap-1 text-sm md:flex">
            {links.slice(1).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                    isActive(l.href)
                      ? "bg-brand-100 text-brand-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <ThemeSwitcher />
            <AuthMenu />
            {/* Hamburger — only on small screens */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur md:hidden">
          <ul className="mx-auto max-w-[104rem] space-y-1 px-4 py-3 text-sm">
            {links.slice(1).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={close}
                  className={`block rounded-xl px-4 py-2.5 font-medium transition-colors ${
                    isActive(l.href)
                      ? "bg-brand-100 text-brand-800"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
