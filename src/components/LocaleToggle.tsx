"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale";

export function LocaleToggle() {
  // Guard against hydration mismatch — same pattern as ThemeToggle
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same size to avoid layout shift
    return <div className="no-print h-11 w-[4.5rem] rounded-md" aria-hidden />;
  }

  return (
    <div className="no-print flex h-11 items-stretch rounded-md overflow-hidden ring-1 ring-brand-200 dark:ring-brand-700">
      <button
        onClick={() => setLocale("cs")}
        className={
          locale === "cs"
            ? "flex items-center px-2.5 text-xs font-semibold bg-brand-600 text-white transition-colors"
            : "flex items-center px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800 transition-colors"
        }
        aria-pressed={locale === "cs"}
        aria-label="Switch to Czech"
      >
        CZ
      </button>
      <button
        onClick={() => setLocale("en")}
        className={
          locale === "en"
            ? "flex items-center px-2.5 text-xs font-semibold bg-brand-600 text-white transition-colors"
            : "flex items-center px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800 transition-colors"
        }
        aria-pressed={locale === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
