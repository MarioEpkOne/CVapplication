interface ProfileSummaryProps {
  summary: string;
  heading: string;
}

export function ProfileSummary({ summary, heading }: ProfileSummaryProps) {
  if (!summary) return null;

  return (
    <section aria-labelledby="profile-heading">
      <h2
        id="profile-heading"
        className="mb-3 text-xl font-bold text-brand-800 dark:text-brand-200"
      >
        {heading}
      </h2>
      <p className="text-sm leading-relaxed text-brand-700 dark:text-brand-300">{summary}</p>
    </section>
  );
}
