"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale";
import { labels } from "@/lib/labels";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TabBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const l = labels[locale];

  const tabs = [
    { href: "/", label: l.resume },
    { href: "/cover-letter", label: l.coverLetter },
    { href: "/play", label: l.play },
  ];

  return (
    <nav
      className="no-print sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-brand-200 bg-brand-bg/80 px-4 py-2.5 backdrop-blur-md dark:border-brand-800 dark:bg-brand-900/80"
      aria-label="Main navigation"
    >
      {/* Left group — tabs */}
      <div className="flex items-center gap-1">
        {tabs.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-[9px] px-4 py-[7px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "bg-brand-600 text-white shadow-[0_12px_30px_-18px_rgba(8,51,68,0.14)] dark:shadow-[0_16px_40px_-22px_rgba(0,0,0,0.5)]"
                  : "text-brand-700 hover:bg-brand-500/10 hover:text-brand-900 dark:text-brand-300 dark:hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right group — locale + theme toggles */}
      <div className="flex items-center gap-2">
        <LocaleToggle />
        <ThemeToggle />
      </div>
    </nav>
  );
}
