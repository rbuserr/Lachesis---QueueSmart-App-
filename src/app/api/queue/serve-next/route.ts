import { errorResponse } from "@/server/errors";
import { serveNext } from "@/server/queue";

export async function POST() {
  try {
    // TODO(authentication-module): require an administrator session.
    return Response.json({ entry: await serveNext() });
  } catch (error) {
    return errorResponse(error);
  }
}
