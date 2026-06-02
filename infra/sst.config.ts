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

    const agent = new sst.aws.Function("AgentHandler", {
      handler: "packages/functions/src/agent.handler",
      runtime: "nodejs20.x",
      timeout: "30 seconds",
      memory: "256 MB",
      link: [groqKey],
      environment: {
        GROQ_API_KEY: groqKey.value,
        ALLOWED_ORIGINS: "https://mario-portfolio.fly.dev",
      },
      url: {
        cors: {
          allowOrigins: ["https://mario-portfolio.fly.dev"],
          allowMethods: ["POST", "OPTIONS"],
          allowHeaders: ["Content-Type"],
        },
        invokeMode: "RESPONSE_STREAM",
      },
    });

    return { agentUrl: agent.url };
  },
});
