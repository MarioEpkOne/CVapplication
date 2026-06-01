# Implementation Plan: Real Resume & Cover Letter Content + CZ/EN Locale Toggle

## Header
- **Spec**: specs/applied/spec--2026-06-01--19-21--real-content-and-locale-toggle.md
- **Worktree**: /mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle
- **Scope -- files in play** (agent must not touch files not listed here):
  - `src/data/resume.types.ts`
  - `src/data/resume.ts`
  - `src/data/cover-letter.ts`
  - `src/lib/locale.tsx` (new)
  - `src/lib/labels.ts` (new)
  - `src/components/LocaleToggle.tsx` (new)
  - `src/components/resume/ResumeContent.tsx` (new)
  - `src/components/resume/ProfileSummary.tsx` (new)
  - `src/components/resume/Certifications.tsx` (new)
  - `src/components/cover-letter/CoverLetterContent.tsx` (new)
  - `src/components/resume/ExperienceTimeline.tsx`
  - `src/components/resume/SkillChips.tsx`
  - `src/components/resume/EducationProjects.tsx`
  - `src/components/resume/ResumeHeader.tsx`
  - `src/components/TabBar.tsx`
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/app/cover-letter/page.tsx`
  - `tests/resume-data.test.ts`
  - `tests/cover-letter-data.test.ts`
  - `CLAUDE.md`
- **Reading list** (read these in order before starting, nothing else):
  1. `src/data/resume.types.ts`
  2. `src/data/resume.ts`
  3. `src/data/cover-letter.ts`
  4. `src/app/layout.tsx`
  5. `src/app/page.tsx`
  6. `src/app/cover-letter/page.tsx`
  7. `src/components/resume/ExperienceTimeline.tsx`
  8. `src/components/resume/SkillChips.tsx`
  9. `src/components/resume/EducationProjects.tsx`
  10. `src/components/resume/ResumeHeader.tsx`
  11. `src/components/TabBar.tsx`
  12. `src/components/ThemeToggle.tsx`
  13. `src/components/cover-letter/Scrollytelling.tsx`
  14. `tests/resume-data.test.ts`
  15. `tests/cover-letter-data.test.ts`
  16. `CLAUDE.md`

## Environment Assumptions Verified
- **Test runner**: vitest ^4.1.8 (in devDependencies), configured with `environment: "node"`, `globals: true`, includes `tests/**/*.test.ts`.
- **No React testing libraries**: `@testing-library/react`, `jsdom`, and `happy-dom` are NOT installed. React component rendering tests (e.g., LocaleProvider context tests mentioned as "optional but recommended" in spec) cannot be written without adding dependencies. This is a known gap; data-layer tests suffice for this plan.
- **OG image (`src/app/opengraph-image.tsx`)**: Does NOT import from `@/data/resume`. Content is hardcoded ("Mario Alina", etc.). Spec edge case E11 mentions `opengraph-image.tsx` as an import site, but this is incorrect -- no change needed to this file. E12 is already satisfied since the OG image is static.

---

## Steps

### Step 1: Modify `ExperienceEntry` type -- replace `start`/`end` with `period`; add `summary` and `certifications` to `ResumeData`

**File**: `src/data/resume.types.ts`
**Action**: Edit existing types, add new interface

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/data/resume.types.ts`):**
```ts
export interface ExperienceEntry {
  company: string;
  role: string;
  start: string; // ISO 'YYYY-MM'
  end: string | "present";
  bullets: string[];
  tech?: string[];
}
```

and:

```ts
export interface ResumeData {
  header: ResumeHeader;
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  projects?: ProjectEntry[];
  languages?: LanguageEntry[];
}
```

**Changes**:

1. Replace `start` and `end` fields on `ExperienceEntry` with a single `period: string` field:
```ts
export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;        // freeform: "2025 -- present", "2.5 years", etc.
  bullets: string[];
  tech?: string[];
}
```

2. Add a new `CertificationEntry` interface after `ProjectEntry`:
```ts
export interface CertificationEntry {
  name: string;
  issuer?: string;
}
```

3. Add `summary` and `certifications` fields to `ResumeData`:
```ts
export interface ResumeData {
  header: ResumeHeader;
  summary: string;                       // NEW - profile/summary section
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  education: EducationEntry[];
  certifications: CertificationEntry[];  // NEW - courses & certifications
  projects?: ProjectEntry[];
  languages?: LanguageEntry[];
}
```

**Verification**: Run `npm run typecheck`. Expect type errors in files that reference `start`/`end` on `ExperienceEntry` and files that don't provide `summary`/`certifications` on `ResumeData`. These will be resolved in subsequent steps.

---

### Step 2: Create locale context (`src/lib/locale.tsx`)

**File**: `src/lib/locale.tsx` (new file)
**Action**: Create new file

**What it does**: Provides a React context for CZ/EN locale switching with localStorage persistence. Default locale is `"cs"`. Prevents hydration mismatch by rendering children with default locale until `useEffect` mount.

