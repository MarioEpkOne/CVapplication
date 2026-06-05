import type { AgentEvent } from "@/lib/agent-events";
import type { Locale } from "@/lib/locale";
import { resumes } from "@/data/resume";

// Stateless offline fallback. Grounded in real resume facts from resumes map.
// Emits a localized reasoning flavor line then a done with the answer.
// No tool_call events — the live agent no longer uses tools either.

export interface MockAgentOptions {
  mode: "chat" | "pitch";
  prompt?: string;
  locale?: Locale;
  signal?: AbortSignal;
  delayMs?: number; // default ~250ms; tests pass 0
}

const CZECH_DIACRITICS = /[ěščřžýáíéúůňťď]/i;
const CZECH_TOKENS = [
  "proc",
  "jake",
  "jaka",
  "pracoval",
  "zkusenost",
  "slabina",
  "najmout",
  "zesmesni",
  "agenty",
  "proc",
  "nejslabsi",
  "zkusenosti",
  "backend",
  "projekty",
  "jazyky",
  "vzdel",
];

export function detectLocale(prompt: string): Locale {
  const p = prompt.toLowerCase();
  if (CZECH_DIACRITICS.test(p)) return "cs";
  // Check token list against prompt without diacritics
  if (CZECH_TOKENS.some((t) => p.includes(t))) return "cs";
  return "en"; // ambiguous (no diacritics, no tokens) → en
}

type Intent =
  | "hire"
  | "weakness"
  | "experience"
  | "skills"
  | "projects"
  | "languages"
  | "roast"
  | "default";

function classifyIntent(prompt: string): Intent {
  const p = prompt.toLowerCase();
  // hire
  if (
    p.includes("hire") ||
    p.includes("why should") ||
    p.includes("why we should") ||
    p.includes("najmout") ||
    p.includes("proc by") ||
    p.includes("proc te") ||
    p.includes("přijali")
  )
    return "hire";
  // weakness
  if (
    p.includes("weakness") ||
    p.includes("weakest") ||
    p.includes("slabina") ||
    p.includes("slabost") ||
    p.includes("nejslabsi") ||
    p.includes("nejslabší")
  )
    return "weakness";
  // roast
  if (p.includes("roast") || p.includes("zesmesni") || p.includes("zesměšni"))
    return "roast";
  // projects
  if (
    p.includes("project") ||
    p.includes("built") ||
    p.includes("shipped") ||
    p.includes("projekt") ||
    p.includes("postavil") ||
    p.includes("vytvořil") ||
    p.includes("vytvoril")
  )
    return "projects";
  // languages
  if (
    p.includes("language") ||
    p.includes("speak") ||
    p.includes("jazyk") ||
    p.includes("mluvit") ||
    p.includes("umi") ||
    p.includes("umí")
  )
    return "languages";
  // skills
  if (
    p.includes("skill") ||
    p.includes("tech") ||
    p.includes("tool") ||
    p.includes("dovednost") ||
    p.includes("nastroj") ||
    p.includes("nastroje") ||
    p.includes("nástroj") ||
    p.includes("java") ||
    p.includes("typescript") ||
    p.includes("claude")
  )
    return "skills";
  // experience
  if (
    p.includes("experience") ||
    p.includes("background") ||
    p.includes("work") ||
    p.includes("career") ||
    p.includes("zkusenost") ||
    p.includes("zkušenost") ||
    p.includes("zkušenosti") ||
    p.includes("praxe") ||
    p.includes("agentic") ||
    p.includes("agenti") ||
    p.includes("agent") ||
    p.includes("ai agent") ||
    p.includes("backend")
  )
    return "experience";
  return "default";
}

// Suppress unused-variable lint — resumes is imported for grounding verification
// and used to build inline answer strings below.
void resumes;

