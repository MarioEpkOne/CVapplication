<!-- last-commit: 68247018b893f9c1081d64893548faa85786f083 -->
# Patch Notes

## v0.12.0 — 2026-06-05

### handoff-fidelity fixes — dev CSP eval, chrome bar, brand icons
Brought the app into closer alignment with the approved design handoff and fixed a dev-only error. Resolved the Next.js `eval()` Content-Security-Policy error in development by extracting the CSP into `src/lib/csp.ts` and allowing `'unsafe-eval'` **only when `NODE_ENV` is not production** — the production policy stays strict (verified at runtime). Replaced the generic lucide `GitBranch`/`Link2` social stand-ins with real inline GitHub and LinkedIn brand SVGs (new `BrandIcons` module) across the hero, the print masthead, and the on-screen "Get in touch" list. Polished the top navigation to match the prototype (soft-shadow active pill, translucent hover, rounder corners, stronger blur) and unified the tabs with the locale + theme toggles into one cohesive chrome bar. Also fixed the Play-page trace console background from the old purple-black `#0f0a1a` to the new dark `#07141b`, and localized the footer (CZ/EN) via a new `SiteFooter` client component. No new dependencies.

## v0.11.0 — 2026-06-05

### route pipeline learnings to project KB
Added project-specific pipeline guidance to the local knowledge base (`.claude/pipeline-kb/planner.md` and `implementer.md`), capturing the doc-count/stale-fact and non-ASCII-glyph learnings as project KB rather than generic plugin learnings. Affects pipeline runs only — no application code change.

### cyan reskin + animated landing hero
Restyled the entire app from purple to a white/cyan theme (deep teal-navy dark mode) by swapping the `brand-*` design tokens in `globals.css`, which recolors all three routes, the OG image, and every component at once. Added a full-bleed animated landing hero on the home page — portrait with grayscale→colour hover, clip-path reveal, mouse-tilt parallax, staggered text, and magnetic CTAs — backed by a new `hero/` module (`useTilt`, `MagneticButton`, `Hero.module.css`). Swapped in a professional headshot (`portrait.png`) as the main photo and moved the satirical "Make AI Great Again" portrait to the Play page as a wink. All hero chrome is fully localized via `labels.ts` (CZ/EN), the hero is hidden in print in favor of a clean masthead, and all motion is gated on reduced-motion.

## v0.10.0 — 2026-06-04

### stateful Forex agent — persist positions + fix how-to auto-open
The "Ask the Agent" Play demo is now genuinely interactive. Positions you open or close persist across prompts and page reloads via a new DynamoDB session store (keyed by a per-browser session id, auto-expiring on a TTL) instead of being re-randomized on every call — so "close all my positions" actually sticks. The agent gains `close_all_positions` and `close_position` tools, `get_positions` now returns order ids, and new sessions start with two seeded demo positions. The system prompt was reworked to tell apart questions from instructions: asking "How do I open a position?" now explains the steps and offers to do it (and only acts once you confirm) rather than silently opening a trade — backed by capped conversation history persisted alongside positions. A matching preset was added, the offline mock agent became prompt-aware, and `CLAUDE.md` was updated to document the six Lambda tools. Requires an `sst deploy` to create the DynamoDB table and redeploy the Lambda.

## v0.9.1 — 2026-06-04

### generalize CV to remove company-specific references
Reworked the site so the resume and cover letter read as a general work sample rather than being aimed at one company: greetings, footer, the cover-letter "why" section (`why-purple` → `why-here`), project blurbs, SEO/OG metadata, and the living docs (README, AGENTS.md, CLAUDE.md, ADRs) were all reframed around generic engineering judgment. Internal pipeline artifacts (`specs/`, `Working Logs/`, `Implementation Plans/`, `learnings.md`) are now gitignored and untracked so they stop shipping to the remote. The purple brand palette is retained.