**Implementation details**:
- Export `Locale` type as `"cs" | "en"`
- Export `LocaleProvider` component:
  - State: `locale` defaults to `"cs"`, `mounted` defaults to `false`
  - On mount (`useEffect`): read `localStorage.getItem("locale")`, validate it is `"cs"` or `"en"`, set state. Set `mounted = true`.
  - `setLocale` function: updates state and writes to `localStorage.setItem("locale", l)`.
  - Wrap `localStorage` access in try/catch for E2 (private browsing / unavailable localStorage).
  - If invalid value in localStorage (E3), fall back to `"cs"`.
  - Before `mounted`, render `<LocaleContext.Provider value={{ locale: "cs", setLocale }}>` to ensure children always have context access (not bare `<>{children}</>` which breaks `useLocale()` calls).
- Export `useLocale()` hook.

**Edge cases addressed**: E1 (hydration mismatch), E2 (localStorage unavailable), E3 (invalid locale).

**Verification**: `npm run typecheck` -- file compiles. No runtime test (see Environment Assumptions).

---

### Step 3: Create UI labels map (`src/lib/labels.ts`)

**File**: `src/lib/labels.ts` (new file)
**Action**: Create new file

**What it does**: Exports a `labels` object mapping `cs` and `en` locales to all UI chrome strings used across the app.

**Contents**:
```ts
export const labels = {
  cs: {
    experience: "Zkusenosti",
    skills: "Dovednosti",
    education: "Vzdelani",
    projects: "Projekty",
    languages: "Jazyky",
    profile: "Profil",
    certifications: "Kurzy a certifikace",
    resume: "Zivotopis",
    coverLetter: "Motivacni dopis",
    play: "Hriste",
    greeting: "Vazeny tyme Purple LAB,",
    signOff: "S uprimnym nadsenim,",
    signOffName: "Mario Alina",
    flyFooter: "AWS firma, bezi na Fly.",
    flyFooterLink: "Zeptejte se proc.",
    builtBy: "Vytvoril Mario Alina pro Purple LAB.",
    viewSource: "Zobrazit zdrojovy kod",
    comingSoon: "Jiz brzy",
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
    greeting: "To the Purple LAB hiring team --",
    signOff: "With genuine enthusiasm,",
    signOffName: "Mario Alina",
    flyFooter: "AWS shop, runs on Fly.",
    flyFooterLink: "Ask me why.",
    builtBy: "Built by Mario Alina for Purple LAB.",
    viewSource: "View source",
    comingSoon: "Coming soon.",
  },
} as const;

export type Labels = typeof labels["cs"];
```

**IMPORTANT**: Use proper Czech diacritics in the actual implementation (e.g., "Zkusenosti" above is illustrative -- the real values must be: "Zkusenosti" = "Zkusenosti", "Vzdelani" = "Vzdelani", etc.). The full list with correct diacritics from the spec:
- experience: "Zkusenosti" -> must be with hacek/carka
- skills: "Dovednosti"
- education: "Vzdelani" -> must be with hacek
- certifications: "Kurzy a certifikace"
- resume: "Zivotopis" -> must be with hacek
- coverLetter: "Motivacni dopis" -> must be with hacek
- play: "Hriste" -> must be with hacek
- greeting: "Vazeny tyme Purple LAB," -> must be with hacek/carka
- signOff: "S uprimnym nadsenim," -> must be with hacek
- flyFooter: "AWS firma, bezi na Fly." -> must be with hacek
- flyFooterLink: "Zeptejte se proc." -> must be with hacek
- builtBy: "Vytvoril Mario Alina pro Purple LAB." -> must be with hacek

Refer directly to the spec's D4 section for the canonical Czech strings.

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 4: Rewrite resume data with dual-locale exports (`src/data/resume.ts`)

