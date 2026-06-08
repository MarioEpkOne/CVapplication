/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "mario-agent",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: { aws: { region: "eu-central-1" } },
    };
  },
  async run() {
    const groqKey = new sst.Secret("GroqApiKey");
    // Shared HMAC secret for the signed-request token. Must hold the SAME value
    // as the Fly secret AGENT_SIGNING_SECRET (set via flyctl). Never NEXT_PUBLIC_*.
    const signingSecret = new sst.Secret("AgentSigningSecret");

    // D16: production allows only the Fly domain; dev/staging also allows the
    // local dev origin so a browser pointed at a real Lambda URL is not CORS-blocked.
    const origins =
      $app.stage === "prod"
        ? ["https://mario-portfolio.fly.dev"]
        : ["https://mario-portfolio.fly.dev", "http://localhost:3000"];

    // Session store for the agent's conversation history (D6).
    // DynamoDB auto-deletes items after the `expiresAt` epoch-seconds TTL.
    const sessions = new sst.aws.Dynamo("AgentSessions", {
      fields: { sessionId: "string" },
      primaryIndex: { hashKey: "sessionId" },
      ttl: "expiresAt",
    });

    const agent = new sst.aws.Function("AgentHandler", {
      handler: "packages/functions/src/agent.handler",
      runtime: "nodejs20.x",
      timeout: "30 seconds",
      memory: "256 MB",
      // Enable Lambda response streaming. SST derives the Function URL invokeMode
      // from this (streaming ? RESPONSE_STREAM : BUFFERED) — there is no
      // `url.invokeMode` property, so this top-level flag is the only switch.
      streaming: true,
      // No reserved concurrency: this AWS account's region-wide Lambda quota is
      // 10 (new-account default), and AWS rejects reserving against it —
      // reserving any amount drops the unreserved pool below its enforced
      // minimum of 10, so PutFunctionConcurrency returns a 400. That same
      // 10-execution account ceiling already caps total parallelism for this
      // function more tightly than `reserved: 5` would have (excess invocations
      // get 429-throttled), and per-attacker abuse is bounded by the DynamoDB
      // per-IP rate limiter (10 req / 60s). To add a function-scoped cap later,
      // raise the "Concurrent executions" Service Quota (eu-central-1) to
      // >= 100 + N, then re-add `concurrency: { reserved: N }`. Never use
      // `reserved: 0` to "remove" it — that throttles the function to zero.
      link: [groqKey, signingSecret, sessions],
      environment: {
        GROQ_API_KEY: groqKey.value,
        ALLOWED_ORIGINS: origins.join(","),
        // Prod requires a matching browser Origin (rejects curl/no-origin abuse);
        // dev/staging stays permissive so local curl and tests still work (D2/E2).
        REQUIRE_ORIGIN: $app.stage === "prod" ? "true" : "false",
        SESSIONS_TABLE: sessions.name,
        // Signed-token gate: shared HMAC secret + prod-only enforcement flag.
        AGENT_SIGNING_SECRET: signingSecret.value,
        REQUIRE_SIGNED_TOKEN: $app.stage === "prod" ? "true" : "false",
        // Two-axis daily budget cap (~15% under Groq free-tier 1000 RPD / 100k TPD).
        REQUESTS_PER_DAY: "800",
        TOKENS_PER_DAY: "85000",
      },
      url: {
        cors: {
          allowOrigins: origins,
          // OPTIONS is invalid here (Lambda Function URL allowMethods members must
          // be <=6 chars) and unnecessary — the Function URL answers the CORS
          // preflight automatically from this config. List only the real method.
          allowMethods: ["POST"],
          allowHeaders: ["Content-Type"],
        },
      },
    });

    return { agentUrl: agent.url };
  },
});