### align resume/cover-letter copy with the actual app
Fixed content-vs-reality gaps surfaced by a content audit. The EN résumé summary's "four years" is corrected to "three years" (the Czech "3 let" was already right), the live `/play` "Ask the Agent" demo is now mentioned — framed as work-in-progress — in both the résumé blurb and the cover-letter hook across both locales, and the English cover letter is reconciled to the canonical Czech structure. Also fixes several Czech typos and stray whitespace. Content-only: edits are limited to `src/data/resume.ts` and `src/data/cover-letter.ts`, the single source of truth for all copy.

## v0.9.0 — 2026-06-03

### read Lambda URL at runtime so the live frontend reaches it
The Play page was stuck in mock mode in production because `NEXT_PUBLIC_AGENT_URL` was read in a client component and inlined at build time, where the Fly runtime secret doesn't exist. The page now reads a plain (non-public) `AGENT_URL` per request in a `force-dynamic` server component and passes it to the widget, so changing the Lambda URL needs only a restart, not a rebuild.

### tweak CZ summary, drop a bullet, use real EN header photo
Content-only edits to the resume data file: a reworded Czech summary, one fewer bullet, and the real English header photo.

### gitignore SST-generated sst-env.d.ts files
Added the SST-generated `sst-env.d.ts` type files to the infra workspace's `.gitignore` so they no longer show up as untracked noise.

### clarify test layout in CLAUDE.md (tests/ not colocated; no RTL)
Documentation only — clarified that root tests live in `tests/` rather than colocated with source, and that there is no jsdom/React Testing Library setup.

### security-harden the agent Lambda + CSP, clear postcss advisory, quality cleanup
Closed the security gaps found in the app audit. The public "Ask the Agent" Lambda now rejects a missing or mismatched `Origin` in production (a new `REQUIRE_ORIGIN` flag) and enforces a best-effort per-IP rate limit (10 req/min) before any Groq call, so the paid inference endpoint is no longer an open, unmetered gateway. A pragmatic enforcing Content-Security-Policy header was added to the Next.js app, the transitive `postcss` advisory was cleared via an `overrides` pin (plus a Next 16.2.7 bump), and the LLM-controlled tool name is no longer logged verbatim. Also bundled quality cleanup: a real `lang` attribute for English visitors, a fixed polymorphic `Reveal`, an extracted `TechChip` component, named constants in the mock Forex tools, and removal of two dead exports.

### 1 audit error resolved — requireOrigin test coverage
Added the four `isOriginAllowed` `requireOrigin` assertions the spec mandated, so the production "reject a missing Origin" behavior now has direct automated coverage (infra suite: 18 tests).

## v0.8.1 — 2026-06-02

### make the agent Lambda actually deploy and stream
Fixed three bugs found while deploying the "Ask the Agent" Lambda to AWS. The Function URL CORS config listed `OPTIONS`, which the Lambda API rejects (method names must be ≤6 chars) and which is unnecessary since preflight is automatic — narrowed to `POST`. Response streaming was never actually on because `url.invokeMode` is not a valid SST property; it's now enabled via the top-level `streaming: true`, so the live trace streams chunk-by-chunk instead of returning only the first event. And the Groq Llama 3.3 70B calls now use `temperature: 0` (with a one-shot retry on `tool_use_failed`) to stop the model from intermittently emitting malformed tool calls. The Lambda is verified live end-to-end across all four preset prompts.

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
Built the full greenfield app: a Next.js (App Router) + TypeScript site with three URL-routed tabs (Resume, Cover Letter, Play placeholder), data-driven resume and cover-letter content, and dark-mode theming on a purple brand palette. Adds a hardened tRPC backend (`contact.submit` with honeypot, per-IP rate limiting, store-first-then-email via Resend, and graceful degradation; cookieless `analytics.track`) backed by Drizzle + SQLite, plus Docker/Fly.io deploy config, GitHub Actions CI/deploy, agent-context artifacts (CLAUDE.md, AGENTS.md, 4 ADRs), and 23 passing Vitest tests. This is the complete work sample for the job application.
