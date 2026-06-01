"use client";

import { Reveal } from "@/components/Reveal";
import type { LetterSection } from "@/data/cover-letter";

interface ScrollytellingProps {
  sections: LetterSection[];
}

export function Scrollytelling({ sections }: ScrollytellingProps) {
  return (
    <div className="space-y-16">
      {sections.map((section, i) => (
        <Reveal key={section.id} delay={0} as="article">
          {/* Eyebrow */}
          {section.eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400">
              {section.eyebrow}
            </p>
          )}

          {/* Heading */}
          <h2
            className={`mb-4 font-bold leading-tight text-brand-900 dark:text-brand-100 ${
              i === 0 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {section.heading}
          </h2>

          {/* Body paragraphs — content only from data (Constraint) */}
          <div className="space-y-3">
            {section.body.map((paragraph, pi) => (
              <p
                key={pi}
                className="text-base leading-relaxed text-brand-700 dark:text-brand-300"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
