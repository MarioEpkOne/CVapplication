import type { ResumeData } from "./resume.types";

// ─── Placeholder data — Mario: replace bullets, tech, and copy with real content ───

export const resume: ResumeData = {
  header: {
    name: "Mario Alina",
    title: "Senior Software Engineer & AI Agent Orchestrator",
    photoSrc: "/photo-placeholder.svg",
    location: "Brno, Czech Republic",
    contacts: [
      {
        kind: "email",
        label: "mario.alina11@gmail.com",
        href: "mailto:mario.alina11@gmail.com",
      },
      {
        kind: "github",
        label: "github.com/marioalina",
        href: "https://github.com/marioalina",
      },
      {
        kind: "linkedin",
        label: "linkedin.com/in/marioalina",
        href: "https://linkedin.com/in/marioalina",
      },
    ],
  },

  experience: [
    {
      company: "Acme FinTech s.r.o.",
      role: "Lead Engineer / AI Orchestration Lead",
      start: "2023-03",
      end: "present",
      bullets: [
        "Architected and deployed a multi-agent pipeline (Claude Code + CodeRabbit + Devin) that reduced feature cycle time by 40%.",
        "Designed review-gate process ensuring AI-generated PRs pass human oversight before merge — zero regressions shipped.",
        "Built a TypeScript / Next.js / tRPC internal dashboard tracking agent utilization and code quality metrics.",
        "Led migration from monolith to event-driven microservices on AWS; reduced p99 latency from 800 ms to 120 ms.",
      ],
      tech: ["TypeScript", "Node.js", "AWS", "tRPC", "Next.js", "Claude Code", "AI tooling"],
    },
    {
      company: "DataPulse Labs",
      role: "Full-Stack Engineer",
      start: "2021-06",
      end: "2023-02",
      bullets: [
        "Delivered real-time analytics dashboard processing 50M events/day using React, WebSockets, and PostgreSQL.",
        "Introduced contract-first API design (OpenAPI → Zod) cutting integration bugs by 60%.",
        "Mentored 3 junior engineers; established code-review standards still used by the team.",
      ],
      tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "WebSockets"],
    },
    {
      company: "StartupXYZ",
      role: "Software Engineer",
      start: "2019-09",
      end: "2021-05",
      bullets: [
        "Built greenfield SaaS product (TypeScript / Express / React) from idea to 1,000 paying customers.",
        "Implemented Stripe billing integration and automated invoicing pipeline.",
        "Set up CI/CD pipeline (GitHub Actions → Docker → AWS ECS) reducing deploy time from 2 hours to 8 minutes.",
      ],
      tech: ["TypeScript", "React", "Express", "AWS", "Docker", "Stripe"],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "SQL", "Bash"],
    },
    {
      group: "Frontend",
      items: ["React", "Next.js", "TailwindCSS", "Framer Motion", "tRPC"],
    },
    {
      group: "Backend",
      items: ["Node.js", "Express", "Drizzle ORM", "Zod", "REST", "GraphQL"],
    },
    {
      group: "Cloud/AWS",
      items: ["AWS (ECS, Lambda, S3, RDS)", "Fly.io", "Docker", "GitHub Actions", "Terraform"],
    },
    {
      group: "AI tooling",
      items: ["Claude Code", "Cursor", "CodeRabbit", "Devin", "OpenAI API", "Anthropic API"],
    },
  ],

  education: [
    {
      school: "Brno University of Technology (VUT)",
      credential: "M.Sc. in Computer Science",
      start: "2017-09",
      end: "2019-06",
    },
    {
      school: "Brno University of Technology (VUT)",
      credential: "B.Sc. in Information Technology",
      start: "2014-09",
      end: "2017-06",
    },
  ],

  projects: [
    {
      name: "This CV App",
      href: "https://github.com/marioalina/CVapplication",
      blurb:
        "Deliberately over-engineered interactive resume + cover letter built as a work sample for Purple LAB. Next.js, tRPC, Drizzle, Fly.io, agent-context artifacts as first-class deliverables.",
    },
    {
      name: "Agent Orchestrator (WIP)",
      blurb:
        "Mini-game visualizing AI agent strengths — CodeRabbit, Devin, Claude Code, Cursor. Deferred to the next spec iteration.",
    },
  ],

  languages: [
    { name: "Czech", level: "Native" },
    { name: "English", level: "Professional proficiency" },
  ],
};
