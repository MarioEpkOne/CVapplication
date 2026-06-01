<!-- last-commit: c471115de429ffb4f46824221e2a7e5b6d637153 -->
# Patch Notes

## v0.3.0 — 2026-06-01

### add fixer log for real-content-and-locale-toggle audit
Added pipeline artifacts (fixer log and applied spec) to version control for traceability of the locale-toggle implementation pipeline run.

### complete interactive resume + cover letter application
Committed the full application source that was previously unstaged on main — all components, server routes, styles, config, tests, and pipeline artifacts (implementation plan, working log, audit, learnings). This establishes the complete baseline before the locale feature branch merges in.

### replace placeholder content with real resume/cover-letter data and add CZ/EN locale toggle
Replaced all fabricated placeholder content with Mario's real professional history and cover letter. Added a CZ/EN locale system (React context + localStorage persistence, default Czech) with a toggle button next to the theme switcher. Restructured data exports to dual-locale (`resumeCs`/`resumeEn`, `letterSectionsCz`/`letterSectionsEn`), added Profile/Summary and Courses & Certifications sections, switched experience dates to freeform period strings, and updated all rendering components to accept locale-driven labels. Tests expanded to validate both locales (33 total).

### 3 audit errors resolved
Fixed two Czech diacritic typos (greeting "tyme" → "týme", skill "procesu" → "procesů") and updated the stale test count in CLAUDE.md from 23 to 33.

## v0.2.0 — 2026-06-01

### initial commit (spec + gitignore)
Bootstrapped the repository with the interactive-resume spec under `specs/` and a Node/Next.js-oriented `.gitignore`. Establishes the project baseline before any application code.

### scaffold interactive resume + cover letter work sample
Built the full greenfield app: a Next.js (App Router) + TypeScript site with three URL-routed tabs (Resume, Cover Letter, Play placeholder), data-driven resume and cover-letter content, and dark-mode theming on Purple's brand palette. Adds a hardened tRPC backend (`contact.submit` with honeypot, per-IP rate limiting, store-first-then-email via Resend, and graceful degradation; cookieless `analytics.track`) backed by Drizzle + SQLite, plus Docker/Fly.io deploy config, GitHub Actions CI/deploy, agent-context artifacts (CLAUDE.md, AGENTS.md, 4 ADRs), and 23 passing Vitest tests. This is the complete work sample for the Purple LAB application.
