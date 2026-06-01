// Cover letter data — config-driven so sections reorder/add/remove freely.
// The structure (id, heading, body[]) is fixed; locale map selects the right version.

export interface LetterSection {
  id: "hook" | "orchestration" | "why-purple" | "why-me" | string;
  eyebrow?: string;
  heading: string;
  body: string[]; // paragraphs
}

// ─── Czech cover letter ───────────────────────────────────────────────────────

export const letterSectionsCz: LetterSection[] = [
  {
    id: "hook",
    eyebrow: "Teze",
    heading: "Médium je sdělení.",
    body: [
      "Nečtete jen můj motivační dopis — prohlížíte si ho. Tento web je ukázka práce: záměrně přeinženýrovaná Next.js aplikace, nasazená na reálném CI/CD pipeline, dokumentovaná pro AI agenty jako deliverable první třídy. Kód argumentuje lépe než jakákoli próza.",
      "K AI agentním přístupům jsem přišel nezávisle — ne proto, že to byl trend, ale proto, že jsem potřeboval vyřešit konkrétní problémy a agentní pipeline byla ta správná odpověď.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "Práce",
    heading: "Orchestrace AI agentů je disciplína, ne zkratka.",
    body: [
      "Strávil jsem poslední rok budováním uzavřených pipeline, kde agenti plánují, implementují, revidují a commitují kód — s jasnou dekompozicí úkolů, review gates a kontextovými artefakty (CLAUDE.md, AGENTS.md, Implementation Plans) jako infrastrukturou.",
      "Vím, kdy agentovi říct 'pokračuj' a kdy 'vrať se zpět'. Agenti píší; já zasílám to, co stojí za zaslání.",
    ],
  },
  {
    id: "why-purple",
    eyebrow: "Proč Purple LAB",
    heading: "Technická analýza předchází psaní kódu.",
    body: [
      "Přistupuji k problémům se stejnou rigorozitou, jakou vidím v přístupu Purple LAB: nejdřív porozumět systému, pak navrhovat řešení. Dokumentuji architektonická rozhodnutí (ADR), definuji scope před implementací a nezačínám psát kód, dokud není jasný záměr.",
      "Vy jste Next.js + TypeScript + tRPC shop. Tato aplikace také. To nebyla náhoda.",
    ],
  },
  {
    id: "why-me",
    eyebrow: "Proč já",
    heading: "Důkaz před slibem.",
    body: [
      "Toto repo má CLAUDE.md, AGENTS.md a čtyři ADR. To není ozdoba životopisu — takto skutečně pracuji. Agent context jako infrastruktura je disciplína, kterou tato role oceňuje, a já z ní udělal základ této přihlášky.",
      "Jsem z Brna, takže jsem ve vaší časové zóně a mohu být ve vaší kanceláři. A ano — aplikace běží na Fly.io, ne na AWS. ADR vysvětluje proč. Myslím, že to shledáte upřímným.",
    ],
  },
];

// ─── English cover letter ─────────────────────────────────────────────────────

export const letterSectionsEn: LetterSection[] = [
  {
    id: "hook",
    eyebrow: "The thesis",
    heading: "The medium is the message.",
    body: [
      "You're not just reading my cover letter — you're looking at it. This site is a work sample: a deliberately over-engineered Next.js app, shipped on a real CI/CD pipeline, documented for AI agents as a first-class deliverable. The code argues the point better than any prose could.",
      "I arrived at agentic approaches independently — not because it was a trend, but because I needed to solve concrete problems and agent pipelines were the right answer.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "The work",
    heading: "Orchestrating AI agents is a discipline, not a shortcut.",
    body: [
      "I've spent the past year building closed-loop pipelines where agents plan, implement, review, and commit code — with clear task decomposition, review gates, and contextual artifacts (CLAUDE.md, AGENTS.md, Implementation Plans) as infrastructure.",
      "I know when to tell an agent to continue and when to tell it to revert. The agent writes; I ship what's worth shipping.",
    ],
  },
  {
    id: "why-purple",
    eyebrow: "Why Purple LAB",
    heading: "Technical analysis precedes writing code.",
    body: [
      "I approach problems with the same rigour I see in Purple LAB's way of working: understand the system first, then design solutions. I document architectural decisions (ADRs), define scope before implementation, and don't start writing code until the intent is clear.",
      "You're a Next.js + TypeScript + tRPC shop. So is this app. That wasn't an accident.",
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

// ─── Locale map ───────────────────────────────────────────────────────────────

export const letterSections = { cs: letterSectionsCz, en: letterSectionsEn } as const;
