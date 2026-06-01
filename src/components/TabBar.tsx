"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Resume" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/play", label: "Play" },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="no-print sticky top-0 z-50 flex items-center gap-1 border-b border-brand-200 bg-brand-bg/80 px-4 py-2 backdrop-blur-sm dark:border-brand-800 dark:bg-brand-900/80"
      aria-label="Main navigation"
    >
      {tabs.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "bg-brand-600 text-white"
                : "text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
