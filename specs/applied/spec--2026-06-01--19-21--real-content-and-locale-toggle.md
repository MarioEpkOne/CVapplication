# Spec: Real Resume & Cover Letter Content + CZ/EN Locale Toggle

## Goal

Replace all placeholder content in the resume and cover letter data files with Mario's real professional history (from his DOCX resume) and real cover letter (Czech text provided inline). Add a CZ/EN language toggle so both Czech and English versions of all content — including UI labels — are available. Add two new resume sections: Profile/Summary and Courses & Certifications.

This is a content + data-model change. The rendering components already exist and consume data generically; the main work is restructuring the data layer, adding the locale context, and translating/adapting content for both languages.

---

## Current State

### Data files (single source of truth)

- **`src/data/resume.ts`** — exports a single `resume: ResumeData` object. Currently contains fabricated placeholder entries (fake companies "Acme FinTech", "DataPulse Labs", "StartupXYZ", fabricated metrics).
- **`src/data/cover-letter.ts`** — exports `letterSections: LetterSection[]` with 4 sections (hook, orchestration, why-purple, why-me). Contains polished English placeholder copy.
- **`src/data/resume.types.ts`** — TypeScript interfaces: `ResumeData`, `ExperienceEntry`, `SkillGroup`, `EducationEntry`, `ProjectEntry`, `LanguageEntry`, `ContactLink`, `ResumeHeader`.

### Rendering components (unchanged by this spec, except locale wiring)

- `ResumeHeader`, `ExperienceTimeline`, `SkillChips`, `EducationProjects` — render from `ResumeData`.
- `Scrollytelling` — renders from `LetterSection[]`.
- `ResumePage` (`src/app/page.tsx`) — assembles resume components; also renders Languages section inline.
- `CoverLetterPage` (`src/app/cover-letter/page.tsx`) — assembles scrollytelling + sign-off.

### ExperienceEntry type (current)

```ts
interface ExperienceEntry {
  company: string;
  role: string;
  start: string;  // YYYY-MM
  end: string | "present";
  bullets: string[];
  tech?: string[];
}
```

### Tests

- `tests/resume-data.test.ts` — validates: ≥2 experience entries, YYYY-MM start dates, valid end dates, newest-first ordering by end date, ≥1 education, GitHub link in projects or contacts.
- `tests/cover-letter-data.test.ts` — validates: ≥1 section, non-empty heading and body on every section.

### UI chrome

All section headings ("Experience", "Skills", "Education", etc.), TabBar labels, page metadata, and cover letter scaffolding (greeting, sign-off) are hardcoded English strings in JSX.

---

## Decisions

### D1: Language — Both CZ and EN with a toggle

The app serves both Czech and English content. Czech is the default (primary audience is Purple LAB, a Czech company). A simple React context toggle switches the active locale — no URL-based i18n routing.

**Rationale:** The DOCX and cover letter are natively Czech; Purple LAB reads Czech. But an English version demonstrates language ability and covers a wider audience.

### D2: Toggle placement — Next to ThemeToggle

A small CZ|EN toggle button placed adjacent to the existing dark-mode ThemeToggle in the top-right corner.

**Rationale:** Consistent with existing UI pattern. Non-intrusive.

### D3: Locale persistence — localStorage, default CZ

Selected language is persisted in `localStorage` under a key like `locale`. Default is `"cs"`. Survives page navigation and browser sessions.

**Rationale:** Same pattern as `next-themes` uses for dark mode persistence.

### D4: UI labels switch per locale

All section headings ("Experience" → "Zkušenosti", "Skills" → "Dovednosti", "Education" → "Vzdělání", "Projects" → "Projekty", "Languages" → "Jazyky", "Profile" → "Profil", "Courses & Certifications" → "Kurzy a certifikace"), TabBar labels, cover letter greeting/sign-off, and page metadata descriptions switch with locale.

**Rationale:** Full locale experience, not just content swap.

