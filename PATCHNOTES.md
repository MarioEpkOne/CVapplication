<!-- last-commit: d27e087c20802e86698decc9a9f8edb6fcb912ac -->
# Patch Notes

## v0.2.0 — 2026-06-01

### initial commit (spec + gitignore)
Bootstrapped the repository with the interactive-resume spec under `specs/` and a Node/Next.js-oriented `.gitignore`. Establishes the project baseline before any application code.

### scaffold interactive resume + cover letter work sample
Built the full greenfield app: a Next.js (App Router) + TypeScript site with three URL-routed tabs (Resume, Cover Letter, Play placeholder), data-driven resume and cover-letter content, and dark-mode theming on Purple's brand palette. Adds a hardened tRPC backend (`contact.submit` with honeypot, per-IP rate limiting, store-first-then-email via Resend, and graceful degradation; cookieless `analytics.track`) backed by Drizzle + SQLite, plus Docker/Fly.io deploy config, GitHub Actions CI/deploy, agent-context artifacts (CLAUDE.md, AGENTS.md, 4 ADRs), and 23 passing Vitest tests. This is the complete work sample for the Purple LAB application.
