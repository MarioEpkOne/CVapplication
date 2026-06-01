# Fixer Log
**Date**: 2026-06-01
**Audit**: Working Logs/audit-impl--2026-06-01--19-49--real-content-and-locale-toggle.md
**Impl plan**: Implementation Plans/impl--2026-06-01--19-28--real-content-and-locale-toggle.md

## Fixes Applied
- `src/lib/labels.ts` line 13: Changed `"Vážený tyme Purple LAB,"` to `"Vážený týme Purple LAB,"` — replaced plain ASCII y (U+0079) with y-acute (U+00FD) to correct the Czech vocative greeting per spec.
- `src/data/resume.ts` line 82: Changed `"dekompozice procesu"` to `"dekompozice procesů"` — replaced trailing plain u (U+0075) with u-ring (U+016F) to match spec D15 plural genitive form.
- `CLAUDE.md` line 22: Changed `(23 tests)` to `(33 tests)` — updated stale test count comment to reflect dual-locale test rewrites that expanded the suite from 23 to ~33 cases.

## Skipped (Not Actionable)
- All runtime behavior items (locale switching, rendering, localStorage persistence, hydration mismatch, print CSS, layout stability) — require browser to verify, not fixable via code edit.
- Build and test pass confirmation — pre-existing WSL native binary issue, not a code defect.
- Layout footer locale switching — deliberate impl plan decision that D12 refers only to cover letter sign-off; flagged for human confirmation.

## Skipped (Fix Failed)
(none)

## Skipped (Product Decision)
(none)

## Deferred to User
(none)