### D5: Profile/Summary — Add new section

Add a `summary` field to `ResumeData`. Render it between the header and experience timeline. Content sourced from the DOCX "PROFIL" section.

**Rationale:** The DOCX has a strong summary; it sets context before the reader hits experience entries.

### D6: Courses & Certifications — Add new section

Add a `certifications` field to `ResumeData` (array of objects with `name` and optional `issuer`). Render near Education.

Content (from DOCX):
- Java Developer Course — IT v kurze
- Using Databases with Python — Coursera
- Using Python to Access Web Data — Coursera
- Introduction to Programming and Computer Science — Composing Programs

**Rationale:** Shows breadth of self-directed learning.

### D7: Date model — Replace YYYY-MM with freeform period string

Replace `start`/`end` on `ExperienceEntry` with a single `period: string` field. Displayed as-is. Array order is manual (newest-first in the data file). The existing date-ordering test and YYYY-MM validation test are removed/replaced.

**Rationale:** Mario doesn't want exact dates on the public site. Durations like "2.5 roku" / "2.5 years" or "2025 – současnost" / "2025 – present" are preferred.

### D8: Experience entries — Real content from DOCX

Three entries, newest-first:

1. **AI & Agentic Developer — vlastní projekty** (2025 – present)
   - Context-writing methodology bullet (kept as experience bullet per D-decision)
   - No project bullets here — projects are in the Projects section (D9)

2. **Software Engineer — Morosystems** (2.5 years)
   - Java/Kotlin/Spring Boot backend across pharma (AstraZeneca), payments (Global Payments), logistics (Hestego)
   - REST API design, error handling, logging, transaction management
   - Agile collaboration with analysts, testers, developers

3. **Technical Support Engineer — Kentico** (3 years)
   - Root-cause analysis across two enterprise SaaS products
   - Cross-team collaboration with dev, product, US teams
   - Internal knowledge-base articles and process documentation

### D9: AI projects — Move to Projects section

The 5 AI/agentic projects from the DOCX become entries in the `projects` array, not experience bullets:

1. **PipelineIQ** — closed-loop agent pipeline (spec → plan → implement → audit → fix → merge)
2. **PromptIQ** — prompt analytics for Claude Code
3. **AI Assistant** — deployed assistant over Obsidian knowledge base
4. **Email Brief IQ** — Claude Cowork plugin for email triage
5. **UXIQ** — Python CLI for UI accessibility audits via Claude vision API
6. **This CV App** — (existing, update link to github.com/MarioEpkOne/CVapplication)

### D10: English bullets — Rewrite for impact

The English version of experience bullets should be rewritten with action verbs and impact framing (not a literal translation of the Czech). The Czech version stays faithful to the DOCX.

**Rationale:** English-speaking tech audiences expect punchy, results-oriented bullets.

### D11: Cover letter — Map Czech text into 4 existing sections

The Czech cover letter text maps to the existing structure:

| Section ID | Eyebrow | Czech heading (adapted) | Content source |
|---|---|---|---|
| `hook` | Teze / The thesis | Paragraph 1 of provided text — "came to AI agents on my own" | First paragraph |
| `orchestration` | Práce / The work | Paragraphs 2–3 — assigning tasks, building context, high-level planning | Middle paragraphs |
| `why-purple` | Proč Purple LAB / Why Purple LAB | "I like that technical analysis precedes coding" | Paragraph about Purple |
| `why-me` | Proč já / Why me | Polyglot stack, learns fast, wants like-minded team | Final paragraphs |

The English version of the cover letter should be a compelling adaptation (not literal translation) of the Czech content, maintaining the same 4-section structure.

### D12: Cover letter sign-off — Locale-aware

- Czech: "S upřímným nadšením," / "Mario Alina"
- English: "With genuine enthusiasm," / "Mario Alina"
- The Fly.io footer joke also switches locale.

### D13: Contact info — Use DOCX values, no phone

