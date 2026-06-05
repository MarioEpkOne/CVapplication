import type { ResumeData } from "./resume.types";

// ─── Czech resume ────────────────────────────────────────────────────────────

export const resumeCs: ResumeData = {
  header: {
    name: "Mario Alina",
    title: "Backend & AI Agentic Developer",
    photoSrc: "/portrait.png",
    location: "Brno, Česká republika",
    contacts: [
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
    "Specializuji se na orchestraci AI agentů a vývoj backendových systémů. Na AI agentní přístupy jsem přišel nezávisle budováním uzavřených pipeline s Claude Code, kde agenti plánují, píší kód a předávají si kontext prostřednictvím strukturovaných artefaktů. Na backend přináším solidní základ v Java/Kotlin/Spring Boot ze 3 let komerčního vývoje softwaru.",

  experience: [
    {
      company: "vlastní projekty",
      role: "AI & Agentic Developer",
      period: "2025 — současnost",
      bullets: [
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
      projects: [
        {
          name: "AstraZeneca — Systém pro distribuci léčiv",
          description:
            "V devítičlenném týmu jsem modernizoval více než 10 let starý systém pro distribuci léčiv do lékáren a nemocnic po celé České republice. Dodali jsme rychlejší a intuitivnější uživatelské rozhraní, odstranili opakující se chyby původního softwaru a zajistili rychlé generování reportů a statistik. Pracoval jsem v agilním procesu založeném na pravidelných schůzkách se zainteresovanými stranami; systém byl dodán jako kompletní cloud-native produkt s úplnou dokumentací.",
          tech: [
            "React",
            "Kotlin",
            "Spring Boot",
            "jOOQ",
            "PostgreSQL",
            "Google Cloud Platform",
            "Kubernetes",
            "automatizované testování",
          ],
        },
        {
          name: "Global Payments — Platforma pro vydávání karet (Card-Issuing-as-a-Service)",
          description:
            "V týmu o 7–10 lidech jsem se podílel na vývoji moderní platformy pro vydávání a správu karet, která koncovým zákazníkům umožňuje zabudovat fyzické i digitální platební karty do vlastních produktů během šesti měsíců, a to bez bankovní licence. Spojuje tvorbu, vydávání a správu karet s integrací do interních systémů Global Payments na modulární, API-first a škálovatelné (MACH) architektuře navržené pro dlouhodobou udržovatelnost.",
          tech: ["Java", "JVM", "React", "Docker", "HashiCorp Consul"],
        },
      ],
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
        "Záměrně přeinženýrovaný interaktivní životopis + motivační dopis jako ukázka práce. Next.js, tRPC, Drizzle, agent-context artefakty jako deliverable první třídy. Součástí je i rozpracovaná živá ukázka „Zeptej se agenta“ (serverless agent na AWS Lambda) — zatím experimentální.",
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
    photoSrc: "/portrait.png",
    location: "Brno, Czech Republic",
    contacts: [
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
    "I specialise in AI agent orchestration and backend systems development. I arrived at agentic approaches independently — by building closed-loop pipelines with Claude Code where agents plan, write code, and hand off context through structured artifacts. On the backend side, I bring three years of commercial Java/Kotlin/Spring Boot development across fintech, pharma, and logistics domains.",

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
      projects: [
        {
          name: "AstraZeneca — Pharmaceutical Distribution Management System",
          description:
            "Modernized a 10+ year-old system for distributing medicines to pharmacies and hospitals across the Czech Republic, working in a team of 9. Delivered a faster, more intuitive UI and eliminated the recurring errors of the legacy software, with quick reporting and statistics generation. Worked in an agile process based on regular stakeholder sessions; the system was delivered as a complete, cloud-native product with full documentation.",
          tech: [
            "React",
            "Kotlin",
            "Spring Boot",
            "jOOQ",
            "PostgreSQL",
            "Google Cloud Platform",
            "Kubernetes",
            "automated testing",
          ],
        },
        {
          name: "Global Payments — Card-Issuing-as-a-Service Platform",
          description:
            "Built a modern card-issuing and management platform with a team of 7–10, enabling end customers to embed physical and digital payment cards into their own products within six months, without a banking license. Combined card creation, issuing, and management with integration into Global Payments' internal systems, using a modular, API-first, scalable (MACH) architecture built for long-term maintainability.",
          tech: ["Java", "JVM", "React", "Docker", "HashiCorp Consul"],
        },
      ],
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
        "A deliberately over-engineered interactive resume + cover letter built as a work sample. Next.js, tRPC, Drizzle, agent-context artifacts as first-class deliverables. Includes a work-in-progress live \"Ask the Agent\" demo (a serverless agent on AWS Lambda) — still experimental.",
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
