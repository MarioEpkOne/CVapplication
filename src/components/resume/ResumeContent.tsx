"use client";

import { useLocale } from "@/lib/locale";
import { resumes } from "@/data/resume";
import { labels } from "@/lib/labels";
import { ResumeHeader } from "@/components/resume/ResumeHeader";
import { ProfileSummary } from "@/components/resume/ProfileSummary";
import { ExperienceTimeline } from "@/components/resume/ExperienceTimeline";
import { SkillChips } from "@/components/resume/SkillChips";
import { EducationProjects } from "@/components/resume/EducationProjects";
import { Certifications } from "@/components/resume/Certifications";
import { ContactForm } from "@/components/ContactForm";

export function ResumeContent() {
  const { locale } = useLocale();
  const data = resumes[locale];
  const l = labels[locale];

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <ResumeHeader header={data.header} getInTouchLabel={l.getInTouch} />

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

      {/* Contact form — section anchor reachable from the Resume tab */}
      <section id="contact" aria-labelledby="contact-heading">
        <ContactForm />
      </section>
    </div>
  );
}