- GitHub: `github.com/MarioEpkOne` → `https://github.com/MarioEpkOne`
- LinkedIn: `linkedin.com/in/mario-alina` → `https://linkedin.com/in/mario-alina`
- Email: `mario.alina11@gmail.com` (unchanged)
- Phone: **not included** (public site)

### D14: Education — High school only

Single entry: "Střední průmyslová škola — elektrotechnika" / "Stredná škola elektrotechnická, Trnava, Slovensko". The placeholder VUT entries are removed.

### D15: Skills — Reflect real stack from DOCX

Skill groups restructured to match the DOCX "KLÍČOVÉ DOVEDNOSTI":

| Group (CZ) | Group (EN) | Items |
|---|---|---|
| AI & agentické nástroje | AI & Agentic Tools | Claude Code, MCP servery, orchestrace agentů, prompt engineering, tool use, RAG |
| Backend | Backend | Java, Kotlin, Spring Boot, REST API, PostgreSQL, SQL, TypeScript, Node.js |
| Cloud & CI/CD | Cloud & CI/CD | Docker, Git, GitHub Actions, Fly.io, CI/CD pipelines |
| Proces & spolupráce | Process & Collaboration | dekompozice procesů, root-cause analýza, code review, agile/scrum, technická dokumentace |

### D16: Languages — Reflect DOCX

- Slovenština (rodilý mluvčí) / Slovak (native)
- Čeština (pokročilá) / Czech (advanced)
- Angličtina (C1) / English (C1)
- Japonština (A1) / Japanese (A1)

### D17: Print — Uses current locale

Print/PDF renders whichever language is currently selected. No locale override for print.

### D18: Project link — Use real GitHub

"This CV App" project entry links to `https://github.com/MarioEpkOne/CVapplication`.

---

## Technical Design

### 1. Locale Context (`src/lib/locale.tsx` — new file)

```tsx
// Illustrative — see Edge Cases for authoritative behavior
"use client";
import { createContext, useContext, useState, useEffect } from "react";

type Locale = "cs" | "en";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "cs", setLocale: () => {} });

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("cs");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored === "cs" || stored === "en") setLocaleState(stored);
    setMounted(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  // Prevent hydration mismatch: render default until mounted
  if (!mounted) return <>{children}</>;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
```

Wrap the app in `LocaleProvider` inside `src/app/layout.tsx` (alongside `ThemeProvider` and `TRPCProvider`).

### 2. Locale Toggle Component (`src/components/LocaleToggle.tsx` — new file)

A small button displaying "CZ" or "EN" (the *other* language, as a switch-to action, or both with the active one highlighted). Placed next to `ThemeToggle`. Add `no-print` class to hide in print.

### 3. UI Labels Map (`src/lib/labels.ts` — new file)

```ts
// Illustrative
export const labels = {
  cs: {
    experience: "Zkušenosti",
    skills: "Dovednosti",
    education: "Vzdělání",
    projects: "Projekty",
    languages: "Jazyky",
    profile: "Profil",
    certifications: "Kurzy a certifikace",
    // TabBar
    resume: "Životopis",
    coverLetter: "Motivační dopis",
    play: "Hřiště",
    // Cover letter
    greeting: "Vážený týme Purple LAB,",
    signOff: "S upřímným nadšením,",
    flyFooter: "AWS firma, běží na Fly.",
    flyFooterLink: "Zeptejte se proč.",
  },
  en: {
    experience: "Experience",
    skills: "Skills",
    education: "Education",
    projects: "Projects",
    languages: "Languages",
    profile: "Profile",
    certifications: "Courses & Certifications",
    resume: "Resume",
    coverLetter: "Cover Letter",
    play: "Play",
    greeting: "To the Purple LAB hiring team —",
    signOff: "With genuine enthusiasm,",
    flyFooter: "AWS shop, runs on Fly.",
    flyFooterLink: "Ask me why.",
  },
} as const;
```

Components use `const { locale } = useLocale()` then `labels[locale].experience` etc.

