// Cover letter data — config-driven so sections reorder/add/remove freely.
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
      "Nečtete jen můj motivační dopis, prohlížíte si ho. Tahle stránka je stručná ukázka práce. Je to Next.js aplikace, nasazená přes reálné CI/CD a dokumentovaná pro AI agenty stejně pečlivě jako pro lidi. Kód řekne víc než próza. Na záložce „Zeptej se agenta” si můžete vyzkoušet i rozpracovanou živou ukázku agenta — je zatím experimentální.",
      "K agentnímu vývoji jsem se dostal sám od sebe. Nešel jsem po trendu, jen jsem řešil konkrétní problémy a agentní pipeline na ně byla nejlepší odpověď.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "Práce",
    heading: "Orchestrace agentů je řemeslo.",
    body: [
      "Poslední projekt jsem stavěl uzavřené pipeline, kde agent dostane jasně ohraničený úkol, naimplementuje ho a já pak procházím výsledek. Kolem toho jsou review gates a kontextové artefakty jako spec, nebo implementační plány.",
      "Nejvíc času ale trávím budováním toho kontextu. Vím, že čím líp kontext připravím, tím větší kus práce můžu předat a tím míň musím zasahovat sám. Chápu, že když agent nevykoná úkol podle představ, je reálná šance, že jen neměl správný kontext nebo prompt.",
      "Nejdřív si postavím high-level plán/goal. Tedy co vlastně chci postavit a proč. Pak v něm hledám slabá místa a soustředím se na zásadní rozhodnutí, většinou kolem bezpečnosti, konzistence dat, error handlingu nebo cloudových nákladů.",
      "Až z toho potom vznikají konkrétní úkoly, které budou potřebovat specifický kontext pro agenta.",
    ],
  },
  {
    id: "why-here",
    eyebrow: "Proč tahle práce",
    heading: "Technická analýza předchází psaní kódu.",
    body: [
      "Přistupuji k problémům rigorózně - nejdřív porozumět systému, pak navrhovat řešení. Hledám tým, kde technická analýza předchází kódování, protože sám to dělám podobně.",

    ],
  },
  {
    id: "why-me",
    eyebrow: "Proč já",
    heading: "Důkaz před slibem.",
    body: [
      "Kontext pro agenty jako infrastruktura je přesně to, na čem tahle pozice stojí, a postavil jsem na tom tuhle aplikaci.",
      "K tech-stacku chci být otevřený. TypeScript a Node.js jsem začal používat nedávno, právě u agentního vývoje. Předtím jsem dělal hlavně v Javě a Kotlinu, úplně na začátku v Pythonu. Na konkrétní technologii mi ale tolik nezáleží, mám chuť a jsem zvyklý se rychle dostat na úroveň v tom, s čím se zrovna pracuje.",
      "Sídlím v Brně, takže jsem ve vašem časovém pásmu a klidně i ve vaší kanceláři.",
      "A hlavní důvod, proč píšu zrovna vám, je jednoduchý. Takhle si budoucnost vývoje představuju i já a chci ji dělat s lidmi, co to vidí stejně. Moc rád bych se s vámi potkal a probrali možnou spolupráci.",
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
      "You're not just reading my cover letter, you're looking at it. This site is a work sample. It's a deliberately over-engineered Next.js app, shipped on a real CI/CD pipeline and documented for AI agents as carefully as for people. The code makes the point better than prose. On the \"Ask the Agent\" tab you can try a work-in-progress live agent demo — still experimental.",
      "I came to agentic development on my own. I wasn't chasing a trend, I just had concrete problems to solve and agent pipelines turned out to be the best answer.",
    ],
  },
  {
    id: "orchestration",
    eyebrow: "The work",
    heading: "Orchestrating agents is a craft.",
    body: [
      "I've been building closed-loop pipelines where an agent gets a clearly scoped task, implements it, and I review what comes out. Around that sit review gates and context artifacts like specs and implementation plans.",
      "Most of my time goes into building that context. The better I prepare it, the bigger the slice of work I can hand off and the less I have to step in myself. If an agent underdelivers, there's a good chance it just lacked the right context or prompt.",
      "I start with a high-level plan — what I actually want to build and why. Then I look for the weak spots and focus on the decisions that matter, usually around security, data consistency, error handling, or cloud cost.",
      "Only then do the concrete tasks fall out — the ones that will need specific context for the agent.",
    ],
  },
  {
    id: "why-here",
    eyebrow: "Why this work",
    heading: "Technical analysis comes before writing code.",
    body: [
      "I approach problems rigorously — first understand the system, then design the solution. I'm looking for a team where technical analysis comes before coding, because that's how I work too.",
    ],
  },
  {
    id: "why-me",
    eyebrow: "Why me",
    heading: "Proof over promise.",
    body: [
      "Agent context as infrastructure is exactly what the role is built on, and I built this whole app on it.",
      "On the stack I'll be honest. I picked up TypeScript and Node.js recently, through agentic development. Before that I worked mostly in Java and Kotlin, and at the very start in Python. The specific technology matters less to me, I'm used to getting up to speed quickly in whatever a team is using.",
      "I'm based in Brno, so I'm in your timezone and can be in your office.",
      "The main reason I'm writing to you is simple. This is how I see the future of development too, and I want to build it with people who see it the same way. I'd love to meet and talk about working together.",
    ],
  },
];
 
// ─── Locale map ───────────────────────────────────────────────────────────────
 
export const letterSections = { cs: letterSectionsCz, en: letterSectionsEn } as const;