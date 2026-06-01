import type { SkillGroup } from "@/data/resume.types";
import { cn } from "@/lib/utils";

interface SkillChipsProps {
  skills: SkillGroup[];
  heading: string;
}

// Items that warrant emphasis styling
const EMPHASIS_KEYWORDS = [
  "typescript",
  "ts",
  "node",
  "node.js",
  "ai",
  "claude",
  "java",
  "kotlin",
  "spring",
  "mcp",
  "rag",
  "fly.io",
];

function isEmphasized(item: string): boolean {
  const lower = item.toLowerCase();
  return EMPHASIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export function SkillChips({ skills, heading }: SkillChipsProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <section aria-labelledby="skills-heading">
      <h2
        id="skills-heading"
        className="mb-4 text-xl font-bold text-brand-800 dark:text-brand-200"
      >
        {heading}
      </h2>
      <div className="space-y-3">
        {skills.map((group) => (
          <div key={group.group}>
            <h3 className="mb-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              {group.group}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                    isEmphasized(item)
                      ? "bg-brand-600 text-white ring-1 ring-brand-500"
                      : "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300"
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
