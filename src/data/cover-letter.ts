// Cover letter data — config-driven so sections reorder/add/remove freely.
// Mario: replace the placeholder body copy with your actual words.
// The structure (id, heading, body[]) is fixed; everything else is yours to own.

export interface LetterSection {
  id: "hook" | "orchestration" | "why-purple" | "why-me" | string;
  eyebrow?: string;
  heading: string;
  body: string[]; // paragraphs — Mario writes these
}

export const letterSections: LetterSection[] = [
  {
    id: "hook",
    eyebrow: "The thesis",
    heading: "The medium is the message.",
    body: [
      "You're not just reading my cover letter — you're looking at it. This site is a work sample: a deliberately over-engineered Next.js app, shipped on a real CI/CD pipeline, documented for AI agents as a first-class deliverable. The code argues the point better than any prose could.",
      "I'm applying for a role centered on orchestrating and reviewing AI coding agents. So I built my application with them.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "The work",
    heading: "Orchestrating AI agents is a discipline, not a shortcut.",
    body: [
      "I've spent the past year building the review layer that makes AI agents useful in production: clear task decomposition, review gates, the judgment to know when to re-prompt and when to revert. The agent writes; I ship what's worth shipping.",
      "The tools I rely on — Claude Code for complex refactors, CodeRabbit on every PR, Cursor for in-editor speed — each have a distinct strength. Knowing which to reach for, and when to override them, is the actual skill.",
    ],
  },
  {
    id: "why-purple",
    eyebrow: "Why Purple LAB",
    heading: "A FinTech scale that changes what 'careful' means.",
    body: [
      "Purple processes transactions that matter. That's not a constraint on moving fast — it's the thing that makes moving fast interesting. Getting agents to ship reliable FinTech code requires the kind of review discipline I've already had to build.",
      "You're also a Next.js + TypeScript + tRPC shop. So is this app. That wasn't an accident.",
    ],
  },
  {
    id: "why-me",
    eyebrow: "Why me",
    heading: "Proof over promise.",
    body: [
      "This repo has a CLAUDE.md, an AGENTS.md, and four ADRs. That's not resume decoration — that's how I actually work. Agent context as infrastructure is the discipline the role values, and I've made it the foundation of this application.",
      "I'm based in Brno, which means I'm in your timezone and can be in your office. And yes — the app runs on Fly.io, not AWS. The ADR explains why. I think you'll find it honest.",
    ],
  },
];