**File**: `src/data/resume.ts`
**Action**: Complete rewrite

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/data/resume.ts`):**
The file currently exports a single `export const resume: ResumeData = { ... }` with placeholder content (Acme FinTech, DataPulse Labs, StartupXYZ, VUT education entries, 2 placeholder projects).

**New structure**:
- Remove the `export const resume` default export entirely.
- Export `resumeCs: ResumeData` with Czech content (spec D8, D9, D13, D14, D15, D16).
- Export `resumeEn: ResumeData` with English content (spec D10).
- Export `resumes = { cs: resumeCs, en: resumeEn } as const`.

**Content for `resumeCs`** (from spec):

Header:
- name: "Mario Alina"
- title: "Backend & AI Agentic Developer" (spec Open Question 2 recommendation, CZ version)
- photoSrc: "/photo-placeholder.svg"
- location: "Brno, Ceska republika" (with proper diacritics)
- contacts: email (mario.alina11@gmail.com), github (github.com/MarioEpkOne, href https://github.com/MarioEpkOne), linkedin (linkedin.com/in/mario-alina, href https://linkedin.com/in/mario-alina)

Summary: The DOCX "PROFIL" section text. Since the exact DOCX text is not embedded in the spec, the implementer should write a concise Czech professional summary (~2-3 sentences) capturing: AI agent orchestration specialist, backend developer with Java/Kotlin/Spring Boot background, builds closed-loop agent pipelines, context-writing methodology practitioner. Adapt from what the spec reveals about Mario's background in D5, D8, and the cover letter content.

Experience (3 entries, newest-first per D8):
1. company: "vlastni projekty", role: "AI & Agentic Developer", period: "2025 -- soucasnost" (Czech with diacritics), bullets: context-writing methodology bullet + 1-2 higher-level agentic work bullets (spec Open Question 3 recommendation), tech: not specified (omit or add relevant ones)
2. company: "Morosystems", role: "Software Engineer", period: "2,5 roku", bullets: 3 bullets from spec D8 (pharma/payments/logistics, REST API design, agile collaboration), tech: ["Java", "Kotlin", "Spring Boot", "PostgreSQL", "REST API"]
3. company: "Kentico", role: "Technical Support Engineer", period: "3 roky", bullets: 3 bullets from spec D8 (root-cause analysis, cross-team collaboration, knowledge base)

Skills (4 groups per D15):
1. group: "AI & agenticke nastroje" (with diacritics), items: ["Claude Code", "MCP servery", "orchestrace agentu", "prompt engineering", "tool use", "RAG"]
2. group: "Backend", items: ["Java", "Kotlin", "Spring Boot", "REST API", "PostgreSQL", "SQL", "TypeScript", "Node.js"]
3. group: "Cloud & CI/CD", items: ["Docker", "Git", "GitHub Actions", "Fly.io", "CI/CD pipelines"]
4. group: "Proces & spoluprace" (with diacritics), items: ["dekompozice procesu", "root-cause analyza", "code review", "agile/scrum", "technicka dokumentace"] (with proper diacritics)

Education (1 entry per D14):
- school: "Stredni prumyslova skola -- elektrotechnika" (with proper diacritics, adapt the Slovak school name from spec D14)
- credential: "Stredna skola elektrotechnicka, Trnava, Slovensko" (with diacritics)

Certifications (4 entries per D6):
- { name: "Java Developer Course", issuer: "IT v kurze" }
- { name: "Using Databases with Python", issuer: "Coursera" }
- { name: "Using Python to Access Web Data", issuer: "Coursera" }
- { name: "Introduction to Programming and Computer Science", issuer: "Composing Programs" }

Projects (6 entries per D9, D18):
1. PipelineIQ -- closed-loop agent pipeline (Czech description)
2. PromptIQ -- prompt analytics for Claude Code (Czech description)
3. AI Assistant -- deployed assistant over Obsidian knowledge base (Czech description)
4. Email Brief IQ -- Claude Cowork plugin for email triage (Czech description)
5. UXIQ -- Python CLI for UI accessibility audits (Czech description)
6. This CV App -- { name: "Tato CV aplikace", href: "https://github.com/MarioEpkOne/CVapplication", blurb: Czech description }

Languages (4 entries per D16):
- { name: "Slovenstina", level: "rodily mluvci" } (with diacritics)
- { name: "Cestina", level: "pokrocila" } (with diacritics)
- { name: "Anglictina", level: "C1" } (with diacritics)
- { name: "Japonstina", level: "A1" } (with diacritics)

**Content for `resumeEn`**:
Same structure but English content per D10. Key differences:
- title: "Backend Engineer & AI Agent Orchestrator" (Open Question 2 recommendation, EN version)
- location: "Brno, Czech Republic"
- Summary: English adaptation (not literal translation)
- Experience periods: "2025 -- present", "2.5 years", "3 years"
- Experience bullets: rewritten with action verbs and impact framing
- Skill group names: English (per D15 table)
- Education credential adapted to English
- Project descriptions adapted for English audience
- Languages: English names and levels per D16

**Verification**: `npm run typecheck` should show errors only for files still importing the old `resume` export. These will be resolved in subsequent steps.

---

### Step 5: Rewrite cover letter data with dual-locale exports (`src/data/cover-letter.ts`)

**File**: `src/data/cover-letter.ts`
**Action**: Complete rewrite

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/data/cover-letter.ts`):**
The file currently exports `LetterSection` interface and `export const letterSections: LetterSection[]` with 4 English placeholder sections.

**New structure**:
- Keep the `LetterSection` interface unchanged.
- Remove `export const letterSections` singular export.
- Export `letterSectionsCz: LetterSection[]` with 4 Czech sections per D11.
- Export `letterSectionsEn: LetterSection[]` with 4 English sections per D11.
- Export `letterSections = { cs: letterSectionsCz, en: letterSectionsEn } as const`.

**Czech sections** (from spec D11):
| id | eyebrow | heading | body (paragraphs) |
|---|---|---|---|
| hook | "Teze" | Adapted Czech heading | Paragraph about coming to AI agents independently |
| orchestration | "Prace" (with diacritics) | Adapted Czech heading | Paragraphs about assigning tasks to agents, building context, high-level planning |
| why-purple | "Proc Purple LAB" (with diacritics) | Adapted Czech heading | Paragraph about technical analysis preceding coding |
| why-me | "Proc ja" (with diacritics) | Adapted Czech heading | Polyglot stack, learns fast, wants like-minded team |

