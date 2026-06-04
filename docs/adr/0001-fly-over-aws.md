# ADR 0001 — Fly.io over AWS

**Status**: Accepted  
**Date**: 2026-06-01

---

## Context

The conventional default for a containerized web app is AWS — ECS or App Runner for the container, RDS for the database, the whole stack. This app is a portfolio work sample, and the natural question was whether to follow that default or pick the platform that actually fits the workload.

The question was: do we mirror the deployment platform too, or be honest?

---

## Decision

Deploy on **Fly.io**, not AWS — and be upfront about it, with a wink.

The footer says: "AWS shop, runs on Fly." The cover letter acknowledges it. This ADR documents the choice.

---

## Rationale

### It's a better work sample, not a worse one

The goal is to demonstrate judgment, not compliance. Deploying on Fly for a personal project because it's simpler, cheaper (free tier), and better suited to the scale is *exactly* the kind of trade-off reasoning worth demonstrating. AWS for a solo portfolio project adds friction with no return.

### The framing is honest and deliberate

Pretending to be an AWS shop when the repo says otherwise would be inauthentic. The "AWS shop, runs on Fly" line is a confidence move — it says *I know what you use, I know why, and I'm comfortable explaining my different choice.*

### Technical fit for this workload

- **Single machine, single file**: The app needs one SQLite file on a Fly volume. Fly's persistent volumes + single-machine model maps perfectly to this. AWS equivalents (EFS, or RDS Postgres) add cost and complexity for no benefit.
- **Zero-config HTTPS + global anycast**: Fly gives TLS, custom domain, and proximity routing out of the box.
- **`fly.toml` is simpler than ECS task definitions** for a one-container app.
- **Region selection**: `fra` (Frankfurt) is the nearest Fly region to Brno — lower latency for the target audience than `eu-west-1` (Ireland), which is the most common AWS EU default.

### The deliberate self-awareness is the point

Knowing when a simpler tool is the right tool — even when it's not the industry default — is a real engineering skill. Knowing *why* to use Fly here, and being able to articulate it, is exactly the judgment a work sample should demonstrate.

---

## Consequences

- **Positive**: simpler infra, zero cost at this scale, shorter deployment config, honest framing.
- **Positive**: the "AWS shop, runs on Fly" joke is actually a conversation starter, not a red flag.
- **Neutral**: if AWS-specific knowledge matters to a reader, the resume and cover letter speak to that (ECS, Lambda, S3 in experience bullets).
- **Negative (mitigated)**: Fly is less mature than AWS for HA and compliance-heavy workloads — but this is a portfolio app, not a FinTech system, so those constraints don't apply here.

---

## Future

If the app grows (game, leaderboard, multi-user) and needs to run on an AWS estate, the Docker container + Drizzle migrations make that straightforward. The Fly-specific parts (`fly.toml`, volume mount) are a small surface to swap.
