import { signAgentToken } from "@/lib/agent-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const secret = process.env.AGENT_SIGNING_SECRET;
  if (!secret) return Response.json({ token: null });
  return Response.json({ token: signAgentToken(secret) });
}