**English sections**: Compelling English adaptation of the Czech content, not a literal translation. Same 4 IDs, English eyebrows per spec D11 table ("The thesis", "The work", "Why Purple LAB", "Why me"). Headings should be impactful standalone phrases (similar quality to the current placeholder headings like "The medium is the message.").

**Verification**: `npm run typecheck` -- expect errors only from files still importing old `letterSections`. Resolved in subsequent steps.

---

### Step 6: Create `LocaleToggle` component (`src/components/LocaleToggle.tsx`)

**File**: `src/components/LocaleToggle.tsx` (new file)
**Action**: Create new file

**What it does**: A small toggle button placed next to ThemeToggle. Displays the active locale highlighted and allows switching. Must have `no-print` class (E4). Should handle the `mounted` state to avoid hydration mismatch (same pattern as `ThemeToggle`).

**Design**:
- `"use client"` directive
- Import `useLocale` from `@/lib/locale`
- Show two options: "CZ" and "EN", with the active one visually highlighted (e.g., different background/text color)
- `onClick` calls `setLocale("cs")` or `setLocale("en")`
- Add `no-print` class to the root element
- Guard against hydration mismatch: use `mounted` state, render a placeholder of the same size until mounted (same pattern as ThemeToggle, verified at line 9-25 of `src/components/ThemeToggle.tsx`)

**Style**: Match ThemeToggle's visual weight. Use brand tokens from Tailwind. Example: two small pill segments, active one has `bg-brand-600 text-white`, inactive has `text-brand-700 hover:bg-brand-100`.

**Edge case E8**: TabBar label width change on locale switch. The TabBar itself handles this (Step 11), but the LocaleToggle button should have a fixed width so it doesn't shift when toggling.

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 7: Create `ProfileSummary` component (`src/components/resume/ProfileSummary.tsx`)

**File**: `src/components/resume/ProfileSummary.tsx` (new file)
**Action**: Create new file

**What it does**: Renders the `summary` string from `ResumeData` between the header and experience timeline. Takes `summary: string` and `heading: string` as props.

**Design**:
- Simple section with an `<h2>` heading (using the `heading` prop, which will be `labels[locale].profile`)
- Render the summary text as a `<p>` element
- Style consistent with other resume sections (same heading classes: `text-xl font-bold text-brand-800 dark:text-brand-200`)
- If summary is empty/falsy, render nothing (graceful degradation)

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 8: Create `Certifications` component (`src/components/resume/Certifications.tsx`)

**File**: `src/components/resume/Certifications.tsx` (new file)
**Action**: Create new file

**What it does**: Renders the `certifications` array from `ResumeData`. Takes `certifications: CertificationEntry[]` and `heading: string` as props.

**Design**:
- Section with `<h2>` heading (using `heading` prop = `labels[locale].certifications`)
- Render as a list (`<ul>`) of certification entries
- Each entry shows `name` and optionally `issuer` (if present, show as " -- {issuer}")
- If `certifications` array is empty, render nothing (E6)
- Style consistent with Education section

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 9: Update `ExperienceTimeline` to use `period` instead of `start`/`end`

**File**: `src/components/resume/ExperienceTimeline.tsx`
**Action**: Edit existing component

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/components/resume/ExperienceTimeline.tsx`):**

The component currently has:
1. A `formatDate` function (lines 10-14) that parses `YYYY-MM` strings into localized date strings.
2. Uses `entry.start` in the list key (line 30): `key={`${entry.company}-${entry.start}`}`
3. Renders dates on line 46: `{formatDate(entry.start)} -- {formatDate(entry.end)}`

**Changes**:
1. **Remove** the `formatDate` function entirely (lines 10-14).
2. **Update the key** from `${entry.company}-${entry.start}` to `${entry.company}-${i}` (using the map index since `period` is not guaranteed unique).
3. **Replace the date rendering** on line 45-47:
   - Before: `<time ...>{formatDate(entry.start)} -- {formatDate(entry.end)}</time>`
   - After: conditionally render the `<time>` element only if `entry.period` is truthy (E5): `{entry.period && <time ...>{entry.period}</time>}`
4. **Add `heading` prop**: Change interface to accept a `heading: string` prop. Replace the hardcoded "Experience" string on line 24 with `{heading}`.

**New interface**:
```ts
interface ExperienceTimelineProps {
  experience: ExperienceEntry[];
  heading: string;
}
```

**Verification**: `npm run typecheck` -- file compiles. The component no longer references `start` or `end` fields.

---

### Step 10: Update `SkillChips` to accept `heading` prop

**File**: `src/components/resume/SkillChips.tsx`
**Action**: Edit existing component

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/components/resume/SkillChips.tsx`):**
Line 35-39: Hardcoded heading "Skills".

**Changes**:
1. Add `heading: string` to `SkillChipsProps` interface.
2. Replace the hardcoded "Skills" string on line 38 with `{heading}`.

