# Spec — Interactive Resume + Cover Letter for Purple LAB

**Date:** 2026-06-01
**Status:** Ready for implementation planning
**Author:** Mario (via spec interview)
**Audience for the artifact:** The hiring team at Purple LAB (Purple Technology), Brno.

---

## Goal

Build a small, polished, deliberately-over-engineered personal web app that doubles as a **work sample** for a developer role at Purple LAB — a role centered on *orchestrating and reviewing AI coding agents* rather than hand-writing code. The app is an interactive resume + cover letter with a placeholder for a future "Agent Orchestrator" mini-game.

The app must:

1. Present Mario's CV (data-driven, from a TypeScript file) and an interactive cover letter that argues the agent-orchestration thesis.
2. Mirror Purple's *application-layer* stack (TypeScript, Next.js/React, TailwindCSS, tRPC) so the codebase itself reads as familiar to them — while being honestly, self-awarely deployed on **Fly.io** instead of AWS.
3. Ship "context as infrastructure for agents" artifacts (`CLAUDE.md`, `AGENTS.md`, ADRs) as **first-class deliverables**, because that is exactly the discipline the role values.
4. Be **finishable** for a job application: scope is biased toward "polished and complete" over "sprawling." The mini-game is explicitly deferred to a future spec.

**Why:** The medium is the message. A clean, well-documented, agent-friendly repo that ships a charming product on a real CI/CD pipeline demonstrates the exact skills the role asks for, better than any prose claim could.

---

## Current State

The working directory `C:\Users\Epkone\CVapplication` is **empty** — a greenfield project. No source files, no git repository, no `specs/` directory (created during this session for this document). There are no existing conventions, architecture, or constraints to reconcile against; this spec defines everything from scratch.

---

## Decisions

Every decision below was made during the interview, with rationale.

### Product scope

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Three URL-routed tabs: Resume, Cover Letter, Play.** | As envisioned. URL-routed (not in-page state) so each is shareable/deep-linkable and SSR-friendly. |
| D2 | **The "Agent Orchestrator" mini-game is DEFERRED to a future spec.** The Play tab ships as a minimal, tasteful "Coming soon" placeholder. | User wants the application to "look good" first, then design the game properly. Avoids a half-built centerpiece. |
| D3 | **Play placeholder is minimal** — a single tasteful "Coming soon" line/card, not an elaborate teaser or mockup. | Lowest effort; keeps focus on the finished resume + letter. (See Open Questions for the optional richer teaser.) |
| D4 | **Root `/` = Resume**, with `/cover-letter` and `/play`. No separate hero/landing. | The resume is what they came for; don't gate it behind a splash. Persistent top tab bar with animated transitions. |
| D5 | **Contact / CTA included**, as a frictionless form (no visitor login) posting via a tRPC mutation. | Gives the hiring team a one-click way to respond, and provides a real side-effecting backend mutation to showcase. |

### Content & tone

