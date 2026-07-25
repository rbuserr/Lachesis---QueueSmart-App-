import { completeCurrentService } from "@/server/queue";

export async function POST() {
  // TODO(authentication-module): require an administrator session.

  // HISTORY MODULE (Section 2 - David)
  // completeCurrentService validates and stores the completed queue record.
  return Response.json({ entry: await completeCurrentService() });
}