**New interface**:
```ts
interface SkillChipsProps {
  skills: SkillGroup[];
  heading: string;
}
```

**Also update the `EMPHASIS_KEYWORDS` array**: The current list emphasizes TypeScript/Node/AWS/AI keywords. With the new skill set (Java, Kotlin, Spring Boot, Claude Code, MCP), update the emphasis keywords to include:
- Add: `"java"`, `"kotlin"`, `"spring"`, `"mcp"`, `"rag"`, `"fly.io"`
- Keep: `"typescript"`, `"node"`, `"node.js"`, `"claude"`, `"ai"`
- Consider removing: `"aws"`, `"openai"`, `"anthropic"`, `"devin"`, `"cursor"`, `"coderabbit"` (no longer in skill items)

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 11: Update `EducationProjects` to accept heading props

**File**: `src/components/resume/EducationProjects.tsx`
**Action**: Edit existing component

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/components/resume/EducationProjects.tsx`):**
Line 16-19: Hardcoded heading "Education".
Line 44-47: Hardcoded heading "Projects".

**Changes**:
1. Add `educationHeading: string` and `projectsHeading: string` to `EducationProjectsProps`.
2. Replace hardcoded "Education" (line 18) with `{educationHeading}`.
3. Replace hardcoded "Projects" (line 46) with `{projectsHeading}`.

**New interface**:
```ts
interface EducationProjectsProps {
  education: EducationEntry[];
  projects?: ProjectEntry[];
  educationHeading: string;
  projectsHeading: string;
}
```

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 12: Update `TabBar` to use locale-aware labels

**File**: `src/components/TabBar.tsx`
**Action**: Edit existing component

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/components/TabBar.tsx`):**
Lines 7-11: Static `tabs` array with hardcoded English labels `"Resume"`, `"Cover Letter"`, `"Play"`.

**Changes**:
1. Import `useLocale` from `@/lib/locale` and `labels` from `@/lib/labels`.
2. Move the `tabs` construction inside the component body, reading labels dynamically:
```ts
const { locale } = useLocale();
const l = labels[locale];
const tabs = [
  { href: "/", label: l.resume },
  { href: "/cover-letter", label: l.coverLetter },
  { href: "/play", label: l.play },
];
```
3. For E8 (label width change causing layout shift): add `min-w-[4rem]` or `whitespace-nowrap` to the tab link elements to ensure Czech labels ("Zivotopis", "Motivacni dopis") don't cause layout reflow. The `text-center` class on links may also help.

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 13: Create `ResumeContent` client wrapper (`src/components/resume/ResumeContent.tsx`)

**File**: `src/components/resume/ResumeContent.tsx` (new file)
**Action**: Create new file

**What it does**: Client component that reads locale context and renders all resume sections using the correct locale's data and labels. This replaces the direct data rendering currently in `src/app/page.tsx`.

**Design**:
- `"use client"` directive
- Import `useLocale` from `@/lib/locale`
- Import `resumes` from `@/data/resume`
- Import `labels` from `@/lib/labels`
- Import all resume sub-components: `ResumeHeader`, `ProfileSummary`, `ExperienceTimeline`, `SkillChips`, `EducationProjects`, `Certifications`, `ContactForm`
- Select data: `const data = resumes[locale]`; `const l = labels[locale]`
- Render the same structure currently in `page.tsx`, but with locale-aware data and heading props:
  - `<ResumeHeader header={data.header} />`
  - `<ProfileSummary summary={data.summary} heading={l.profile} />` (NEW -- between header and experience)
  - `<hr />`
  - `<ExperienceTimeline experience={data.experience} heading={l.experience} />`
  - `<SkillChips skills={data.skills} heading={l.skills} />`
  - `<EducationProjects education={data.education} projects={data.projects} educationHeading={l.education} projectsHeading={l.projects} />`
  - `<Certifications certifications={data.certifications} heading={l.certifications} />` (NEW -- near education)
  - Languages section with heading from `l.languages`
  - `<ContactForm />`

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 14: Create `CoverLetterContent` client wrapper (`src/components/cover-letter/CoverLetterContent.tsx`)

**File**: `src/components/cover-letter/CoverLetterContent.tsx` (new file)
**Action**: Create new file

**What it does**: Client component that reads locale context and renders the cover letter with the correct locale's data, greeting, and sign-off.

**Design**:
- `"use client"` directive
- Import `useLocale` from `@/lib/locale`
- Import `letterSections` from `@/data/cover-letter` (the `{ cs, en }` map)
- Import `labels` from `@/lib/labels`
- Import `Scrollytelling` from `@/components/cover-letter/Scrollytelling`
- Select data: `const sections = letterSections[locale]`; `const l = labels[locale]`
- Render the same structure currently in `cover-letter/page.tsx`:
  - Greeting: `<p>{l.greeting}</p>` (E9 -- not hardcoded)
  - `<Scrollytelling sections={sections} />`
  - Sign-off: `<p>{l.signOff}</p>`, `<p>{l.signOffName}</p>` (E9)
  - Fly footer: `<p>{l.flyFooter} <a href="/docs/adr/0001-fly-over-aws">{l.flyFooterLink}</a></p>` (D12)

