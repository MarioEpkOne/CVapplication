import type { ResumeData } from "./resume.types";

// ─── Czech resume ────────────────────────────────────────────────────────────

export const resumeCs: ResumeData = {
  header: {
    name: "Mario Alina",
    title: "Backend & AI Agentic Developer",
    photoSrc: "/ai-photo.jpg",
    location: "Brno, Česká republika",
    contacts: [
      {
        kind: "email",
        label: "mario.alina11@gmail.com",
        href: "mailto:mario.alina11@gmail.com",
      },
      {
        kind: "github",
        label: "github.com/MarioEpkOne",
        href: "https://github.com/MarioEpkOne",
      },
      {
        kind: "linkedin",
        label: "linkedin.com/in/mario-alina",
        href: "https://linkedin.com/in/mario-alina",
      },
    ],
  },

  summary:
    "Specializuji se na orchestraci AI agentů a vývoj backendových systémů. Na AI agentní přístupy jsem přišel nezávisle — budováním uzavřených pipeline s Claude Code, kde agenti plánují, píší kód a předávají si kontext prostřednictvím strukturovaných artefaktů. Na backend přináším solidní základ v Java/Kotlin/Spring Boot ze čtyř let komerčního vývoje softwaru.",

  experience: [
    {
      company: "vlastní projekty",
      role: "AI & Agentic Developer",
      period: "2025 — současnost",
      bullets: [
        "Vyvinul metodiku context-writing: strukturované CLAUDE.md, AGENTS.md a Implementation Plans jako kontext první třídy pro AI agenty.",
        "Postavil uzavřené agent pipeline (plánování → implementace → review → commit) s Claude Code a MCP servery.",
        "Vytvořil 6 AI nástrojů — od prompt analytiky po emailový triage plugin — demonstrující end-to-end agentic workflow.",
      ],
    },
    {
      company: "Morosystems",
      role: "Software Engineer",
      period: "2,5 roku",
      bullets: [
        "Vyvíjel backend řešení pro zákazníky z oblasti farmacie, platebních systémů a logistiky.",
        "Navrhoval a implementoval REST API rozhraní pro integraci s externími systémy.",
        "Spolupracoval v agilním týmu, účastnil se code review a přispíval k technické dokumentaci.",
      ],
      tech: ["Java", "Kotlin", "Spring Boot", "PostgreSQL", "REST API"],
    },
    {
      company: "Kentico",
      role: "Technical Support Engineer",
      period: "3 roky",
      bullets: [
        "Prováděl root-cause analýzu složitých technických problémů zákazníků a navrhoval řešení.",
        "Spolupracoval napříč týmy (vývoj, QA, product) na eskalovaných případech.",
        "Přispíval do znalostní báze — vytvářel technické články a best-practice průvodce.",
      ],
    },
  ],

  skills: [
    {
      group: "AI & agentické nástroje",
      items: ["Claude Code", "MCP servery", "orchestrace agentů", "prompt engineering", "tool use", "RAG"],
    },
    {
      group: "Backend",
      items: ["Java", "Kotlin", "Spring Boot", "REST API", "PostgreSQL", "SQL", "TypeScript", "Node.js"],
    },
    {
      group: "Cloud & CI/CD",
      items: ["Docker", "Git", "GitHub Actions", "Fly.io", "CI/CD pipelines"],
    },
    {
      group: "Proces & spolupráce",
      items: ["dekompozice procesů", "root-cause analýza", "code review", "agile/scrum", "technická dokumentace"],
    },
  ],

  education: [
    {
      school: "Střední průmyslová škola — elektrotechnika",
      credential: "Stredná škola elektrotechnická, Trnava, Slovensko",
    },
  ],

  certifications: [
    { name: "Java Developer Course", issuer: "IT v kurze" },
    { name: "Using Databases with Python", issuer: "Coursera" },
    { name: "Using Python to Access Web Data", issuer: "Coursera" },
    { name: "Introduction to Programming and Computer Science", issuer: "Composing Programs" },
  ],

  projects: [
    {
      name: "PipelineIQ",
      blurb:
        "Uzavřená agent pipeline pro vývoj softwaru — plánování, implementace, review a commit řízené AI agenty se strukturovanými artefakty jako kontextem.",
    },
    {
      name: "PromptIQ",
      blurb:
        "Prompt analytika pro Claude Code — sleduje výkon promptů, identifikuje vzory a pomáhá optimalizovat agentic workflow.",
    },
    {
      name: "AI Assistant",
      blurb:
        "Nasazený AI asistent nad Obsidian znalostní bází — odpovídá na dotazy s kontextem z osobních poznámek pomocí RAG.",
    },
    {
      name: "Email Brief IQ",
      blurb:
        "Plugin pro Claude Code umožňující emailový triage — sumarizuje doručenou poštu a navrhuje odpovědi přímo v agentic workflow.",
    },
    {
      name: "UXIQ",
      blurb:
        "Python CLI nástroj pro audity přístupnosti UI — automatizuje kontroly WCAG a generuje akční reporty.",
    },
    {
      name: "Tato CV aplikace",
      href: "https://github.com/MarioEpkOne/CVapplication",
      blurb:
        "Záměrně přeinženýrovaný interaktivní životopis + motivační dopis jako ukázka práce pro Purple LAB. Next.js, tRPC, Drizzle, agent-context artefakty jako deliverable první třídy.",
    },
  ],

  languages: [
    { name: "Slovenština", level: "rodilý mluvčí" },
    { name: "Čeština", level: "pokročilá" },
    { name: "Angličtina", level: "C1" },
    { name: "Japonština", level: "A1" },
  ],
};

