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
    "Backendový vývojář se třemi lety komerční praxe v Javě, Kotlinu a Spring Bootu pro klienty z farmacie, fintechu a logistiky. Programuji i v Pythonu. Poslední rok se naplno věnuji agentnímu vývoji: napojuji AI kódovací agenty do opakovatelných pipeline, které řeší plánování, implementaci a review nad strukturovaným kontextem projektu, místo nahodilého promptování.",

  experience: [
    {
      company: "vlastní projekty",
      role: "AI & Agentic Developer",
      period: "2025 - současnost",
      bullets: [
        "Vypracoval jsem postup, jak agenty řídit přes kontext: strukturované projektové soubory a sepsané implementační plány, které si agent přečte dřív, než sáhne na kód, takže jeho výstup drží v realitě konkrétního projektu.",
        "Postavil jsem agentní pipeline, která provede změnu od plánu přes implementaci a review až po commit; koordinaci zajišťují MCP servery.",
        "Vydal jsem šest menších AI nástrojů, od prompt analytiky po plugin na třídění e-mailů; každý pokrývá jiný kus agentního workflow.",
      ],
    },
    {
      company: "Morosystems",
      role: "Software Engineer",
      period: "2,5 roku",
      bullets: [
        "Vyvíjel a udržoval jsem backendové služby v Javě, Kotlinu a Spring Bootu pro klienty z farmacie, plateb a logistiky.",
        "Navrhoval jsem REST API pro propojení s externími systémy.",
        "Dělal jsem code review, psal technickou dokumentaci a fungoval v běžném provozu agilního týmu.",
      ],
      tech: ["Java", "Kotlin", "Spring Boot", "PostgreSQL", "REST API"],
      projects: [
        {
          name: "AstraZeneca - Systém pro distribuci léčiv",
          description:
            "V devítičlenném týmu jsem pomáhal přepsat víc než deset let starý systém pro distribuci léčiv do lékáren a nemocnic po celé ČR. Legacy aplikaci jsme nahradili cloud-native řešením, které se zbavilo jejích letitých chyb a zrychlilo generování reportů a statistik. Šlo o běžný agilní proces s pravidelnými schůzkami se zainteresovanými stranami.",
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
          name: "Global Payments - Platforma pro vydávání karet (Card-Issuing-as-a-Service)",
          description:
            "V týmu o sedmi až deseti lidech jsem pracoval na platformě pro vydávání karet, která firmě umožní nabízet vlastní fyzické i digitální platební karty bez bankovní licence. Platforma propojuje tvorbu a správu karet s interními systémy Global Payments a díky API-first přístupu zákazníkům zkracuje cestu na trh z let na měsíce.",
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
        "Přispíval do znalostní báze - vytvářel technické články a best-practice průvodce.",
      ],
    },
  ],

  skills: [
    {
      group: "AI & agentické nástroje",
      items: [
        "Claude Code",
        "MCP servery",
        "orchestrace agentů",
        "prompt engineering",
        "tool use",
        "RAG",
      ],
    },
    {
      group: "Backend",
      items: [
        "Java",
        "Kotlin",
        "Spring Boot",
        "REST API",
        "PostgreSQL",
        "SQL",
        "TypeScript",
        "Node.js",
      ],
    },
    {
      group: "Cloud & CI/CD",
      items: ["Docker", "Git", "GitHub Actions", "Fly.io", "CI/CD pipelines"],
    },
    {
      group: "Proces & spolupráce",
      items: [
        "dekompozice procesů",
        "root-cause analýza",
        "code review",
        "agile/scrum",
        "technická dokumentace",
      ],
    },
  ],

  education: [
    {
      school: "Střední průmyslová škola - elektrotechnika",
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
        "Uzavřená agent pipeline pro vývoj softwaru - plánování, implementace, review a commit řízené AI agenty se strukturovanými artefakty jako kontextem.",
    },
    {
      name: "PromptIQ",
      blurb:
        "Prompt analytika pro Claude Code - sleduje výkon promptů, identifikuje vzory a pomáhá optimalizovat agentic workflow.",
    },
    {
      name: "AI Assistant",
      blurb:
        "Nasazený AI asistent nad Obsidian znalostní bází - odpovídá na dotazy s kontextem z osobních poznámek pomocí RAG.",
    },
    {
      name: "Email Brief IQ",
      blurb:
        "Plugin pro Claude Code umožňující emailový triage - sumarizuje doručenou poštu a navrhuje odpovědi přímo v agentic workflow.",
    },
    {
      name: "UXIQ",
      blurb:
        "Python CLI nástroj pro audity přístupnosti UI - automatizuje kontroly WCAG a generuje akční reporty.",
    },
    {
      name: "Tato CV aplikace",
      href: "https://github.com/MarioEpkOne/CVapplication",
      blurb:
        "Záměrně přeinženýrovaný interaktivní životopis + motivační dopis jako ukázka práce. Next.js, tRPC, Drizzle, agent-context artefakty jako deliverable první třídy. Součástí je i rozpracovaná živá ukázka „Zeptej se agenta“ (serverless agent na AWS Lambda) - zatím experimentální.",
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
    "Backend engineer with three years of commercial Java, Kotlin, and Spring Boot across pharma, fintech, and logistics clients. I also build in Python. Over the past year I've focused on agentic development: wiring AI coding agents into repeatable pipelines that plan, implement, and review changes against structured project context, instead of one-off prompting.",

  experience: [
    {
      company: "personal projects",
      role: "AI & Agentic Developer",
      period: "2025 - present",
      bullets: [
        "Worked out a context-first way of driving AI coding agents: structured project-context files and written implementation plans the agent reads before it touches code, so its output stays anchored to the real codebase.",
        "Built agent pipelines that carry a change from planning through implementation, review, and commit, coordinated over MCP servers.",
        "Shipped six small AI tools, from prompt analytics to an email-triage plugin, each one a different slice of an agent workflow.",
      ],
    },
    {
      company: "Morosystems",
      role: "Software Engineer",
      period: "2.5 years",
      bullets: [
        "Built and maintained backend services in Java, Kotlin, and Spring Boot for clients in pharma, payments, and logistics.",
        "Designed REST APIs for integrating with third-party systems.",
        "Reviewed code, wrote technical documentation, and worked day-to-day in an agile team.",
      ],
      tech: ["Java", "Kotlin", "Spring Boot", "PostgreSQL", "REST API"],
      projects: [
        {
          name: "AstraZeneca - Pharmaceutical Distribution Management System",
          description:
            "Helped rebuild a 10+ year-old system that distributes medicines to pharmacies and hospitals across the Czech Republic, in a team of nine. We replaced the legacy app with a cloud-native rewrite that cleared its long-standing bugs and made reports and statistics quick to pull. It ran as a normal agile process with regular stakeholder reviews.",
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
          name: "Global Payments - Card-Issuing-as-a-Service Platform",
          description:
            "Worked in a team of seven to ten on a card-issuing platform that lets a company offer its own physical and digital payment cards without holding a banking license. It connects card creation and management to Global Payments' internal systems, and is built API-first so customers can ship in months rather than years.",
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
        "Built out the knowledge base - authoring technical articles and best-practice guides.",
      ],
    },
  ],

  skills: [
    {
      group: "AI & agentic tooling",
      items: [
        "Claude Code",
        "MCP servers",
        "agent orchestration",
        "prompt engineering",
        "tool use",
        "RAG",
      ],
    },
    {
      group: "Backend",
      items: [
        "Java",
        "Kotlin",
        "Spring Boot",
        "REST API",
        "PostgreSQL",
        "SQL",
        "TypeScript",
        "Node.js",
      ],
    },
    {
      group: "Cloud & CI/CD",
      items: ["Docker", "Git", "GitHub Actions", "Fly.io", "CI/CD pipelines"],
    },
    {
      group: "Process & collaboration",
      items: [
        "process decomposition",
        "root-cause analysis",
        "code review",
        "agile/scrum",
        "technical documentation",
      ],
    },
  ],

  education: [
    {
      school: "Secondary Technical School - Electrical Engineering",
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
        "A closed-loop agent pipeline for software development - planning, implementation, review, and commit orchestrated by AI agents with structured artifacts as context.",
    },
    {
      name: "PromptIQ",
      blurb:
        "Prompt analytics for Claude Code - tracks prompt performance, identifies patterns, and helps optimise agentic workflows.",
    },
    {
      name: "AI Assistant",
      blurb:
        "A deployed AI assistant over an Obsidian knowledge base - answers queries with personal notes as context via RAG.",
    },
    {
      name: "Email Brief IQ",
      blurb:
        "A Claude Code plugin for email triage - summarises the inbox and drafts responses directly inside an agentic workflow.",
    },
    {
      name: "UXIQ",
      blurb:
        "A Python CLI for UI accessibility audits - automates WCAG checks and generates actionable reports.",
    },
    {
      name: "This CV App",
      href: "https://github.com/MarioEpkOne/CVapplication",
      blurb:
        'A deliberately over-engineered interactive resume + cover letter built as a work sample. Next.js, tRPC, Drizzle, agent-context artifacts as first-class deliverables. Includes a work-in-progress live "Ask the Agent" demo (a serverless agent on AWS Lambda) - still experimental.',
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