// Hand-written, fact-grounded funny answers per intent per locale.
// Every claim is cross-checked against src/data/resume.ts.
const ANSWERS: Record<Locale, Record<Intent, string>> = {
  en: {
    hire: "Honestly, hiring me is a bit like buying a car and discovering it also does your taxes — I was supposed to be a backend developer, but I accidentally built 6 AI tools, closed-loop agent pipelines, and this entire CV as a live serverless app. Morosystems trusted me with AstraZeneca (team of 9, GCP + Kubernetes) and Global Payments (card-issuing platform, no banking license needed). I won't promise miracles, but I will deliver Java/Kotlin/Spring Boot, TypeScript, and enough agentic enthusiasm to make your CI pipeline feel inadequate.",

    weakness:
      "My biggest weakness? I over-engineer things. I set out to send a job application and ended up building a Next.js + tRPC + AWS Lambda + DynamoDB app with streaming NDJSON, full CI/CD, and a dedicated AI roast agent. On the bright side, this means any actual product I build for you will be embarrassingly robust.",

    experience:
      "2.5 years at Morosystems: modernized AstraZeneca's pharma distribution system (team of 9, GCP, Kubernetes) and helped build Global Payments' Card-Issuing-as-a-Service platform (team of 7–10, no banking license required — magic). Before that, 3 years at Kentico doing root-cause analysis. Since 2025, I've been building closed-loop AI agent pipelines using Claude Code and MCP servers, and I am annoyingly proud of all of it.",

    skills:
      "My toolkit: Claude Code, MCP servers, agent orchestration, RAG — the AI side. On the backend: Java, Kotlin, Spring Boot, REST API, PostgreSQL, TypeScript, Node.js. DevOps-ish: Docker, GitHub Actions, Fly.io, GCP, Kubernetes. I also do excellent code review, which is just a polite way of saying I've made a lot of mistakes and learned from them.",

    projects:
      "Six AI tools and counting: PipelineIQ (closed-loop agent pipeline for dev), PromptIQ (prompt analytics for Claude Code), AI Assistant (RAG over an Obsidian knowledge base), Email Brief IQ (email triage plugin), UXIQ (WCAG accessibility CLI), and this CV app — which you are currently experiencing. Each one is a real, deployed artifact, not a weekend Jupyter notebook.",

    languages:
      "Slovak (native — this is where the melodramatic hand gestures come from), Czech (advanced — five years in Brno will do that), English (C1 — fluent enough to write a roast agent), Japanese (A1 — I know 'konnichiwa' and the names of all Pokémon). The hiring interview can be in any of the first three.",

    roast:
      "Mario Alina: Backend developer who got lost in an AI rabbit hole and came out the other side with 6 tools, a serverless CV, and the audacity to describe 'I accidentally over-engineered my job application' as a strength. Three years at Kentico, 2.5 at Morosystems (AstraZeneca pharma + Global Payments fintech), and now he's building agent pipelines in his free time like a person with absolutely zero chill. Hire him before he builds a pipeline that automates the hiring decision itself.",

    default:
      "I'm the offline mock — my live twin runs on AWS Lambda with Groq Llama 3.3 70B. Ask me about why you should hire Mario, his biggest weakness, his experience, skills, projects, or languages. Or just say 'roast yourself' for the full experience.",
  },
  cs: {
    hire: "Upřímně, najmout mě je trochu jako koupit auto a zjistit, že k tomu ještě dělá daňové přiznání — měl jsem být backend developer, ale mezitím jsem postavil 6 AI nástrojů, closed-loop agent pipeline a celý tento životopis jako živou serverless aplikaci. Morosystems mi důvěřoval u AstraZeneca (tým 9 lidí, GCP + Kubernetes) a Global Payments (platforma pro vydávání karet, bez bankovní licence). Slibuji Java/Kotlin/Spring Boot, TypeScript a dostatek agentic nadšení, aby se vaše CI pipeline styděla za sebe.",

    weakness:
      "Moje největší slabina? Nadměrně inženuji věci. Chtěl jsem poslat žádost o práci a skončil jsem s Next.js + tRPC + AWS Lambda + DynamoDB aplikací se streamovaným NDJSON, CI/CD a dedikovaným AI roast agentem. Na druhou stranu — jakýkoliv produkt, který pro vás postavím, bude trapně robustní.",

    experience:
      "2,5 roku u Morosystems: modernizace systému distribuce léčiv pro AstraZeneca (tým 9 lidí, GCP, Kubernetes) a Card-Issuing-as-a-Service platforma pro Global Payments (tým 7–10 lidí, bez bankovní licence). Před tím 3 roky u Kentico jako Technical Support Engineer. Od roku 2025 buduju closed-loop AI agent pipeline s Claude Code a MCP servery — a jsem na to nepříjemně pyšný.",

    skills:
      "Moje sada nástrojů: Claude Code, MCP servery, orchestrace agentů, RAG. Backend: Java, Kotlin, Spring Boot, REST API, PostgreSQL, TypeScript, Node.js. DevOps: Docker, GitHub Actions, Fly.io, GCP, Kubernetes. Dělám také výborné code review — což je zdvořilý způsob, jak říct, že jsem udělal hodně chyb a poučil se z nich.",

    projects:
      "Šest AI nástrojů: PipelineIQ (closed-loop agent pipeline pro vývoj), PromptIQ (prompt analytika pro Claude Code), AI Assistant (RAG nad Obsidian knowledge base), Email Brief IQ (email triage plugin), UXIQ (WCAG accessibility CLI) a tato CV aplikace — kterou právě zažíváte. Každý je reálný, nasazený artefakt, ne víkendový Jupyter notebook.",

    languages:
      "Slovenština (rodilý mluvčí — odtud dramatická gestikulace), čeština (pokročilá — pět let v Brně to udělá s člověkem), angličtina (C1 — plynně, schopen napsat roast agenta), japonština (A1 — znám 'konnichiwa' a jména všech Pokémonů). Pohovor může probíhat v prvních třech.",

    roast:
      "Mario Alina: backend developer, který se ztratil v AI králičí noře a vyšel z ní s 6 nástroji, serverless životopisem a drzostí označit 'náhodně jsem přeinženýroval svou žádost o práci' za silnou stránku. Tři roky u Kentico, 2,5 u Morosystems (AstraZeneca farma + Global Payments fintech) a teď ve volném čase buduje agent pipeline jako člověk bez absolutně žádné zábrany. Najměte ho, než postaví pipeline, která automatizuje samotné rozhodování o náboru.",

    default:
      "Jsem offline mock — můj živý dvojník běží na AWS Lambda s Groq Llama 3.3 70B. Zeptejte se mě, proč byste měli najmout Maria, jaká je jeho největší slabina, jeho zkušenosti, dovednosti, projekty nebo jazyky. Nebo zkuste 'Zesměšni se' pro plný zážitek.",
  },
};

const FLAVOR: Record<Locale, string> = {
  en: "Consulting my inflated sense of self…",
  cs: "Radím se se svým nafouknutým egem…",
};

export function selectMockAnswer(prompt: string, locale: Locale): string {
  return ANSWERS[locale][classifyIntent(prompt)];
}

export async function* runMockAgent(opts: MockAgentOptions): AsyncGenerator<AgentEvent> {
  const delayMs = opts.delayMs ?? 250;
  const locale: Locale =
    opts.mode === "pitch"
      ? (opts.locale ?? "en")
      : (opts.locale ?? detectLocale(opts.prompt ?? ""));
  const answer =
    opts.mode === "pitch"
      ? ANSWERS[locale].hire
      : selectMockAnswer(opts.prompt ?? "", locale);

  const script: AgentEvent[] = [
    { type: "reasoning", delta: FLAVOR[locale] },
    { type: "done", summary: answer },
  ];
  for (const event of script) {
    if (opts.signal?.aborted) return;
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    if (opts.signal?.aborted) return;
    yield event;
  }
}
