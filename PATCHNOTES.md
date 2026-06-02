<!-- last-commit: f8662d113fd6a5abc2634905d4ca27f1b629d9f6 -->
# Patch Notes

## v0.8.0 — 2026-06-02

### convert start.sh to LF and point fly.toml at mario-portfolio
Fixed a Fly.io crash-loop (exit 127, `./scripts/start.sh: not found`) caused by CRLF line endings on the container entrypoint — Linux was trying to exec `/bin/sh\r`. The script is now LF and a `.gitattributes` rule (`*.sh text eol=lf`) prevents recurrence. The Fly app was also renamed to `mario-portfolio`.

### reformat CLAUDE.md header + add WSL2 tooling
Aligned the CLAUDE.md header with the standard Claude Code format and documented the WSL2 dev-environment tooling (AWS CLI v1, SST v4.15) used by the Play page backend, plus the `test:watch` command. Developer-facing context only — no code changes.

### add "Ask the Agent" serverless Forex agent demo on Play page
Replaced the Play page "Coming soon" placeholder with an interactive "Ask the Agent" widget backed by a real AWS Lambda (deployed via SST, `eu-central-1`). The Lambda runs a bounded Groq Llama 3.3 70B tool-calling loop over four mock Forex tools and streams a live NDJSON trace; the frontend renders it as a terminal-style timeline and silently falls back to a deterministic offline mock agent when the Lambda is unreachable or `NEXT_PUBLIC_AGENT_MODE=mock`. The new `infra/` SST workspace is fully decoupled from the Next.js build, and the GitHub Actions workflow now deploys the Lambda alongside the Fly.io app.

### 2 audit errors resolved — cold-start fallback signal + dev CORS origin
Fixed the cold-start fallback path, which reused an already-aborted `AbortController` and left the widget stuck in a streaming state with an empty trace — it now allocates a fresh controller for the mock fallback. Also added the `http://localhost:3000` dev origin to the Lambda's CORS allowlist for non-prod stages (D16).

## v0.7.0 — 2026-06-02

### remove contact form; social links only, drop email + Resend
Removed the server-backed contact form end to end — the UI component, the tRPC `contact.submit` mutation, its Zod validation, the Resend email service, and the `contact_messages` table (dropped via a forward migration) — eliminating the entire spam and email-deliverability surface rather than hardening it. The publicly exposed email address was removed from the resume header in both locales, and the bottom "Get in touch" section now shows GitHub + LinkedIn links only, sourced from the resume data file. The `resend` dependency was dropped; analytics, the shared rate limiter, and `sanitizeText` are unaffected.

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
