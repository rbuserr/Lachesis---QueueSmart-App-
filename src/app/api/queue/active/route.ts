import { requireSessionUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { buildActiveQueue } from "@/server/wait-time";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const activeQueue = buildActiveQueue(user.name);

    return activeQueue
      ? Response.json(activeQueue)
      : Response.json({ error: "Active queue not found." }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
