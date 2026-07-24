import { buildActiveQueue } from "@/server/wait-time";

export async function GET(request: Request) {
  const traderName = new URL(request.url).searchParams.get("traderName")?.trim();
  // TODO(authentication-module): derive the trader identity from the session.
  if (!traderName) {
    return Response.json({ error: "Trader name is required." }, { status: 400 });
  }

  const activeQueue = buildActiveQueue(traderName);
  return activeQueue
    ? Response.json(activeQueue)
    : Response.json({ error: "Active queue not found." }, { status: 404 });
}
