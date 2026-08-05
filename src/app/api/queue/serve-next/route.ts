import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { serveNext } from "@/server/queue";

export async function POST() {
  try {
    await requireAdminUser();
    return Response.json({ entry: await serveNext() });
  } catch (error) {
    return errorResponse(error);
  }
}
