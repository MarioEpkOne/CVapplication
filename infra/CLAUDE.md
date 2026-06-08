# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the **`infra/` workspace** — the AWS Lambda backend for the Play page's "Ask the Agent" feature. It is a **separate SST workspace, decoupled from the Next.js build** (own `package.json`, `tsconfig.json`, `vitest.config.ts`; excluded from the root `tsconfig.json`, `eslint src/`, and root `npm test`). The only runtime coupling to the frontend is the `AGENT_URL` env var. See the root `../CLAUDE.md` for the Next.js app.

---

## Commands

Run from the repo root (these `cd infra` first) or from inside `infra/`:

```bash
cd infra && npm install                  # install workspace deps (sst, vitest, aws-sdk, @types/aws-lambda)
cd infra && npm test                     # vitest run — agent, budget, token, rate-limit, session-store suites
cd infra && npm run typecheck            # tsc --noEmit -p packages/functions/tsconfig.json (resolves @shared/*)
cd infra && npx vitest run packages/functions/tests/agent.test.ts   # one suite
cd infra && npx sst deploy --stage prod  # deploy the Lambda Function URL (CI also does this on push to main)
cd infra && npx sst secret set GroqApiKey <value> --stage prod        # one-time
cd infra && npx sst secret set AgentSigningSecret <value> --stage prod # one-time (must match the Fly secret)
```

> `groq-sdk` lives ONLY in `packages/functions/package.json`, never in the root. The whole workspace is excluded from the Next build — don't add infra deps to the root.

---

## Architecture

```
packages/
├── functions/src/
│   ├── agent.handler         → Lambda entry. RESPONSE_STREAM Function URL, emits NDJSON AgentEvent lines.
│   │                           Single bounded Groq Llama 3.3 70B completion (no tools).
│   ├── token.ts              → verifyAgentToken() — HMAC signed-request gate (mirrors src/lib/agent-token.ts)
│   ├── budget.ts             → two-axis daily cost cap (requests + tokens) via atomic DynamoDB counters
│   ├── rate-limit.ts         → Layer-1 per-IP limiter: in-memory, per-warm-container, best-effort
│   ├── rate-limit-store.ts   → Layer-2 per-IP limiter: authoritative DynamoDB atomic counter (10 req/60s)
│   ├── session-store.ts      → chat-mode conversation history in DynamoDB (capped, TTL'd)
│   └── ip-hash.ts            → sha256(ip) — non-reversible key, avoids storing raw IPs at rest
└── shared/src/
    ├── bio.ts                → the agent's system-prompt facts about Mario (no tools — facts live here)
    └── events.ts             → canonical AgentEvent type (frontend mirrors it in src/lib/agent-events.ts)

sst.config.ts                 → defines AgentHandler Function + AgentSessions Dynamo table + secrets/env
```

### Request lifecycle (`agent.handler`)

Two modes via the `mode` body field: **`chat`** (stateful, history in DynamoDB) and **`pitch`** (stateless one-shot "Why hire me?"). Each request passes through, in order: **signed-token verify** (`REQUIRE_SIGNED_TOKEN=true` in prod) → **Origin check** (`REQUIRE_ORIGIN=true` in prod) → **Layer-1 in-memory rate limit** → **Layer-2 DynamoDB rate limit** → **daily budget reserve** → bounded Groq completion (`MAX_OUTPUT_TOKENS=512`, `PROMPT_MAX_CHARS=500`, `temperature: 0`, 30s timeout, retry-once on `tool_use_failed`). The bio facts live in the system prompt (`@shared/bio.ts`); there are no tools.

### Defense-in-depth, by layer

- **Signed token** (`token.ts`): stateless HMAC over a short-TTL payload. No nonce store, so a captured token is replayable within its ~60s TTL — intentional; the budget cap is the real cost backstop.
- **Rate limit, 2 layers**: Layer-1 (`rate-limit.ts`) cheaply rejects a hot loop inside a warm container but resets on cold start and isn't shared across containers. Layer-2 (`rate-limit-store.ts`) makes "10 req/60s/IP" actually hold across containers via an atomic DynamoDB counter in the `AgentSessions` table.
- **Daily budget** (`budget.ts`): two-axis cap (`REQUESTS_PER_DAY=800`, `TOKENS_PER_DAY=85000`, ~15% under the Groq free tier) via atomic DynamoDB counters with a 48h TTL. This is the true cost ceiling.

---

## Gotchas (Lambda / SST / Groq)

