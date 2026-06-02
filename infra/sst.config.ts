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
      link: [groqKey],
      environment: {
        GROQ_API_KEY: groqKey.value,
        ALLOWED_ORIGINS: origins.join(","),
      },
      url: {
        cors: {
          allowOrigins: origins,
          allowMethods: ["POST", "OPTIONS"],
          allowHeaders: ["Content-Type"],
        },
        invokeMode: "RESPONSE_STREAM",
      },
    });

    return { agentUrl: agent.url };
  },
});
