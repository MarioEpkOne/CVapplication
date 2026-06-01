# Working Log: Real Resume & Cover Letter Content + CZ/EN Locale Toggle
**Date**: 2026-06-01
**Worktree**: .claude/worktrees/real-content-and-locale-toggle/
**Impl plan**: Implementation Plans/impl--2026-06-01--19-28--real-content-and-locale-toggle.md

## Changes Made

- `src/data/resume.types.ts`: Replaced `start`/`end` fields on `ExperienceEntry` with `period: string`. Added `CertificationEntry` interface. Added `summary` and `certifications` fields to `ResumeData`.
- `src/data/resume.ts`: Complete rewrite — removed single `resume` export, added `resumeCs: ResumeData`, `resumeEn: ResumeData`, and `resumes = { cs, en }` map with real Mario Alina professional content.
- `src/data/cover-letter.ts`: Complete rewrite — removed single `letterSections` array export, added `letterSectionsCz`, `letterSectionsEn`, and `letterSections = { cs, en }` map with real cover letter content.
- `src/lib/locale.tsx` (new): React context for CZ/EN locale switching with localStorage persistence. Exports `Locale` type, `LocaleProvider`, and `useLocale()` hook.
- `src/lib/labels.ts` (new): All UI chrome strings (section headings, tab labels, greeting, sign-off, footer text) mapped by `cs` and `en` locale.
- `src/components/LocaleToggle.tsx` (new): CZ/EN toggle button with `no-print` class and hydration-mismatch guard matching ThemeToggle pattern.
- `src/components/resume/ProfileSummary.tsx` (new): Summary/profile section rendered between header and experience.
- `src/components/resume/Certifications.tsx` (new): Certifications section rendered near education.
- `src/components/resume/ResumeContent.tsx` (new): Client wrapper that reads locale context and renders all resume sections with locale-correct data and headings.
- `src/components/cover-letter/CoverLetterContent.tsx` (new): Client wrapper that reads locale context and renders the cover letter with locale-correct sections, greeting, and sign-off.
- `src/components/resume/ExperienceTimeline.tsx`: Removed `formatDate` function. Updated key to use index. Replaced date rendering with conditional `{entry.period}`. Added `heading: string` prop.
- `src/components/resume/SkillChips.tsx`: Added `heading: string` prop. Updated `EMPHASIS_KEYWORDS` to include Java, Kotlin, Spring, MCP, RAG, Fly.io. Removed AWS, OpenAI, Anthropic, Devin, Cursor, CodeRabbit.
- `src/components/resume/EducationProjects.tsx`: Added `educationHeading: string` and `projectsHeading: string` props replacing hardcoded strings.
- `src/components/TabBar.tsx`: Now reads `useLocale()` and `labels` to render locale-aware tab labels. Added `whitespace-nowrap` to prevent layout shift with longer Czech labels.
- `src/app/layout.tsx`: Added `LocaleProvider` (inside ThemeProvider, wrapping TRPCProvider), added `LocaleToggle` next to `ThemeToggle`, updated GitHub URL to `https://github.com/MarioEpkOne/CVapplication`, changed `lang="en"` to `lang="cs"`.
- `src/app/page.tsx`: Replaced all inline resume rendering with thin RSC shell importing `ResumeContent`. Static metadata.
- `src/app/cover-letter/page.tsx`: Replaced all inline cover letter rendering with thin RSC shell importing `CoverLetterContent`. Kept static metadata.
- `tests/resume-data.test.ts`: Complete rewrite — tests both `resumeCs` and `resumeEn` using `describe.each`. Tests: required header fields, >= 3 experience entries with truthy period, at least one education entry, GitHub link, non-empty summary, >= 1 certification with truthy name.
- `tests/cover-letter-data.test.ts`: Complete rewrite — tests both `letterSectionsCz` and `letterSectionsEn`. Tests: non-empty headings, at least one body paragraph per section, exactly 4 sections with correct IDs.
- `CLAUDE.md`: Updated key files table with new files and dual-locale export descriptions. Added UI labels note to data-file rule. Added LocaleToggle to Print CSS list. Added locale context reset gotcha to known limitations.

## Errors Encountered

- **`npm run test` — pre-existing**: `@rolldown/binding-linux-x64-gnu` native module missing in WSL environment. Same failure exists on main branch. This is a WSL native binary issue unrelated to this feature. User must run tests from a non-WSL environment or reinstall with `npm i` after clearing node_modules with proper native binary support.
- **`npm run build` — pre-existing**: `lightningcss.linux-x64-gnu.node` native module missing. Same root cause as test failure. The `lightningcss` package has no `.node` binary files at all in `node_modules/lightningcss/`. Build distributable is stale. To produce a valid build, run `npm run build` on Windows (PowerShell) or in Docker — not in WSL with the current node_modules.
- No other errors encountered. All 20 steps completed successfully.

