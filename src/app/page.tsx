import type { Metadata } from "next";
import { resume } from "@/data/resume";
import { ResumeHeader } from "@/components/resume/ResumeHeader";
import { ExperienceTimeline } from "@/components/resume/ExperienceTimeline";
import { SkillChips } from "@/components/resume/SkillChips";
import { EducationProjects } from "@/components/resume/EducationProjects";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Mario — Interactive Resume",
  description: `${resume.header.name} — ${resume.header.title}. Interactive CV for Purple LAB.`,
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <ResumeHeader header={resume.header} />

      <hr className="border-brand-200 dark:border-brand-700" />

      <ExperienceTimeline experience={resume.experience} />

      <SkillChips skills={resume.skills} />

      <EducationProjects education={resume.education} projects={resume.projects} />

      {/* Languages — gracefully omit if not provided */}
      {resume.languages && resume.languages.length > 0 && (
        <section aria-labelledby="languages-heading">
          <h2
            id="languages-heading"
            className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
          >
            Languages
          </h2>
          <ul className="flex flex-wrap gap-4">
            {resume.languages.map((lang) => (
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
