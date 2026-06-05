"use client";

import { useLocale } from "@/lib/locale";
import { labels } from "@/lib/labels";

export function SiteFooter() {
  const { locale } = useLocale();
  const l = labels[locale];

  return (
    <footer className="no-print mt-8 border-t border-brand-200 py-4 text-center text-xs text-brand-500 dark:border-brand-800 dark:text-brand-400">
      <p>
        {l.builtBy}{" "}
        <a
          href="https://github.com/MarioEpkOne/CVapplication"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-brand-700"
        >
          {l.viewSource}
        </a>
      </p>
    </footer>
  );
}
