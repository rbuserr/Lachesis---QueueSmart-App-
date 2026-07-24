import { completeCurrentService } from "@/server/queue";

export async function POST() {
  // TODO(authentication-module): require an administrator session.
  return Response.json({ entry: await completeCurrentService() });
}
