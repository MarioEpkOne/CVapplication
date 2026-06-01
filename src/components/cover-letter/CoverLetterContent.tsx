"use client";

import { useLocale } from "@/lib/locale";
import { letterSections } from "@/data/cover-letter";
import { labels } from "@/lib/labels";
import { Scrollytelling } from "@/components/cover-letter/Scrollytelling";

export function CoverLetterContent() {
  const { locale } = useLocale();
  const sections = letterSections[locale];
  const l = labels[locale];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Greeting */}
      <div className="mb-12 text-sm text-brand-500 dark:text-brand-400">
        <p>{l.greeting}</p>
      </div>

      {/* Scrollytelling sections — content only from cover-letter.ts (Constraint) */}
      <Scrollytelling sections={sections} />

      {/* Signing off */}
      <div className="mt-16 border-t border-brand-200 pt-8 dark:border-brand-700">
        <p className="text-brand-700 dark:text-brand-300">{l.signOff}</p>
        <p className="mt-1 font-semibold text-brand-900 dark:text-brand-100">{l.signOffName}</p>
      </div>
    </div>
  );
}
