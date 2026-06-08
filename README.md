# Mario Alina - Interactive Resume

> A work sample that is the argument.

This is a deliberately over-engineered interactive resume + cover letter, built as a job-application work sample. It uses a modern TypeScript application-layer stack - Next.js, Tailwind, tRPC - while being deployed on Fly.io.

---

## What's here

| Tab | URL | What it is |
|-----|-----|-----------|
| Resume | `/` | Data-driven CV — all content from `src/data/resume.ts` |
| Cover Letter | `/cover-letter` | Scrollytelling letter — content from `src/data/cover-letter.ts` |
| Play | `/play` | "Ask the Agent" — a live serverless agent (AWS Lambda + Groq Llama 3.3 70B) that answers questions about Mario, with an offline mock fallback |

### Features
- **Print-to-PDF**: browser print with CSS that hides UI chrome and forces light colors
- **Dark mode**: default light (`#ffffff` brand background, cyan accent), toggle persists to localStorage
- **Cookieless analytics**: first-party pageview tRPC ping to SQLite — no third-party, no cookie banner
- **OG image**: branded cyan gradient card via `next/og`
- **Vitest suite**: covers sanitization, rate-limit, and data integrity

---

## Quickstart

```bash
npm install
cp .env.example .env.local  # Fill in values
npm run dev                  # http://localhost:3000
```

```bash
npm run db:generate          # Generate SQL migration from schema
npm run db:migrate           # Apply migrations to ./data/app.db
npm test                     # Run the Vitest suite
npm run build                # Production build → .next/standalone
```

---

## Deployment (Fly.io)

1. `flyctl launch` (first time) — uses `fly.toml` in this repo
2. `flyctl volumes create data --size 1` — SQLite volume
3. `flyctl secrets set NEXT_PUBLIC_SITE_URL=...`
4. Push to `main` → GitHub Actions → `flyctl deploy --remote-only` (needs `FLY_API_TOKEN` secret)

Migration runs automatically on container start via `scripts/start.sh` → `scripts/migrate.mjs`.

*Built by Mario Alina — June 2026*
