"use client";

import { Reveal } from "@/components/Reveal";
import { TechChip } from "@/components/resume/TechChip";
import type { ExperienceEntry } from "@/data/resume.types";

interface ExperienceTimelineProps {
  experience: ExperienceEntry[];
  heading: string;
}

export function ExperienceTimeline({ experience, heading }: ExperienceTimelineProps) {
  if (!experience || experience.length === 0) return null;

  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="mb-4 text-xl font-bold text-brand-800 dark:text-brand-200"
      >
        {heading}
      </h2>
      <ol className="relative border-l-2 border-brand-200 dark:border-brand-700">
        {experience.map((entry, i) => (
          <li key={`${entry.company}-${i}`} className="mb-8 ml-4 sm:ml-6">
            {/* Timeline dot */}
            <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-brand-400 bg-brand-bg dark:border-brand-500 dark:bg-brand-900" />

            <Reveal delay={i * 0.1}>
              <div>
                {/* Role + company */}
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-semibold text-brand-900 dark:text-brand-100">{entry.role}</h3>
                  <span className="text-brand-600 dark:text-brand-400">@ {entry.company}</span>
                </div>

                {/* Period — conditionally rendered */}
                {entry.period && (
                  <time className="mb-2 block text-sm text-brand-500 dark:text-brand-400">
                    {entry.period}
                  </time>
                )}

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
                      <TechChip key={t} label={t} />
                    ))}
                  </div>
                )}

                {/* Nested commercial/client projects — gracefully omitted if absent */}
                {entry.projects && entry.projects.length > 0 && (
                  <div className="mt-4 space-y-4 border-l-2 border-brand-100 pl-4 dark:border-brand-800">
                    {entry.projects.map((project, pi) => (
                      <div key={`${project.name}-${pi}`}>
                        <h4 className="text-sm font-semibold text-brand-800 dark:text-brand-200">
                          {project.name}
                        </h4>
                        <p className="mt-1 text-sm text-brand-800 dark:text-brand-200">
                          {project.description}
                        </p>
                        {project.tech.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {project.tech.map((t) => (
                              <TechChip key={t} label={t} />
                            ))}
                          </div>
                        )}
                      </div>
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