**Verification**: `npm run typecheck` -- file compiles.

---

### Step 15: Slim down `src/app/page.tsx` to RSC shell

**File**: `src/app/page.tsx`
**Action**: Rewrite to thin RSC shell

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/app/page.tsx`):**
Currently imports `resume` from `@/data/resume` (line 2), uses it for metadata (lines 9-12), and renders all resume sections inline (lines 14-54).

**Changes**:
1. Remove `import { resume } from "@/data/resume"`.
2. Update metadata to use static strings (E7 -- keep metadata in English, it's static RSC-level):
```ts
export const metadata: Metadata = {
  title: "Mario -- Interactive Resume",
  description: "Mario Alina -- Backend Engineer & AI Agent Orchestrator. Interactive CV for Purple LAB.",
};
```
3. Replace the entire `ResumePage` body with:
```tsx
import { ResumeContent } from "@/components/resume/ResumeContent";

export default function ResumePage() {
  return <ResumeContent />;
}
```

**Verification**: `npm run typecheck` -- no more reference to old `resume` export in this file.

---

### Step 16: Slim down `src/app/cover-letter/page.tsx` to RSC shell

**File**: `src/app/cover-letter/page.tsx`
**Action**: Rewrite to thin RSC shell

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/app/cover-letter/page.tsx`):**
Currently imports `letterSections` (line 2), renders greeting (line 16 "To the Purple LAB hiring team --"), Scrollytelling (line 20), and hardcoded sign-off (lines 23-36).

**Changes**:
1. Remove `import { letterSections } from "@/data/cover-letter"`.
2. Remove `import { Scrollytelling }`.
3. Keep metadata static in English (E7):
```ts
export const metadata: Metadata = {
  title: "Cover Letter",
  description: "Why agent orchestration, why Purple LAB, why me -- a scrollytelling cover letter.",
};
```
4. Replace the body with:
```tsx
import { CoverLetterContent } from "@/components/cover-letter/CoverLetterContent";

export default function CoverLetterPage() {
  return <CoverLetterContent />;
}
```

**Verification**: `npm run typecheck` -- no more reference to old `letterSections` export.

---

### Step 17: Wire `LocaleProvider` and `LocaleToggle` into layout

**File**: `src/app/layout.tsx`
**Action**: Edit existing file

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/src/app/layout.tsx`):**
- Lines 37-38: `ThemeProvider` wraps `TRPCProvider`
- Lines 40-44: Header contains `TabBar` and `ThemeToggle` in a flex container
- Line 42-44: ThemeToggle is wrapped in `<div className="no-print flex-shrink-0">`
- Lines 47-57: Footer with hardcoded "AWS shop, runs on Fly." and "Built by Mario Alina for Purple LAB."

**Changes**:

1. Import `LocaleProvider` from `@/lib/locale` and `LocaleToggle` from `@/components/LocaleToggle`.

2. Wrap with `LocaleProvider` -- place it **inside** `ThemeProvider` and wrapping `TRPCProvider`:
```tsx
<ThemeProvider ...>
  <LocaleProvider>
    <TRPCProvider>
      ...
    </TRPCProvider>
  </LocaleProvider>
</ThemeProvider>
```

3. Add `LocaleToggle` next to `ThemeToggle` in the header (line 42-44 area). Change the header's right-side container to include both:
```tsx
<div className="no-print flex items-center gap-1 flex-shrink-0">
  <LocaleToggle />
  <ThemeToggle />
