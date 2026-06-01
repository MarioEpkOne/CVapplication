# ADR 0004 — tRPC for a tiny app

**Status**: Accepted  
**Date**: 2026-06-01

---

## Context

The app has one backend mutation:
- `analytics.track` — pageview ping

(A `contact.submit` mutation existed earlier; the contact form was removed — see the spec in `specs/applied/`.) For a single mutation on a personal portfolio site, REST routes or simple server actions would work. tRPC is a heavier choice.

---

## Decision

Use **tRPC v11** with `createTRPCReact` + `httpBatchLink` + `superjson`. Full type-safe client-server communication, end-to-end.

---

## Rationale

### It mirrors Purple's stack — on purpose

Purple Technology uses tRPC (it's part of their application-layer stack). Using tRPC here is a deliberate signal: *I've shipped tRPC in production, not just read about it.* This is a work sample; every technology choice is an argument.

### End-to-end type safety with zero boilerplate

The `analytics.track` input type is inferred from the same Zod schema that validates on the server. No type duplication, no OpenAPI spec, no code generation step. The TypeScript compiler catches mismatches at build time.

```ts
// The type flows from server to client automatically
trpc.analytics.track.useMutation() // ← fully typed from analyticsRouter.track
```

### Structured error handling

tRPC error codes (`TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`) map cleanly to client-side conditional logic when a mutation needs to surface a friendly message.

### Batch link is free

`httpBatchLink` batches concurrent tRPC calls into a single HTTP request. Not needed for two mutations, but costs nothing and is the correct default.

### v11 gotcha (documented here and in CLAUDE.md)

tRPC v11 moved the transformer from the root client config to the link. Correct:
```ts
httpBatchLink({ url: "/api/trpc", transformer: superjson })
```
Not:
```ts
trpc.createClient({ transformer: superjson }) // v10 style — breaks in v11
```

---

## Consequences

- **Positive**: Purple sees familiar technology; demonstrates production knowledge.
- **Positive**: type-safe mutations with no extra layer.
- **Positive**: structured error codes on the client.
- **Neutral**: tRPC adds ~50KB to the client bundle (offset by superjson; acceptable for this app).
- **Neutral**: the app is "over-engineered" — but that's the explicit goal (work sample, not production minimalism).
- **Negative**: if someone unfamiliar with tRPC maintains this, they need to learn the mental model. `CLAUDE.md` and `AGENTS.md` document the gotchas.
