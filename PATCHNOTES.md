<!-- last-commit: 5b90b643ab8c17b0119418ff35cab9d072723e1c -->
# Patch Notes

## v0.6.0 — 2026-06-02

### add Claude Code quality gate hooks for auto-format and pre-stop checks
Added automated quality gates via Claude Code hooks. A PostToolUse hook (`format-file.sh`) auto-formats TS/TSX files with ESLint `--fix` and Prettier after every Write/Edit/MultiEdit. A Stop hook (`verify.sh`) blocks task completion until typecheck, lint, and circular-dependency checks all pass. Installed prettier and madge as devDependencies, added a `deps:check` script for circular import detection, and wired everything in project-level `.claude/settings.json`.

### add fixer log for quality-gate-hooks audit
Added the fixer log from the quality-gate-hooks pipeline audit to version control for traceability.

### 2 audit errors resolved — lockfile sync and hook executable bits
Synced `package-lock.json` to include prettier and madge entries (fixing `npm ci` on fresh clones) and set hook scripts to mode 100755 in the git index via `git update-index --chmod=+x` (fixing execution on Linux/macOS where WSL's `core.fileMode=false` had silently dropped the executable bit).

## v0.5.0 — 2026-06-01

### add AstraZeneca and Global Payments projects to MoroSystems experience
Expanded the MoroSystems entry in the Resume's Experience timeline to showcase two commercial client projects — AstraZeneca's pharmaceutical distribution system and the Global Payments card-issuing platform — each with a description and its own technology chips, in both Czech and English. Introduced an optional nested `projects` field on the experience data model so the timeline component renders these per-project details without affecting any other entry.

## v0.4.0 — 2026-06-01

### move projects above education and add Get in Touch link in header
Reordered the resume layout so the Projects section appears ahead of Education, and added a "Get in touch" link to the header for quicker access to the contact form. Improves the resume's emphasis and navigation without changing any underlying content data.

### add real photo and rewrite cover letter content
Replaced placeholder imagery with a real profile photo and rewrote the cover letter copy in the cover-letter data source. Affects only the content layer (data files); rendering and structure are unchanged.

### remove AWS/Fly.io jokes and dead ADR link from UI
Cleaned up the user-facing copy by removing the AWS/Fly.io in-jokes and a dead ADR link from the UI. Tightens the presentation so the public work sample reads cleanly to a hiring audience.

### harden security — non-spoofable IP, analytics throttle, headers, email fix
Closed the gaps found in the security audit: the contact rate limiter now keys on Fly's non-spoofable `Fly-Client-IP` header (closing an XFF-spoofing bypass), the analytics endpoint is throttled and sanitized to prevent unbounded DB writes, five safe HTTP security headers were added (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy — no CSP), and contact notification emails now render plain text so apostrophes/ampersands no longer leak as HTML entities. Adds 14 new tests (47 total); no schema or dependency changes.

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
