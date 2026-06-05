"use client";

import { useLocale } from "@/lib/locale";
import { resumes } from "@/data/resume";
import { labels } from "@/lib/labels";
import { Hero } from "@/components/resume/Hero";
import { ResumeHeader } from "@/components/resume/ResumeHeader";
import { ProfileSummary } from "@/components/resume/ProfileSummary";
import { ExperienceTimeline } from "@/components/resume/ExperienceTimeline";
import { SkillChips } from "@/components/resume/SkillChips";
import { EducationProjects } from "@/components/resume/EducationProjects";
import { Certifications } from "@/components/resume/Certifications";

export function ResumeContent() {
  const { locale } = useLocale();
  const data = resumes[locale];
  const l = labels[locale];

  // Short supporting line for the hero — first sentence of the profile summary.
  const tagline = data.summary.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? data.summary;

  return (
    <>
      {/* Screen: full-bleed animated hero (hidden in print) */}
      <div className="print:hidden">
        <Hero
          header={data.header}
          getInTouchLabel={l.getInTouch}
          tagline={tagline}
          available={l.available}
          viewResume={l.viewResume}
          downloadPdf={l.downloadPdf}
          connect={l.connect}
          openToRoles={l.openToRoles}
        />
      </div>

      {/* Print: clean name/title/contacts masthead (hidden on screen) */}
      <div className="hidden print:block">
        <ResumeHeader header={data.header} getInTouchLabel={l.getInTouch} printMode />
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <ProfileSummary summary={data.summary} heading={l.profile} />

        <hr className="border-brand-200 dark:border-brand-700" />

        <ExperienceTimeline experience={data.experience} heading={l.experience} />

        <SkillChips skills={data.skills} heading={l.skills} />

        <EducationProjects
          education={data.education}
          projects={data.projects}
          educationHeading={l.education}
          projectsHeading={l.projects}
        />

        <Certifications certifications={data.certifications} heading={l.certifications} />

        {/* Languages — gracefully omit if not provided */}
        {data.languages && data.languages.length > 0 && (
          <section aria-labelledby="languages-heading">
            <h2
              id="languages-heading"
              className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
            >
              {l.languages}
            </h2>
            <ul className="flex flex-wrap gap-4">
              {data.languages.map((lang) => (
                <li key={lang.name} className="text-sm text-brand-700 dark:text-brand-300">
                  <span className="font-medium">{lang.name}</span> — {lang.level}
                </li>
              ))}
            </ul>
          </section>
        )}

        <hr className="border-brand-200 dark:border-brand-700" />

        {/* Get in touch — social links only (contact form removed; no email exposed) */}
        <section id="contact" aria-labelledby="contact-heading">
          <h2
            id="contact-heading"
            className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
          >
            {l.getInTouch}
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {data.header.contacts
              .filter((c) => c.kind !== "email")
              .map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </>
  );
}