### 4. Data Files — Dual-locale exports

#### `src/data/resume.types.ts` — Modified

```ts
// Changes:
// 1. ExperienceEntry: replace start/end with period
// 2. Add summary field to ResumeData
// 3. Add CertificationEntry and certifications to ResumeData

interface ExperienceEntry {
  company: string;
  role: string;
  period: string;        // freeform: "2025 – současnost", "2.5 roku", etc.
  bullets: string[];
  tech?: string[];
}

interface CertificationEntry {
  name: string;
  issuer?: string;
}

interface ResumeData {
  header: ResumeHeader;
  summary: string;              // NEW
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certifications: CertificationEntry[];  // NEW
  projects?: ProjectEntry[];
  languages?: LanguageEntry[];
}
```

#### `src/data/resume.ts` — Rewritten

Export two objects: `resumeCs` and `resumeEn`, plus a helper:

```ts
export const resumeCs: ResumeData = { /* Czech content from DOCX */ };
export const resumeEn: ResumeData = { /* English adaptation */ };
export const resumes = { cs: resumeCs, en: resumeEn } as const;
```

The default export `resume` is removed. Consuming components use `resumes[locale]`.

#### `src/data/cover-letter.ts` — Rewritten

Export two arrays: `letterSectionsCz` and `letterSectionsEn`, plus a helper:

```ts
export const letterSectionsCz: LetterSection[] = [ /* 4 sections, Czech */ ];
export const letterSectionsEn: LetterSection[] = [ /* 4 sections, English */ ];
export const letterSections = { cs: letterSectionsCz, en: letterSectionsEn } as const;
```

### 5. Component Changes

#### Pages become client components or use a client wrapper

`ResumePage` and `CoverLetterPage` currently import data at the module level (RSC). With locale from context, the data selection must happen in a client component. Two approaches:

**Preferred approach:** Keep the pages as thin RSC shells that render a client component which reads locale context and selects the data:

```tsx
// src/app/page.tsx — stays RSC
import { ResumeContent } from "@/components/resume/ResumeContent";
export default function ResumePage() {
  return <ResumeContent />;
}

// src/components/resume/ResumeContent.tsx — new client component
"use client";
import { useLocale } from "@/lib/locale";
import { resumes } from "@/data/resume";
import { labels } from "@/lib/labels";
// ... renders all resume sections using resumes[locale] and labels[locale]
```

Same pattern for cover letter: `CoverLetterContent` client component.

#### Components that render section headings

`ExperienceTimeline`, `SkillChips`, `EducationProjects` currently hardcode English heading strings. These must accept a heading label as a prop, or read from locale context directly.

**Preferred:** Pass labels as props from the content wrapper, keeping leaf components locale-unaware:

```tsx
<ExperienceTimeline experience={data.experience} heading={labels[locale].experience} />
```

#### New components

- `ProfileSummary` — renders the summary string between header and experience.
- `Certifications` — renders the certifications array near education.

#### Modified components

- `TabBar` — labels switch per locale. Currently hardcoded in the component; needs to read locale context.
- Cover letter page sign-off and greeting — switch per locale.
- `LocaleToggle` — new, placed next to ThemeToggle.

### 6. Content Mapping

#### Resume — Czech (faithful to DOCX)

**Header:**
- Name: Mario Alina
- Title: Backend & AI Developer (or adapted from DOCX "Profil" context)
- Location: Brno, Česká republika
- Contacts: email, github (MarioEpkOne), linkedin (mario-alina)

**Summary:** The DOCX "PROFIL" section, verbatim or lightly edited.

**Experience (3 entries):**

1. AI & Agentic Developer — vlastní projekty | 2025 – současnost
   - Context-writing methodology bullet from DOCX
   
2. Software Engineer — Morosystems | 2,5 roku
   - 3 bullets from DOCX (pharma/payments/logistics, REST API design, agile collaboration)
   - Tech: Java, Kotlin, Spring Boot, PostgreSQL, REST API

