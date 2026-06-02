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

    // D16: production allows only the Fly domain; dev/staging also allows the
    // local dev origin so a browser pointed at a real Lambda URL is not CORS-blocked.
    const origins =
      $app.stage === "prod"
        ? ["https://mario-portfolio.fly.dev"]
        : ["https://mario-portfolio.fly.dev", "http://localhost:3000"];

    const agent = new sst.aws.Function("AgentHandler", {
      handler: "packages/functions/src/agent.handler",
      runtime: "nodejs20.x",
      timeout: "30 seconds",
      memory: "256 MB",
      // Enable Lambda response streaming. SST derives the Function URL invokeMode
      // from this (streaming ? RESPONSE_STREAM : BUFFERED) — there is no
      // `url.invokeMode` property, so this top-level flag is the only switch.
      streaming: true,
      link: [groqKey],
      environment: {
        GROQ_API_KEY: groqKey.value,
        ALLOWED_ORIGINS: origins.join(","),
        // Prod requires a matching browser Origin (rejects curl/no-origin abuse);
        // dev/staging stays permissive so local curl and tests still work (D2/E2).
        REQUIRE_ORIGIN: $app.stage === "prod" ? "true" : "false",
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
