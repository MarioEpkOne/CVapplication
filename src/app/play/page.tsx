import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play — Agent Orchestrator",
  description: "Coming soon: an interactive game about AI agent strengths and orchestration.",
};

export default function PlayPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 text-5xl" role="img" aria-label="Coming soon">
        🎮
      </div>

      <h1 className="mb-3 text-3xl font-bold text-brand-900 dark:text-brand-100">
        Agent Orchestrator
      </h1>

      <p className="mb-2 text-base text-brand-600 dark:text-brand-400">
        Coming soon.
      </p>

      <p className="max-w-sm text-sm text-brand-500 dark:text-brand-500">
        A mini-game visualizing the strengths and quirks of the agents I work with — CodeRabbit,
        Devin, Claude Code, and Cursor. Deliberately deferred to a future spec so the resume ships
        complete and polished first.
      </p>

      <p className="mt-8 text-xs text-brand-400 italic dark:text-brand-600">
        The best agents know when to scope-creep and when to stay in their lane.
      </p>
    </div>
  );
}