3. Technical Support Engineer — Kentico | 3 roky
   - 3 bullets from DOCX (root-cause analysis, cross-team collaboration, knowledge base)

**Skills:** 4 groups matching DOCX "KLÍČOVÉ DOVEDNOSTI" (see D15).

**Education:** 1 entry — high school from DOCX.

**Certifications:** 4 entries from DOCX.

**Projects:** 6 entries (5 AI projects + This CV App) with Czech descriptions from DOCX.

**Languages:** 4 entries from DOCX (see D16).

#### Resume — English (rewritten for impact)

Same structure, but:
- Summary is adapted, not literally translated
- Experience bullets are rewritten with action verbs and impact framing
- Skill group names in English
- Project descriptions adapted for English audience
- Period strings in English ("2.5 years", "2025 – present")

#### Cover Letter — Czech (4 sections)

| id | eyebrow | heading | body |
|---|---|---|---|
| hook | Teze | *Adapted heading from content* | Paragraph 1: "práce s AI agenty je něco, k čemu jsem se dostal sám od sebe..." |
| orchestration | Práce | *Adapted heading* | Paragraphs 2–3: assigning tasks to agents, building context, high-level planning |
| why-purple | Proč Purple LAB | *Adapted heading* | "technická analýza předchází kódování" paragraph |
| why-me | Proč já | *Adapted heading* | Polyglot paragraph + "chci ji dělat s lidmi, co to vidí stejně" |

#### Cover Letter — English (4 sections)

Compelling English adaptation of the Czech content, same 4-section structure. Not a literal translation — written to resonate with an English-reading audience while preserving the same key points.

---

## Edge Cases & Error Handling

