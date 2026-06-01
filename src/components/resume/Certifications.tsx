import type { CertificationEntry } from "@/data/resume.types";

interface CertificationsProps {
  certifications: CertificationEntry[];
  heading: string;
}

export function Certifications({ certifications, heading }: CertificationsProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <section aria-labelledby="certifications-heading">
      <h2
        id="certifications-heading"
        className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
      >
        {heading}
      </h2>
      <ul className="space-y-1.5">
        {certifications.map((cert, i) => (
          <li key={i} className="text-sm text-brand-700 dark:text-brand-300">
            <span className="font-medium text-brand-900 dark:text-brand-100">{cert.name}</span>
            {cert.issuer && (
              <span className="text-brand-500 dark:text-brand-400"> — {cert.issuer}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