| # | Decision | Rationale |
|---|----------|-----------|
| D6 | **CV content: schema + realistic placeholders now; Mario fills real content later.** All resume blocks are in scope: Header (photo + name + title + contact), Experience timeline, grouped Skill chips, Education + projects/links. | Unblocks building immediately; content is data-only and swappable without touching components. |
| D7 | **Cover letter: scrollytelling**, 4–6 short scroll-revealed sections (Framer Motion). Structural sections defined; **Mario writes the copy himself.** Through-line = agent orchestration. | Skimmable, animated, memorable. Content is Mario's to own. |
| D8 | Cover-letter section *skeleton*: (1) Hook/thesis, (2) Why agent orchestration, (3) Why Purple (FinTech/serverless), (4) Why me / proof. Sections are config-driven so Mario can add/remove/reorder. | Captures the intended narrative arc; flexible to his final copy. |
| D9 | **Tone: confident, witty, with an occasional wink.** Professional by default; deliberate jokes (the "AWS shop, runs on Fly" bit; the Play teaser) that serve the point, never replace substance. | Charm without undercutting a real application. |
| D10 | **English only.** No i18n machinery. | Purple operates in English; i18n is overhead for a one-off site. (Optional Czech easter-egg left to Mario's discretion, not a build requirement.) |
| D11 | **Photo slot: Resume header, left of name/title/contact.** Circular/rounded. Flows naturally into the PDF. | Classic CV layout; single canonical location. |

### Technical

| # | Decision | Rationale |
|---|----------|-----------|
| D12 | **Next.js (App Router) + TypeScript**, TailwindCSS + shadcn/ui, Framer Motion, tRPC. | Mirrors Purple's FE stack; intentional. |
| D13 | **Drizzle + SQLite on a Fly volume.** Not Postgres. | Simplest persistence that still tells a real "I shipped stateful infra" story for a tiny dataset. (ADR documents the choice; future game spec may revisit.) |
| D14 | **DB scope now = `contact_messages` table + `pageviews` table only.** Leaderboard table is deferred to the future game spec (added via a new migration then). | No dead/unused tables in this spec. |
| D15 | **PDF download = print CSS + `window.print()`.** No PDF library. | Zero deps; always matches the live page; the data file is the single source. (ADR documents the tradeoff vs. server-side react-pdf.) |
| D16 | **Contact form: store in SQLite + send a notification email to Mario via Resend.** Visitor never logs in. | Resilient (message persisted even if email fails); real notification so Mario learns of interest. Resend = lowest friction, good deliverability, pairs with the custom domain. |
| D17 | **Analytics = own tRPC pageview ping → SQLite** (`{path, ts, referrer}`). No third-party script, no cookies. | Privacy-friendly, no cookie banner, reinforces "I run my own backend." Read via a simple admin query. |
| D18 | **Spam/abuse hardening on the contact endpoint: honeypot field + per-IP rate limit + zod validation with length caps + sanitization.** No CAPTCHA. | Sufficient for a site only a handful of people will see; no visitor friction. |
| D19 | **Agent-context artifacts: rich `CLAUDE.md` + `AGENTS.md` (cross-tool standard) + 3–4 real ADRs.** **No `.cursor/rules`** — Mario uses Claude Code, not Cursor; faking Cursor config would be inauthentic. `AGENTS.md` gives the tool-agnostic "context as infra for *any* agent" signal honestly. | Honest reflection of Mario's workflow; still signals multi-agent context discipline. |
| D20 | **Dark mode: in, default light** (Purple's `#f5ecff` brand for first impression). Toggle persisted in `localStorage`; respects `prefers-color-scheme` on first visit only if no stored preference. | On-brand first impression + polish signal. |
| D21 | **Social link preview: custom OG image + full metadata.** Branded purple OG image with name + "Interactive resume for Purple LAB." | High ROI — the link looks intentional the moment it's pasted in Slack/email/LinkedIn. |
| D22 | **Vitest now covers: contact input zod schema, name/message sanitization, per-IP rate-limit logic, and resume-data integrity** (required fields present, valid/ordered dates). Game-scoring tests deferred with the game. | Tests real logic that exists now; keeps CI meaningful, not theater. |
| D23 | **Custom domain** (name TBD by Mario), pointed at Fly; gives Resend a verifiable sender domain and clean OG URLs. Build reads the canonical URL from env so the domain can be finalized late. | Professional link; unblocks build before the domain is registered. |
| D24 | **Docker + Fly.io**, single region near Brno (`fra` or `waw`). GitHub Actions: push to `main` → `flyctl deploy`. | As specified; the "runs on Fly" self-aware joke is intentional. |

---

## Technical Design

> Code sketches here are **illustrative** — they show intent, not a normative implementation. Where any sketch conflicts with the **Edge Cases & Error Handling** table, the Edge Cases table wins.

### Architecture overview

```
Next.js (App Router, TS) on Fly.io (single machine, region fra/waw)
├── App routes (RSC + client components)
│   ├── /              → Resume      (default tab)
│   ├── /cover-letter  → Cover Letter (scrollytelling)
│   └── /play          → "Coming soon" placeholder
├── tRPC router (route handler at /api/trpc/[trpc])
│   ├── contact.submit   (mutation)  → validate → sanitize → rate-limit → insert SQLite → Resend email
│   └── analytics.track  (mutation)  → insert pageview into SQLite
├── Drizzle ORM → SQLite file on a mounted Fly volume (e.g. /data/app.db)
└── Print CSS for PDF (window.print()), custom OG image, dark-mode theming
```

### Routing & layout

- `app/layout.tsx`: global shell — persistent top **tab bar** (Resume | Cover Letter | Play), dark-mode toggle, theme provider, fonts, metadata defaults.
- Tab transitions via Framer Motion (e.g. `AnimatePresence` keyed on pathname, or a template route). Respect `prefers-reduced-motion`.
- Each tab is its own route segment so it is deep-linkable and SSR-rendered.
- Contact form lives as a section/anchor on the Resume route (or a small modal launched from the header CTA) — implementer's choice, but it must be reachable from the Resume tab.

### Resume (data-driven)

Single typed data module is the source of truth:

```ts
// src/data/resume.ts  (illustrative shape)
export interface ResumeData {
  header: {
    name: string;
    title: string;
    photoSrc: string;          // public/ path; circular in header, flows into PDF
    location?: string;
    contacts: { kind: 'email'|'github'|'linkedin'|'website'; label: string; href: string }[];
  };
  experience: {
    company: string;
    role: string;
    start: string;             // ISO 'YYYY-MM'
    end: string | 'present';
    bullets: string[];
    tech?: string[];
  }[];
  skills: { group: 'Languages'|'Cloud/AWS'|'AI tooling'|'Frontend'|string; items: string[] }[];
  education: { school: string; credential: string; start?: string; end?: string }[];
  projects?: { name: string; href?: string; blurb: string }[];
  languages?: { name: string; level: string }[];
}

export const resume: ResumeData = { /* realistic placeholders; Mario replaces */ };
```

- **Header** component: photo (left) + name/title + contact links + **Download PDF** button (`onClick={() => window.print()}`).
- **Experience timeline**: animated vertical timeline; reveal-on-scroll (Framer Motion), reduced-motion friendly.
- **Skill chips**: grouped chips; emphasis styling on TS/Node/AWS/AI items.
- **Education + projects/links**: includes a link to this repo's GitHub.
- Components render purely from `resume.ts`; no hard-coded content in JSX.

### Cover letter (scrollytelling)

```ts
// src/data/cover-letter.ts (illustrative)
export interface LetterSection {
  id: 'hook'|'orchestration'|'why-purple'|'why-me'|string;
  eyebrow?: string;
  heading: string;
  body: string[];     // paragraphs (Mario writes these)
}
export const letterSections: LetterSection[] = [ /* skeleton per D8; copy TBD */ ];
```

- Sections rendered in order; each is a scroll-reveal block (Framer Motion `whileInView`).
- The "AWS shop, runs on Fly" wink lives here and/or in the footer (per D9 tone).

### Play placeholder

- Minimal route rendering a tasteful "Coming soon — Agent Orchestrator" card (per D3). One line of copy, on-brand styling, optional subtle animation. No game logic, no leaderboard table.

### tRPC API surface

```
contact.submit({ name, email, message, company?, honeypot }) -> { ok: true }
analytics.track({ path, referrer? })                         -> { ok: true }
```

- tRPC route handler mounted at `app/api/trpc/[trpc]/route.ts`.
- `contact.submit` pipeline: zod validate → honeypot check → per-IP rate-limit → sanitize → Drizzle insert into `contact_messages` → fire Resend email (failure-tolerant, see edge cases).
- `analytics.track` called once per route view (client effect on mount), fire-and-forget.

### Data layer (Drizzle + SQLite)

```ts
// schema (illustrative)
contact_messages: { id, name, email, message, company?, createdAt, ip?, userAgent? }
pageviews:        { id, path, referrer?, createdAt }
// leaderboard: NOT in this spec — added by the future game migration.
```

- SQLite file on a **mounted Fly volume** (e.g. `/data/app.db`); path from env.
- Drizzle migrations run on deploy/startup (e.g. a release/start step) so a fresh volume is initialized.

### Email (Resend)

- Server-side only. API key as a Fly secret (`RESEND_API_KEY`). Sender from the verified custom domain (fallback to Resend onboarding domain until DNS is verified).
- Sends a plain notification to Mario's address with the submitted fields.

### Theming / dark mode

- Tailwind theme tokens seeded from Purple's palette; light background `#f5ecff`, purple accents (exact tokens Mario pulls from their site via DevTools).
- `class`-based dark mode; toggle persists to `localStorage`; first-visit falls back to `prefers-color-scheme`.

### Metadata / OG

- Per-route `metadata` (title/description). Custom branded OG image (static asset or `next/og` route). Canonical base URL from env (`NEXT_PUBLIC_SITE_URL`) so it tracks the final domain.

### Deployment

- `Dockerfile` (multi-stage, standalone Next.js output).
- `fly.toml`: single machine, region `fra` (or `waw`), a mounted volume for `/data`.
- `.github/workflows/deploy.yml`: on push to `main` → `flyctl deploy` (uses `FLY_API_TOKEN` secret).
- Secrets: `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL` (or build arg), DB path, Fly token.

### Repo / agent-context artifacts (first-class)

- `CLAUDE.md` — architecture, conventions, commands (dev/build/test/deploy), gotchas, the data-file-is-source-of-truth rule, how migrations run, how secrets/env work.
- `AGENTS.md` — tool-agnostic agent guidance (cross-tool standard).
- `docs/adr/` — 3–4 ADRs:
  1. Fly over AWS (and why that's fine / the joke).
  2. SQLite over Postgres for this dataset.
  3. Print-CSS PDF over server-side rendering.
  4. tRPC for a tiny app (mirroring their stack on purpose).

---

## Edge Cases & Error Handling

**Authoritative.** Implementers and planners must cross-check every code sketch above against this table; on any contradiction, **this table wins**.

| Scenario | Required behavior |
|----------|-------------------|
| Contact form: invalid input (bad email, empty/over-long fields) | Reject at zod layer; return a typed field-level error; show inline validation messages; no DB write, no email. Length caps enforced (e.g. name ≤ 120, message ≤ 5000). |
| Contact form: honeypot field filled (bot) | Silently accept on the client (return `{ ok: true }`) but **do not** store or email. Never reveal the honeypot's purpose. |
| Contact form: rate limit exceeded for an IP | Reject with a friendly "please try again shortly" message; no DB write, no email. Limit window/threshold defined in config (e.g. N per X minutes). |
| Contact form: DB insert succeeds but Resend email fails | **Message is still persisted** (DB write happens first). Email failure is logged server-side; the user still sees success. Mario can recover the message from the DB. |
| Contact form: DB insert fails | Return a generic error to the user ("couldn't send right now"); log server-side; do not attempt the email. |
| Contact form: missing/unset `RESEND_API_KEY` (e.g. before secret is configured) | Gracefully degrade to **store-only**: persist the message, skip email, log a warning at startup and on send. App must not crash. |
| Analytics `track` call fails or DB unavailable | Fail silently (fire-and-forget). Never block render, never surface an error to the visitor. |
| First request on a brand-new/empty Fly volume | Migrations run on startup/release so tables exist before first query; if a query hits a missing table, surface a clear server log, not a white-screen crash. |
| Resume data file has a missing required field or malformed date | Caught by the Vitest data-integrity test in CI (fail the build). At runtime, components must not crash on optional missing fields (render nothing / graceful fallback). |
| Photo asset missing | Render a tasteful placeholder/initials avatar; do not break layout or PDF. |
| PDF via `window.print()`: output varies by browser | Accepted tradeoff (documented in ADR). Print CSS must hide nav/tabs/buttons/dark-mode chrome and render a clean single-purpose CV. Test in Chrome at minimum. |
| Dark mode active when printing | Print CSS forces light/print-appropriate colors regardless of theme, so the PDF is always legible. |
| `prefers-reduced-motion` set | Disable/curtail Framer Motion scroll reveals and tab transitions; content remains fully visible and usable. |
| Direct deep-link to `/cover-letter` or `/play` (no prior nav) | Route renders correctly standalone (SSR); tab bar reflects active route. |
| Unknown route (`/anything-else`) | Render a branded 404 that stays on-theme and offers a link back to the Resume tab. |
| JavaScript disabled / SSR-only view | Core content (resume text, letter text) is readable. Interactive niceties (form submit, animations, print button affordance, dark toggle) may be degraded; content is not gated behind JS. |
| Play tab while game is deferred | Always shows the "Coming soon" placeholder; no leaderboard, no game routes, no unused DB tables. |

---

## Constraints & Invariants

- **Single source of truth for content:** resume renders only from `resume.ts`; cover letter only from `cover-letter.ts`. No hard-coded content in components.
- **Print output stays in sync with the live CV** (consequence of print-CSS approach) — do not introduce a separate PDF content path.
- **No `.cursor/rules`** (D19). Agent context lives in `CLAUDE.md` + `AGENTS.md` + ADRs.
- **No leaderboard table / no game logic** in this spec (D2, D14). The Play tab is a placeholder only.
- **Visitor never authenticates** — the contact form is anonymous and frictionless.
- **No cookies / no third-party analytics** (D17). Analytics is first-party, cookieless.
- **Secrets never committed** — `RESEND_API_KEY`, Fly token, etc. via Fly secrets / GH Actions secrets only.
- **Brand:** light background `#f5ecff`, purple palette; light mode is the default first impression.
- **Honesty of signal:** artifacts and ADRs reflect how Mario actually works (Claude Code), not aspirational tooling.
- **Stack mirrors Purple's application layer on purpose** (TS, Next/React, Tailwind, tRPC); deployment on Fly is intentional and acknowledged, not hidden.
- **Accessibility floor:** respect `prefers-reduced-motion`; contact form fields are labeled; color contrast adequate in both themes.

---

## Testing Strategy

**Framework:** Vitest. Scope reflects logic that exists *now* (game-scoring tests deferred with the game).

1. **Contact input schema (zod):** valid payload passes; missing/empty/over-long/invalid-email payloads fail with expected field errors; honeypot-filled payload is flagged.
2. **Sanitization:** name/message sanitization strips/escapes as intended; output is safe and length-capped.
3. **Rate-limit logic:** unit-test the limiter as a pure function/module — N requests within window pass, N+1 is rejected, window reset re-allows.
4. **Resume data integrity:** assert required fields present across `resume.ts`; dates are valid `YYYY-MM`; `end` is `'present'` or ≥ `start`; experience ordered/orderable.
5. **(Optional) cover-letter data integrity:** every section has a heading and at least one body paragraph.

**CI:** GitHub Actions runs `vitest` (and typecheck/lint) on PRs/pushes; deploy job runs only on `main` after tests pass.

**Manual verification checklist (pre-share):**
- Print-to-PDF in Chrome produces a clean, single-purpose CV (nav/toggle/buttons hidden, light colors).
- Dark-mode toggle persists across reloads; first visit honors system preference.
- OG image renders correctly when the URL is pasted into Slack/LinkedIn.
- Contact form: happy path stores + emails; honeypot path silently no-ops; email-down path still persists.
- All three tabs deep-link and render standalone; 404 is on-brand.
- `prefers-reduced-motion` disables heavy animation.

---

## Open Questions

1. **Custom domain name** — to be chosen/registered by Mario (D23). Build reads canonical URL from env, so this can be finalized late, but DNS + Resend sender verification depend on it.
2. **Real content** — CV details and cover-letter copy are Mario's to supply (D6, D7). Until then, realistic placeholders ship.
3. **Region** — `fra` vs `waw` (both near Brno); pick one at deploy time (D24).
4. **Play teaser richness (revisitable):** D3 chose a *minimal* placeholder. If Mario later wants more signal before the game exists, a richer "teaser pitch" card (concept + the 4 agents' real-ish strengths + v2 note) is a low-cost upgrade — but it's explicitly out of scope for this spec.
5. **Czech easter egg (optional):** English-only is decided (D10); a small tasteful Czech nod is left to Mario's discretion and is not a build requirement.
6. **Admin view for messages/pageviews:** this spec assumes Mario reads `contact_messages` and `pageviews` via a simple query against the volume. A dedicated protected admin route is *not* in scope; flag if desired later.
7. **Agent strength mapping** (for the future game): the interview confirmed a "real-ish, tongue-in-cheek" mapping (CodeRabbit→PR review, Devin→autonomous multi-file, Claude Code→refactor/tests/general, Cursor→in-editor quick edits). Recorded here for the future game spec; not used in this build.
