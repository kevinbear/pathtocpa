"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthMenu from "@/components/AuthMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/coursework", label: "Coursework" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/journey", label: "Journey" },
  { href: "/costs", label: "Costs" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Path<span className="text-brand-600">To</span>CPA
        </Link>
        <div className="flex items-center gap-2">
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
          <AuthMenu />
        </div>
      </nav>
    </header>
  );
}