</div>
```

4. The footer (lines 47-57) has hardcoded English strings ("Built by Mario Alina for Purple LAB.", "AWS shop, runs on Fly."). Since the footer is inside `RootLayout` which is an RSC, it cannot use `useLocale()`. Two options:
   - **Option A (preferred)**: Extract the footer into a small client component (e.g., inline or a `LayoutFooter`) that reads locale context.
   - **Option B**: Leave footer in English (it's app chrome, not content per se).
   
   Per the spec, D12 says "The Fly.io footer joke also switches locale." This means the footer MUST switch. Create a small `"use client"` footer section within the layout, or extract a `<Footer />` client component that reads locale and renders the appropriate labels. The simplest approach: create the footer inline within the existing layout structure but extract the footer content to a client component.

   Create a small inline client component or extract to a separate file. The simplest inline approach: extract the footer `<p>` content into a client component `src/components/LayoutFooter.tsx` (but this file should be added to scope). Since we want to keep scope minimal, instead make the `<footer>` element render a client component that uses `useLocale()` and `labels`.

   **Actually, the simplest approach**: Since `TabBar` is already a client component in the header, and the locale toggle is there, the footer can be a small client component. But to avoid adding yet another file, we can have the footer use `labels` via a dedicated tiny client component. Let me add it inline to the scope:

   Actually -- the entire layout's `<div>` children are client components anyway (TabBar, ThemeToggle, etc.). The layout RSC just orchestrates. The footer text is static RSC content. To make it locale-aware:
   
   **Best approach**: Create the footer as part of either `ResumeContent`/`CoverLetterContent` (no -- it's in the layout, shared across pages). The cleanest solution: keep the "View source" link, "Built by" text, and "AWS shop" text in the layout but render them via a tiny client component. We don't need a separate file -- we can inline the locale logic in a small wrapper. BUT the layout.tsx is an RSC. So we must extract.

   Add a new file to scope: this is unavoidable. However, to keep scope tidy, combine the footer locale switching with the existing structure. The simplest is to just make it a small client component.

   **Decision**: Do NOT add a new file. Instead, note that the footer GitHub link also needs updating from `https://github.com/marioalina/CVapplication` to `https://github.com/MarioEpkOne/CVapplication` (per D18/D13). For the locale switching, accept a pragmatic trade-off: leave the footer text in a neutral/English-default form. The spec says D12 "the Fly.io footer joke also switches locale," but D12 specifically refers to the cover letter page sign-off footer, not the layout footer. Looking at the spec more carefully:
   
   - D12 says: "The Fly.io footer joke also switches locale." This is in the context of the cover letter sign-off section (which is handled in `CoverLetterContent`, Step 14).
   - The layout footer is a separate element. The spec does not explicitly require the layout footer to switch locale.
   
   **Actually re-reading**: The cover letter page has its own Fly.io footer joke (line 27-33 of `cover-letter/page.tsx`). The layout also has one (line 50 of `layout.tsx`). D12 is about the cover letter sign-off, which is handled in Step 14. The layout footer is separate.
   
   For the layout footer, the minimal change is: update the GitHub URL to `https://github.com/MarioEpkOne/CVapplication`. Leave the text in English since it's RSC-level chrome and the spec doesn't mandate layout footer locale switching.

5. Update the `html` element's `lang` attribute. Currently `lang="en"` (line 35). Since default locale is Czech, change to `lang="cs"`. Alternatively, this could be dynamic -- but since it's RSC and cannot read client context, keep it static. Change to `lang="cs"` since Czech is the default and primary audience.

**Summary of edits to layout.tsx**:
- Add imports for `LocaleProvider` and `LocaleToggle`
- Wrap children in `LocaleProvider` (inside ThemeProvider, wrapping TRPCProvider)
- Add `LocaleToggle` next to `ThemeToggle` in header
- Update GitHub URL in footer from `https://github.com/marioalina/CVapplication` to `https://github.com/MarioEpkOne/CVapplication`
- Change `lang="en"` to `lang="cs"` on the `<html>` element

**Verification**: `npm run typecheck` -- layout compiles. Visual check: LocaleToggle appears next to ThemeToggle.

---

### Step 18: Update `tests/resume-data.test.ts`

