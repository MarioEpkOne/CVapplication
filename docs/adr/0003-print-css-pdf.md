# ADR 0003 — Print CSS + window.print() over server-side PDF

**Status**: Accepted  
**Date**: 2026-06-01

---

## Context

The resume needs a downloadable PDF. There are two main approaches:

1. **Browser print CSS** + `window.print()` — the user invokes browser print (Ctrl+P / Cmd+P), saved as PDF.
2. **Server-side PDF generation** — a library like `react-pdf` / `@react-pdf/renderer`, or a headless Puppeteer render, generates a binary PDF server-side.

---

## Decision

Use **print CSS** + `window.print()`. No PDF library.

The "Download PDF" button calls `onClick={() => window.print()}`. Print CSS hides UI chrome and forces light colors.

---

## Rationale

### Zero dependencies

No `react-pdf`, no `puppeteer`, no additional Docker complexity. The build stays lean.

### Always in sync with the live page

Because the PDF is literally a print of the current DOM, it can never drift from the live CV. With a separate PDF renderer, any component change requires a parallel update to the PDF template. Print CSS eliminates that entire class of maintenance problem.

### The data file is the single source of truth — preserved

Both the live page and the PDF render from `src/data/resume.ts`. There is no second content path. If Mario updates a bullet point, it's in the PDF instantly.

### Good enough for the use case

A hiring manager saving a portfolio URL as PDF is fine with browser print quality. The audience is technically literate; they know how browser PDFs work. The print CSS is polished enough (light colors, hidden nav/buttons, clean typography) that the output looks intentional.

### Browser variance is a documented trade-off

Chrome produces the best output (PDF is a Chrome first-class feature). Firefox and Safari produce acceptable but slightly different output. This is acceptable for a personal portfolio site and is recorded here as a known limitation.

---

## Consequences

- **Positive**: zero deps, always-current, single source of truth maintained.
- **Positive**: `window.print()` is a progressive enhancement — the resume is fully readable without it.
- **Negative**: output quality varies by browser. Chrome is the reference.
- **Negative**: no control over headers/footers/page breaks beyond CSS.
- **Negative**: no server-generated shareable PDF URL (would require Puppeteer or a third-party service).

### Mitigations

- Print CSS explicitly hides `.no-print` elements (TabBar, ThemeToggle, buttons, AnalyticsPing).
- Print CSS forces `html { background: #fff; color: #000; }` regardless of dark mode.
- Recommend Chrome in the UI: "For best PDF output, print from Chrome."
- Test in Chrome before sharing.

---

## Future

If a persistently shareable PDF URL becomes valuable (e.g., for LinkedIn "Featured" embeds), the straightforward upgrade is a serverless Puppeteer function (Fly Machine triggered on demand, or a service like `htmlcsstoimage.com`). The data-driven architecture makes this additive — no refactor needed.
