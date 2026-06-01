"use client";

import { Reveal } from "@/components/Reveal";
import type { ExperienceEntry } from "@/data/resume.types";

interface ExperienceTimelineProps {
  experience: ExperienceEntry[];
}

function formatDate(ym: string): string {
  if (ym === "present") return "Present";
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ExperienceTimeline({ experience }: ExperienceTimelineProps) {
  if (!experience || experience.length === 0) return null;

  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="mb-4 text-xl font-bold text-brand-800 dark:text-brand-200"
      >
        Experience
      </h2>
      <ol className="relative border-l-2 border-brand-200 dark:border-brand-700">
        {experience.map((entry, i) => (
          <li key={`${entry.company}-${entry.start}`} className="mb-8 ml-6">
            {/* Timeline dot */}
            <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-brand-400 bg-brand-bg dark:border-brand-500 dark:bg-brand-900" />

            <Reveal delay={i * 0.1}>
              <div>
                {/* Role + company */}
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-semibold text-brand-900 dark:text-brand-100">
                    {entry.role}
                  </h3>
                  <span className="text-brand-600 dark:text-brand-400">@ {entry.company}</span>
                </div>

                {/* Dates */}
                <time className="mb-2 block text-sm text-brand-500 dark:text-brand-400">
                  {formatDate(entry.start)} — {formatDate(entry.end)}
                </time>

                {/* Bullets */}
                <ul className="list-disc space-y-1 pl-4 text-sm text-brand-800 dark:text-brand-200">
                  {entry.bullets.map((bullet, bi) => (
                    <li key={bi}>{bullet}</li>
                  ))}
                </ul>

                {/* Tech chips — gracefully omitted if absent */}
                {entry.tech && entry.tech.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-800 dark:text-brand-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
