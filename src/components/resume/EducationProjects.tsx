import type { EducationEntry, ProjectEntry } from "@/data/resume.types";
import { ExternalLink } from "lucide-react";

interface EducationProjectsProps {
  education: EducationEntry[];
  projects?: ProjectEntry[];
  educationHeading: string;
  projectsHeading: string;
}

export function EducationProjects({
  education,
  projects,
  educationHeading,
  projectsHeading,
}: EducationProjectsProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {/* Projects — gracefully omit if not provided */}
      {projects && projects.length > 0 && (
        <section aria-labelledby="projects-heading">
          <h2
            id="projects-heading"
            className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
          >
            {projectsHeading}
          </h2>
          <ul className="space-y-3">
            {projects.map((project, i) => (
              <li key={i}>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-brand-900 dark:text-brand-100">{project.name}</p>
                  {project.href && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="-m-2 inline-flex h-9 w-9 items-center justify-center p-2 text-brand-500 hover:text-brand-700 dark:text-brand-400"
                      aria-label={`${project.name} — external link`}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <p className="text-sm text-brand-600 dark:text-brand-400">{project.blurb}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Education */}
      <section aria-labelledby="education-heading">
        <h2
          id="education-heading"
          className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
        >
          {educationHeading}
        </h2>
        {education.length === 0 ? null : (
          <ul className="space-y-3">
            {education.map((entry, i) => (
              <li key={i}>
                <p className="font-semibold text-brand-900 dark:text-brand-100">{entry.school}</p>
                <p className="text-sm text-brand-600 dark:text-brand-400">{entry.credential}</p>
                {(entry.start ?? entry.end) && (
                  <p className="text-xs text-brand-500 dark:text-brand-500">
                    {[entry.start, entry.end].filter(Boolean).join(" — ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
