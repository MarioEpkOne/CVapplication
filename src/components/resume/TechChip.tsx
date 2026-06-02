interface TechChipProps {
  label: string;
}

/**
 * Presentational tech badge used in the resume timeline. Pure presentation:
 * renders whatever label it is given (sourced from resume.ts-driven data) — no
 * content is hard-coded here. Inherits .no-print behavior from its parent.
 */
export function TechChip({ label }: TechChipProps) {
  return (
    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-800 dark:text-brand-300">
      {label}
    </span>
  );
}