- **`awslambda` is a Lambda-runtime global**, not an npm import. `agent.ts` declares it and guards the `streamifyResponse` wrap with `typeof awslambda !== "undefined"` so the module is import-safe in unit tests. The Dynamo-backed stores (`session-store.ts`, `rate-limit-store.ts`, `budget.ts`) likewise construct the DynamoDB client **lazily inside the factory**, never at module top-level, for the same import-safety reason.
- **Streaming is enabled by `streaming: true` on `sst.aws.Function`, NOT `url.invokeMode`.** SST derives the Function URL `invokeMode` from `streaming` (`RESPONSE_STREAM` vs `BUFFERED`); `url.invokeMode` is not a valid property and is silently ignored. Without `streaming: true` the URL stays `BUFFERED` and only the handler's *first* `responseStream.write()` is delivered (fixed `Content-Length`) — the agent appears to emit one event then stop. Verify after deploy: `aws lambda get-function-url-config ... --query InvokeMode` must be `RESPONSE_STREAM`.
- **Groq Llama 3.3 70B requires `temperature: 0`.** At default temperature the model intermittently emits tool calls in a malformed `<function=name{...}>` text syntax, which Groq rejects with a 400 `tool_use_failed` (~4/10 failures; 0/10 at `temperature: 0`). `agent.ts` sets `temperature: 0` and retries once on `tool_use_failed`. The catch-all maps any non-429 Groq error to "could not reach its model" — check CloudWatch / reproduce locally to see the real error.
- **CORS `allowMethods` rejects members longer than 6 chars**, so `"OPTIONS"` (7) is invalid — and unnecessary, since the Function URL answers the preflight automatically from the `cors` config. List only the real method(s): `["POST"]`.
- **Reserved concurrency is intentionally NOT set on `AgentHandler`.** This account's region-wide Lambda quota (`get-account-settings → AccountLimit.ConcurrentExecutions`) is **10** (new-account default). AWS enforces `UnreservedConcurrentExecutions = AccountLimit − Σ(reserved) ≥ 10`, so reserving *any* amount → `InvalidParameterValueException` and `sst deploy` fails. The 10-execution ceiling already caps total parallelism (excess invocations 429-throttle); per-IP abuse is bounded by the Layer-2 limiter. To add a per-function cap, first raise the "Concurrent executions" Service Quota in eu-central-1 to ≥ `100 + N`, then add `concurrency: { reserved: N }` in `sst.config.ts`. **Never set `reserved: 0`** — that throttles the function to zero.
- **Deploy is automatic on push to `main`** via `.github/workflows/deploy.yml`, which deploys BOTH the Fly app and `npx sst deploy --stage prod`. There is no push-without-Lambda-deploy path via CI; to deploy out-of-band, run `cd infra && npx sst deploy --stage prod` locally.

---

## Decoupling contract with the Next.js app

Two files are **deliberately duplicated** across the boundary (the infra side is canonical) to keep the Next build independent of `infra/`:

| Lambda (canonical) | Frontend mirror | Kept in sync by |
|--------------------|-----------------|-----------------|
| `packages/shared/src/events.ts` (`AgentEvent`) | `src/lib/agent-events.ts` | `tests/agent-stream.test.ts` (root) |
| `packages/functions/src/token.ts` (`verifyAgentToken`) | `src/lib/agent-token.ts` (issuer) | shared `AGENT_SIGNING_SECRET` |

Editing either canonical file means updating its frontend mirror in the same change.

---

## Secrets / env (managed by SST in `sst.config.ts`)

| Variable | Source | Purpose |
|----------|--------|---------|
| `GROQ_API_KEY` | SST Secret `GroqApiKey` | Groq API auth. Never `NEXT_PUBLIC_*`, never committed. |
| `AGENT_SIGNING_SECRET` | SST Secret `AgentSigningSecret` | Shared HMAC key — **must equal** the Fly secret of the same name, or all prod requests 403. |
| `ALLOWED_ORIGINS` | env in `sst.config.ts` | CORS allowlist (prod: Fly domain only; dev/staging adds localhost). |
| `REQUIRE_ORIGIN` | env (prod `true`) | Reject requests without a matching browser `Origin` (blocks curl/no-origin abuse). |
| `REQUIRE_SIGNED_TOKEN` | env (prod `true`) | Enforce the signed-token gate. |
| `SESSIONS_TABLE` | env (Dynamo name) | DynamoDB table backing chat history, the Layer-2 limiter, and the budget counter. |
| `REQUESTS_PER_DAY` / `TOKENS_PER_DAY` | env (`800` / `85000`) | Two-axis daily budget cap. |

Region is `eu-central-1`; deploy uses the local IAM user `sst-deploy` (creds in `~/.aws/credentials`) or the CI `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` secrets.
