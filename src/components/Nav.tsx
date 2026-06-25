"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthMenu from "@/components/AuthMenu";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const links = [
  { href: "/", label: "Home" },
  { href: "/start", label: "Start" },
  { href: "/coursework", label: "Coursework" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/allocate", label: "Allocate" },
  { href: "/journey", label: "Journey" },
  { href: "/costs", label: "Costs" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-slate-900">
          Path<span className="text-brand-600">To</span>CPA
        </Link>
        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-1 text-sm">
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
          </div>
        </div>
      </nav>
    </header>
  );
}