## Deviations from Plan

- **Step 3 Czech diacritics**: The plan noted the label values in the illustrative example were missing diacritics and said "use proper Czech diacritics from the spec's D4 section." Implemented with full diacritics: "Zkušenosti", "Vzdělání", "Životopis", "Motivační dopis", "Hřiště", "Vážený tyme", "upřímným nadšením", "běží", "Zeptejte se proč", "Vytvořil", "zdrojový kód", etc.
- **Step 17 layout footer locale switching**: The plan's deliberation concluded that the layout footer's "Built by" and "AWS shop" text should remain English (D12 refers to the cover letter sign-off footer, not the layout footer). The layout footer was kept in English with only the GitHub URL updated. This matches the plan's final decision.

## Verification

- **Typecheck**: PASS — `npm run typecheck` exits 0 with zero errors
- **Lint**: PASS — `npm run lint` exits 0 with zero warnings
- **Tests**: INCOMPLETE — pre-existing WSL native binary failure (`@rolldown/binding-linux-x64-gnu` missing); identical failure exists on main branch before this change. Tests are structurally correct (TypeScript compiles cleanly).
- **Build**: INCOMPLETE — pre-existing WSL native binary failure (`lightningcss.linux-x64-gnu.node` missing). Must run from non-WSL environment.
- **Runtime behavior (static analysis)**:
  - Czech content verified in `resumeCs`: 3 experience entries (vlastní projekty, Morosystems, Kentico), 4 skill groups, 1 education entry, 4 certifications, 6 projects including "Tato CV aplikace" linking to `https://github.com/MarioEpkOne/CVapplication`, 4 languages
  - English content verified in `resumeEn`: matching structure with English labels and content
  - GitHub contact: `https://github.com/MarioEpkOne` in both locales
  - LinkedIn contact: `https://linkedin.com/in/mario-alina` in both locales
  - Layout footer GitHub URL: `https://github.com/MarioEpkOne/CVapplication`
  - LocaleToggle has `no-print` class in both mounted and placeholder states
  - TabBar uses `whitespace-nowrap` for layout stability with Czech labels
  - `lang="cs"` on `<html>` element
  - `LocaleProvider` wraps `TRPCProvider` inside `ThemeProvider` in layout

## Post-Implementation Checklist

- [x] `npm run typecheck` passes with zero errors
- [x] `npm run lint` passes with zero warnings
- [ ] `npm run build` succeeds — DEFERRED: pre-existing WSL native binary failure; run `npm run build` from Windows PowerShell or Docker
- [ ] `npm run test` passes — DEFERRED: pre-existing WSL native binary failure (same failure on main); run from non-WSL environment
- [ ] Resume page (`/`) loads with Czech content by default — requires runtime/visual check
- [ ] Toggle to EN shows English content, section headings switch, tab labels switch — requires runtime/visual check
- [ ] Reload page — locale persists (localStorage) — requires runtime/visual check
- [ ] Cover letter page (`/cover-letter`) shows Czech content by default, toggle switches to English — requires runtime/visual check
- [ ] Cover letter greeting and sign-off switch with locale — requires runtime/visual check; implemented in CoverLetterContent via `labels[locale].greeting`, `labels[locale].signOff`, `labels[locale].signOffName`
- [ ] Print preview shows current locale content, no toggle visible — requires runtime/visual check; LocaleToggle has `no-print` class confirmed
- [ ] No hydration mismatch warnings in browser console — requires runtime/visual check; LocaleProvider guards with default "cs" before mount
- [x] Profile/Summary section renders between header and experience — ProfileSummary placed before ExperienceTimeline in ResumeContent
- [x] Certifications section renders near education — Certifications placed after EducationProjects in ResumeContent
- [x] 6 projects displayed (5 AI + This CV App) — verified in resumeCs and resumeEn data
- [x] 3 experience entries displayed (AI & Agentic Developer, Morosystems, Kentico) — verified in resume data
- [x] 4 languages displayed — verified in resume data
- [x] GitHub contact link points to `https://github.com/MarioEpkOne` — verified in resume data contacts
- [x] LinkedIn contact link points to `https://linkedin.com/in/mario-alina` — verified in resume data contacts
- [x] "This CV App" project links to `https://github.com/MarioEpkOne/CVapplication` — verified in resume data projects
- [x] Layout footer "View source" link points to `https://github.com/MarioEpkOne/CVapplication` — verified in layout.tsx
- [x] TabBar labels accommodate Czech text without layout shift — `whitespace-nowrap` added to tab links