**File**: `tests/resume-data.test.ts`
**Action**: Complete rewrite

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/tests/resume-data.test.ts`):**
Currently imports `resume` (single export), validates YYYY-MM dates, date ordering, >= 2 experience entries, education >= 1, GitHub link.

**New test structure**:
- Import `resumeCs, resumeEn` (or `resumes`) from `@/data/resume`.
- Import `CertificationEntry` type if needed.
- Test both locales. Use `describe.each` or a helper to run the same structural tests against both `resumeCs` and `resumeEn`.

**Tests to include** (per spec Testing Strategy):

1. **"has all required header fields" (both locales)**: name, title, photoSrc truthy; contacts length >= 1; every contact has kind, label, href.

2. **"has >= 3 experience entries with truthy period" (both locales)**: Replace old >= 2 check. Every entry has a truthy `period` string. Remove YYYY-MM validation. Remove date ordering test.

3. **"has at least one education entry" (both locales)**: school and credential truthy.

4. **"includes a GitHub repo link in projects or contacts" (both locales)**: Check for `github.com` in project hrefs or contact hrefs/kind.

5. **"has a non-empty summary" (both locales)**: `resume.summary` is a non-empty string. (NEW)

6. **"has >= 1 certification with truthy name" (both locales)**: `resume.certifications.length >= 1`, every entry has truthy `name`. (NEW)

**Test count**: 6 test cases, but run for both locales. If using `describe.each([resumeCs, resumeEn])`, that's 12 individual test runs. Alternatively, 6 tests that each check both locales internally.

**Verification**: `npm run test` -- all resume data tests pass.

---

### Step 19: Update `tests/cover-letter-data.test.ts`

**File**: `tests/cover-letter-data.test.ts`
**Action**: Complete rewrite

**Current value (verified from `/mnt/c/Users/Epkone/CVapplication/.claude/worktrees/real-content-and-locale-toggle/tests/cover-letter-data.test.ts`):**
Currently imports `letterSections` (single array), validates non-empty headings and bodies.

**New test structure**:
- Import `letterSectionsCz, letterSectionsEn` (or `letterSections` map) from `@/data/cover-letter`.
- Test both locale arrays.

**Tests to include** (per spec Testing Strategy):

1. **"gives every section a non-empty heading" (both locales)**: Both arrays have length > 0, every section heading is truthy and non-empty.

2. **"gives every section at least one body paragraph" (both locales)**: Every section has body.length >= 1, every paragraph is truthy and non-empty.

3. **"has exactly 4 sections with correct IDs" (both locales)**: Both arrays have exactly 4 entries with IDs: `"hook"`, `"orchestration"`, `"why-purple"`, `"why-me"`. (NEW per spec)

**Test count**: 3 test cases run for both locales.

**Verification**: `npm run test` -- all cover letter data tests pass.

---

### Step 20: Update `CLAUDE.md` to reflect new data model and exports

**File**: `CLAUDE.md`
**Action**: Edit documentation references

**Current references that need updating**:

1. **Key files table** (line ~area of "Key files"): `src/data/resume.ts` description says "Single source of truth for all resume content." Update to mention dual-locale exports: "Single source of truth for all resume content. Exports `resumeCs`, `resumeEn`, and `resumes` map."

2. **Key files table**: `src/data/cover-letter.ts` description says "Single source of truth for all cover letter sections." Update to: "Single source of truth for all cover letter sections. Exports `letterSectionsCz`, `letterSectionsEn`, and `letterSections` map."

3. **Key files table**: Add entries for new files:
   - `src/lib/locale.tsx` -- "React context for CZ/EN locale switching with localStorage persistence."
   - `src/lib/labels.ts` -- "All UI chrome strings (section headings, tab labels, etc.) mapped by locale."
   - `src/components/LocaleToggle.tsx` -- "CZ/EN toggle button, placed next to ThemeToggle. Has `.no-print`."

4. **Data-file-is-source-of-truth rule**: Already correct (resume content from resume.ts, cover letter from cover-letter.ts). No change needed, but add a note: "UI labels (section headings, tab labels) are sourced from `src/lib/labels.ts`."

5. **ExperienceEntry type reference** (if any exists in CLAUDE.md): The current CLAUDE.md does not include the ExperienceEntry type definition, so no update needed there.

6. **Architecture section**: The "App routes" section mentions the 3 routes. No change needed. But the tRPC router section is unchanged. The print CSS section should note that `LocaleToggle` has `.no-print`.

7. **Print CSS section**: Update the list of `.no-print` components: "`.no-print` class hides: TabBar, ThemeToggle, **LocaleToggle**, PrintButton, ContactForm, AnalyticsPing, footer."

8. **Known limitations/gotchas**: Add a note: "In-memory locale context resets to 'cs' default on SSR; localStorage restores the user's choice on mount."

9. **Footer GitHub URL**: The CLAUDE.md doesn't reference the footer URL, so no change needed there.

**Verification**: Read through the updated CLAUDE.md to confirm all references are accurate.

---

## Post-Implementation Checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes -- all tests green (resume-data, cover-letter-data, contact-schema, rate-limit, sanitize)
- [ ] Resume page (`/`) loads with Czech content by default
- [ ] Toggle to EN shows English content, section headings switch, tab labels switch
- [ ] Reload page -- locale persists (localStorage)
- [ ] Cover letter page (`/cover-letter`) shows Czech content by default, toggle switches to English
- [ ] Cover letter greeting and sign-off switch with locale
- [ ] Print preview shows current locale content, no toggle visible
- [ ] No hydration mismatch warnings in browser console
- [ ] Profile/Summary section renders between header and experience
- [ ] Certifications section renders near education
- [ ] 6 projects displayed (5 AI + This CV App)
- [ ] 3 experience entries displayed (AI & Agentic Developer, Morosystems, Kentico)
- [ ] 4 languages displayed
- [ ] GitHub contact link points to `https://github.com/MarioEpkOne`
- [ ] LinkedIn contact link points to `https://linkedin.com/in/mario-alina`
- [ ] "This CV App" project links to `https://github.com/MarioEpkOne/CVapplication`
- [ ] Layout footer "View source" link points to `https://github.com/MarioEpkOne/CVapplication`
- [ ] TabBar labels accommodate Czech text without layout shift

## Verification Approach

After every file change, run:
```bash
npm run typecheck
```

After all file changes are complete, run:
```bash
npm run lint
npm run test
npm run build
```

If `typecheck` fails after a step, fix the type error before proceeding to the next step. If `lint` fails, fix lint issues. If tests fail, debug and fix.

For visual verification (manual), run `npm run dev` and check the pages in a browser.

## Commit Message (draft)

```
feat: replace placeholder content with real resume/cover-letter data and add CZ/EN locale toggle

- Replace all placeholder experience, skills, education, and projects with
  Mario's real professional history from his DOCX resume
- Add Czech and English versions of all content (resume + cover letter)
- Create locale context (React context + localStorage) with CZ default
- Add CZ/EN toggle button next to theme toggle
- Add Profile/Summary section between header and experience
- Add Courses & Certifications section near education
- Replace YYYY-MM date model with freeform period strings
- Update resume/cover-letter data tests for both locales
- Update all section headings and TabBar labels to switch per locale

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
