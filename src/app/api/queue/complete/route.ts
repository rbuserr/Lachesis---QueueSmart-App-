import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { completeCurrentService } from "@/server/queue";

export async function POST() {
  try {
    await requireAdminUser();
    return Response.json({ entry: await completeCurrentService() });
  } catch (error) {
    return errorResponse(error);
  }
}
