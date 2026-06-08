// Cover letter data - config-driven so sections reorder/add/remove freely.
// The structure (id, heading, body[]) is fixed; locale map selects the right version.
 
export interface LetterSection {
  id: "hook" | "orchestration" | "why-here" | "why-me" | string;
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
      "Nečtete jen můj motivační dopis, prohlížíte si ho. Tahle stránka je ukázka práce - Next.js aplikace nasazená přes reálné CI/CD a dokumentovaná pro AI agenty stejně pečlivě jako pro lidi. Pokud chcete vidět, jak pracuju, kód mluví líp než próza - projekty mám veřejně na GitHubu. Na záložce „Zeptej se agenta” si můžete vyzkoušet i rozpracovanou živou ukázku agenta - je zatím experimentální.",
      "Jsem backendový vývojář. Posledních pár let stavím systémy na JVM - Java, Kotlin, Spring Boot, PostgreSQL - pro mezinárodní klienty. Vedle toho jsem se dostal k agentnímu vývoji a od té doby kolem něj stavím vlastní nástroje. Nešel jsem po trendu, jen jsem řešil konkrétní problémy a agentní pipeline na ně byla nejlepší odpověď.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "Práce",
    heading: "Orchestrace agentů je nové řemeslo.",
    body: [
      "Stavím uzavřené pipeline, kde agent dostane jasně ohraničený úkol, naimplementuje ho a já pak procházím výsledek. Kolem toho jsou review gates a kontextové artefakty - spec, implementační plány, pravidla.",
      "Nejvíc času ale trávím budováním toho kontextu. Čím líp ho připravím, tím větší kus práce můžu předat a tím míň musím zasahovat sám. Když agent nevykoná úkol podle představ, většinou jen neměl správný kontext nebo prompt.",
      "Nejdřív si postavím high-level plán - co vlastně chci postavit a proč. Pak v něm hledám slabá místa a soustředím se na zásadní rozhodnutí, většinou kolem bezpečnosti, konzistence dat, error handlingu nebo cloudových nákladů. Až z toho potom vznikají konkrétní úkoly, které dostane agent.",
      "Projekt PipelineIQ je veřejně dostupný (github.com/MarioEpkOne/PipelineIQ) - closed-loop pipeline (spec → plán → implementace → audit → fix → merge), kterou neřídím sám, ale tým sub-agentů, s routováním různých modelů na různé fáze a rozpočtem na náklady. A osobní AI asistent, který si sám stahuje poznámky z meetingů, normalizuje je do znalostní báze a odpovídá nad nimi s citacemi zdrojů - běží v produkci.",
    ],
  },
  {
    id: "why-here",
    eyebrow: "Proč tahle práce",
    heading: "Technická analýza předchází psaní kódu.",
    body: [
      "K problémům přistupuju s rigorózitou. Nejdřív porozumět systému, pak navrhovat řešení. Tohle mám z backendu, kde ownership nad větší featurou znamená rozumět tomu, co děláte, dřív než to napíšete. A z předchozích let v technické podpoře, kde jsem denně tracoval cizí bugy až do kódu.",
      "Hledám tým, kde technická analýza předchází kódování, protože sám to dělám stejně.",
    ],
  },
  {
    id: "why-me",
    eyebrow: "Proč já",
    heading: "Důkaz před slibem.",
    body: [
      "Za sebou mám 2,5 roku backendu v Javě a Kotlinu - Spring Boot, PostgreSQL, produkční systémy pro mezinárodní klienty z farmacie, plateb a logistiky. Tam jsem se naučil, co obnáší ownership nad větší featurou: rozumět doméně dřív než kódu, hlídat konzistenci dat a error handling, dodat něco, na čem reálně záleží. Tenhle základ je to, o co se opírám i u všeho ostatního, co stavím.",
      "A stavím hodně. PipelineIQ, AI asistent nad znalostní bází, další nástroje kolem agentního vývoje - všechno je veřejně na GitHubu, ne na slidu. Nemluvím o tom, co bych uměl. Ukazuju, co už běží.",
      "Na konkrétní jazyk přitom už tolik nehledím. Backendová hlava se přenese, ať jde o Javu, Python nebo cokoli dalšího - dostat se rychle na úroveň v tom, s čím se zrovna pracuje, beru jako samozřejmost.",
      "Sídlím v Brně, takže jsem ve vašem časovém pásmu a klidně i ve vaší kanceláři. Takhle si představuju budoucnost vývoje a chci ji dělat s lidmi, co to vidí stejně.",
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
      "You're not just reading my cover letter, you're looking at it. This site is a work sample - a Next.js app shipped on a real CI/CD pipeline and documented for AI agents as carefully as for people. If you want to see how I work, code speaks louder than prose - my projects are public on GitHub. On the \"Ask the Agent\" tab you can try a work-in-progress live agent demo - still experimental.",
      "I'm a backend developer. For the last few years I've been building systems on the JVM - Java, Kotlin, Spring Boot, PostgreSQL - for international clients. Alongside that I got into agentic development, and I've been building my own tools around it ever since. I wasn't chasing a trend, I just had concrete problems to solve and agent pipelines turned out to be the best answer.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "The work",
    heading: "Orchestrating agents is a new craft.",
    body: [
      "I build closed-loop pipelines where an agent gets a clearly scoped task, implements it, and I review what comes out. Around that sit review gates and context artifacts - specs, implementation plans, rules.",
      "Most of my time goes into building that context. The better I prepare it, the bigger the slice of work I can hand off and the less I have to step in myself. When an agent underdelivers, it usually just lacked the right context or prompt.",
      "I start with a high-level plan - what I actually want to build and why. Then I look for the weak spots and focus on the decisions that matter, usually around security, data consistency, error handling, or cloud cost. Only then do the concrete tasks fall out - the ones I hand to the agent.",
      "PipelineIQ is public (github.com/MarioEpkOne/PipelineIQ) - a closed-loop pipeline (spec → plan → implementation → audit → fix → merge) run not by me alone but by a team of sub-agents, routing different models to different phases on a cost budget. And a personal AI assistant that pulls in my meeting notes on its own, normalizes them into a knowledge base, and answers over them with source citations - running in production.",
    ],
  },
  {
    id: "why-here",
    eyebrow: "Why this work",
    heading: "Technical analysis comes before writing code.",
    body: [
      "I approach problems rigorously - first understand the system, then design the solution. That comes from backend work, where owning a larger feature means understanding what you're doing before you write it. And from earlier years in technical support, where I traced other people's bugs down to the code every day.",
      "I'm looking for a team where technical analysis comes before coding, because that's how I work too.",
    ],
  },
  {
    id: "why-me",
    eyebrow: "Why me",
    heading: "Proof over promise.",
    body: [
      "I have 2.5 years of backend behind me in Java and Kotlin - Spring Boot, PostgreSQL, production systems for international clients in pharma, payments, and logistics. That's where I learned what owning a larger feature takes: understanding the domain before the code, guarding data consistency and error handling, shipping something that actually matters. That foundation is what I lean on in everything else I build.",
      "And I build a lot. PipelineIQ, an AI assistant over a knowledge base, more tools around agentic development - all public on GitHub, not on a slide. I'm not talking about what I could do. I'm showing what's already running.",
      "The specific language matters less to me by now. A backend mindset carries over, whether it's Java, Python, or anything else - getting up to speed quickly in whatever's being used is something I take for granted.",
      "I'm based in Brno, so I'm in your timezone and can be in your office. This is how I see the future of development too, and I want to build it with people who see it the same way.",
    ],
  },
];
 
// ─── Locale map ───────────────────────────────────────────────────────────────
 
export const letterSections = { cs: letterSectionsCz, en: letterSectionsEn } as const;