// ─── English resume ───────────────────────────────────────────────────────────

export const resumeEn: ResumeData = {
  header: {
    name: "Mario Alina",
    title: "Backend Engineer & AI Agent Orchestrator",
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
        label: "github.com/MarioEpkOne",
        href: "https://github.com/MarioEpkOne",
      },
      {
        kind: "linkedin",
        label: "linkedin.com/in/mario-alina",
        href: "https://linkedin.com/in/mario-alina",
      },
    ],
  },

  summary:
    "I specialise in AI agent orchestration and backend systems development. I arrived at agentic approaches independently — by building closed-loop pipelines with Claude Code where agents plan, write code, and hand off context through structured artifacts. On the backend side, I bring four years of commercial Java/Kotlin/Spring Boot development across fintech, pharma, and logistics domains.",

  experience: [
    {
      company: "personal projects",
      role: "AI & Agentic Developer",
      period: "2025 — present",
      bullets: [
        "Developed a context-writing methodology: structured CLAUDE.md, AGENTS.md, and Implementation Plans as first-class context for AI agents.",
        "Built closed-loop agent pipelines (planning → implementation → review → commit) using Claude Code and MCP servers.",
        "Shipped 6 AI tools — from prompt analytics to an email triage plugin — demonstrating end-to-end agentic workflows.",
      ],
    },
    {
      company: "Morosystems",
      role: "Software Engineer",
      period: "2.5 years",
      bullets: [
        "Delivered backend solutions for clients in pharma, payments, and logistics on Java/Kotlin/Spring Boot.",
        "Designed and implemented REST API interfaces for third-party system integration.",
        "Collaborated in agile teams, participated in code review, and contributed to technical documentation.",
      ],
      tech: ["Java", "Kotlin", "Spring Boot", "PostgreSQL", "REST API"],
    },
    {
      company: "Kentico",
      role: "Technical Support Engineer",
      period: "3 years",
      bullets: [
        "Performed root-cause analysis on complex customer technical issues and proposed actionable fixes.",
        "Collaborated cross-functionally with development, QA, and product teams on escalated cases.",
        "Built out the knowledge base — authoring technical articles and best-practice guides.",
      ],
    },
  ],

  skills: [
    {
      group: "AI & agentic tooling",
      items: ["Claude Code", "MCP servers", "agent orchestration", "prompt engineering", "tool use", "RAG"],
    },
    {
      group: "Backend",
      items: ["Java", "Kotlin", "Spring Boot", "REST API", "PostgreSQL", "SQL", "TypeScript", "Node.js"],
    },
    {
      group: "Cloud & CI/CD",
      items: ["Docker", "Git", "GitHub Actions", "Fly.io", "CI/CD pipelines"],
    },
    {
      group: "Process & collaboration",
      items: ["process decomposition", "root-cause analysis", "code review", "agile/scrum", "technical documentation"],
    },
  ],

  education: [
    {
      school: "Secondary Technical School — Electrical Engineering",
      credential: "Stredná škola elektrotechnická, Trnava, Slovakia",
    },
  ],

  certifications: [
    { name: "Java Developer Course", issuer: "IT v kurze" },
    { name: "Using Databases with Python", issuer: "Coursera" },
    { name: "Using Python to Access Web Data", issuer: "Coursera" },
    { name: "Introduction to Programming and Computer Science", issuer: "Composing Programs" },
  ],

  projects: [
    {
      name: "PipelineIQ",
      blurb:
        "A closed-loop agent pipeline for software development — planning, implementation, review, and commit orchestrated by AI agents with structured artifacts as context.",
    },
    {
      name: "PromptIQ",
      blurb:
        "Prompt analytics for Claude Code — tracks prompt performance, identifies patterns, and helps optimise agentic workflows.",
    },
    {
      name: "AI Assistant",
      blurb:
        "A deployed AI assistant over an Obsidian knowledge base — answers queries with personal notes as context via RAG.",
    },
    {
      name: "Email Brief IQ",
      blurb:
        "A Claude Code plugin for email triage — summarises the inbox and drafts responses directly inside an agentic workflow.",
    },
    {
      name: "UXIQ",
      blurb:
        "A Python CLI for UI accessibility audits — automates WCAG checks and generates actionable reports.",
    },
    {
      name: "This CV App",
      href: "https://github.com/MarioEpkOne/CVapplication",
      blurb:
        "A deliberately over-engineered interactive resume + cover letter built as a work sample for Purple LAB. Next.js, tRPC, Drizzle, agent-context artifacts as first-class deliverables.",
    },
  ],

  languages: [
    { name: "Slovak", level: "native" },
    { name: "Czech", level: "advanced" },
    { name: "English", level: "C1" },
    { name: "Japanese", level: "A1" },
  ],
};

// ─── Locale map ───────────────────────────────────────────────────────────────

export const resumes = { cs: resumeCs, en: resumeEn } as const;
