# Fixer Log
**Date**: 2026-06-02
**Audit**: Working Logs/audit-impl--2026-06-02--16-56--security-hardening-and-quality.md
**Impl plan**: Implementation Plans/impl--2026-06-02--16-39--security-hardening-and-quality.md

## Fixes Applied
- `infra/packages/functions/tests/agent.test.ts`: Added `it("requireOrigin gates a missing Origin", ...)` block inside the existing `describe("runAgent", ...)` containing the four assertions mandated by the spec's Testing Strategy:
  - `isOriginAllowed(undefined, ALLOWED, true) === false` (E1 prod — missing origin with requireOrigin=true is rejected)
  - `isOriginAllowed(undefined, ALLOWED, false) === true` (E2 dev — missing origin with requireOrigin=false is allowed)
  - `isOriginAllowed(undefined, ALLOWED) === true` (E4 default — missing origin with default param is allowed, backward-compat)
  - `isOriginAllowed("https://evil.example", ALLOWED, true) === false` (unauthorized origin with requireOrigin=true is rejected)
  Placed after the existing "rejects unauthorized origins" test and before "rejects oversized prompts", matching the surrounding test style.

## Verification
`cd infra && npm test` → 18 passed / 3 files (17 pre-existing + 1 new test). Clean pass.

## Skipped (Not Actionable)
- E9/E10 CSP runtime check — requires a browser to verify no CSP violations; cannot be auto-fixed.
- E14 `<Reveal as="section">` renders a `<section>` — runtime DOM property; no jsdom/RTL in this project.
- E18 EN-toggle `lang === "en"` / no hydration warning — client-only effect; runtime-only.
- E1/E3 prod curl-no-origin rejection — requires `sst deploy --stage prod` + curl; deploy-time only.
- E16 byte-for-byte resume visual identity — class string matches statically; pixel identity is a rendered property.

## Skipped (Fix Failed)
(none)

## Skipped (Product Decision)
(none)

## Deferred to User
(none)