| # | Scenario | Required behavior |
|---|---|---|
| E1 | Hydration mismatch on locale | `LocaleProvider` must render children with the default locale ("cs") on the server/first render, then switch to the stored locale after `useEffect` mount. Do NOT flash English then switch to Czech. |
| E2 | localStorage unavailable (private browsing) | Wrap `localStorage.getItem`/`setItem` in try/catch. Fall back to "cs" default with no persistence. |
| E3 | Invalid locale in localStorage | If the stored value is not "cs" or "en", treat as "cs". |
| E4 | Print CSS + locale toggle | The `LocaleToggle` component must have the `no-print` class. Print renders the currently selected locale content — no override. |
| E5 | ExperienceEntry with empty period | Render gracefully — omit the date line if `period` is empty/falsy. |
| E6 | Empty certifications array | `Certifications` component renders nothing (same pattern as existing `EducationProjects`). |
| E7 | SEO / metadata with locale | Page metadata (`<title>`, `description`) should reflect the default locale ("cs") since these are set at the RSC level and cannot dynamically switch. Alternatively, keep metadata in English (it's for search engines). Decision: keep metadata in English — it's static RSC-level and Czech SEO is not a priority for this work sample. |
| E8 | TabBar label width change on locale switch | Czech labels ("Životopis", "Motivační dopis") are longer than English. TabBar must accommodate without layout shift — use `min-width` or flexible layout. |
| E9 | Cover letter greeting/sign-off locale | The greeting and sign-off in `CoverLetterPage` must read from `labels[locale]`, not hardcoded strings. |
| E10 | Projects array ordering | Projects are listed in the order they appear in the array. The "This CV App" entry should be last (or first — implementer's call, but be consistent across locales). |
| E11 | `resume` default export removed — import breakage | All files importing `import { resume } from "@/data/resume"` must be updated to use the new `resumes` export with locale. Grep for all usages: `page.tsx`, `opengraph-image.tsx`, test files. |
| E12 | OG image locale | `opengraph-image.tsx` imports resume data for the OG image. Since OG images are generated at build/request time (RSC), use the Czech data as the canonical OG image content. |

---

## Constraints & Invariants

1. **Data-file-is-source-of-truth rule** — all resume content renders only from `src/data/resume.ts`, all cover letter content renders only from `src/data/cover-letter.ts`. Zero hardcoded content strings in JSX (UI label keys are not "content" — they're chrome).

2. **No new dependencies** for i18n — the locale system is a simple React context + localStorage, not a library.

3. **Tailwind v4 CSS-first** — no `tailwind.config.js`. All styling via utility classes and `globals.css` `@theme`.

4. **tRPC v11 conventions** — unchanged by this spec.

5. **Contact mutation ordering** — unchanged.

6. **Print CSS** — `.no-print` on `LocaleToggle`. Print uses current locale. Light-mode enforcement unchanged.

7. **Test suite must pass** — tests that validate YYYY-MM dates must be updated to match the new `period` field model.

8. **No real secrets/PII** — phone number is excluded. Email is already public.

9. **The `LetterSection` interface** in `cover-letter.ts` is preserved (id, eyebrow?, heading, body[]). The `id` union type may be widened but the existing IDs are kept.

---

## Testing Strategy

### Updated tests

#### `tests/resume-data.test.ts`

- Remove: YYYY-MM start date validation, end date validation, newest-first ordering by date comparison.
- Update: ≥2 experience entries → ≥3 experience entries (3 real entries).
- Add: every experience entry has a truthy `period` string.
- Add: `resume.summary` is a non-empty string (both locales).
- Add: `resume.certifications` has ≥1 entry with a truthy `name`.
- Keep: header field validation, education ≥1, GitHub link check.
- Add: test both `resumeCs` and `resumeEn` — both must pass all structural validations.

#### `tests/cover-letter-data.test.ts`

- Update: import both `letterSectionsCz` and `letterSectionsEn`.
- Test both arrays: ≥1 section, non-empty headings and bodies.
- Add: both arrays have exactly 4 sections with IDs: hook, orchestration, why-purple, why-me.

### New tests

#### Locale context (optional but recommended)

- `LocaleProvider` defaults to "cs".
- `setLocale("en")` updates context value.
- Invalid localStorage values fall back to "cs".

### Manual verification

1. Load `/` — verify Czech resume content renders by default.
2. Toggle to EN — verify English content renders, section headings switch.
3. Reload page — verify locale persists.
4. Load `/cover-letter` — verify Czech content, toggle to EN, verify English.
5. Print preview in both locales — verify correct content, no toggle visible.
6. Check TabBar labels switch in both locales.
7. Verify no hydration mismatch warnings in console.

### Existing tests (must still pass)

- `contact-schema.test.ts` — unaffected.
- `rate-limit.test.ts` — unaffected.
- `sanitize.test.ts` — unaffected.

---

## Open Questions

1. **English cover letter headings** — The spec prescribes the 4-section mapping and Czech headings. The English section headings should be compelling standalone phrases (like the current placeholders: "The medium is the message.", "Proof over promise."). Should the implementer craft these, or does Mario want to write them? **Recommendation:** Implementer drafts, Mario reviews.

2. **Header title** — The DOCX doesn't have a single-line title. The current placeholder is "Senior Software Engineer & AI Agent Orchestrator". Should the Czech version be "Backend & AI Developer" (matching the DOCX job role framing) and the English version something punchier? **Recommendation:** CZ: "Backend & AI Agentic Developer", EN: "Backend Engineer & AI Agent Orchestrator".

3. **AI & Agentic Developer experience entry** — With projects moved to the Projects section (D9), this entry has only 1 bullet (the context-writing methodology statement). Is 1 bullet sufficient, or should 1–2 additional bullets be added summarizing the agentic work approach? **Recommendation:** Add 1–2 bullets synthesizing the project work at a higher level to avoid a visually thin entry.

4. **`Agent Orchestrator (WIP)` project** — Currently exists in the placeholder data as a "coming soon" placeholder for the Play tab. Keep it or remove it in favor of the 5 real AI projects? **Recommendation:** Remove it — the 5 real projects are stronger.
