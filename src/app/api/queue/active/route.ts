import { requireSessionUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { buildActiveQueue } from "@/server/wait-time";

export async function GET() {
  try {
    const user = await requireSessionUser();
    
    // Added await here to prepare for the database integration in wait-time.ts
    const activeQueue = await buildActiveQueue(user.name);

    return activeQueue
      ? Response.json(activeQueue)
      : Response.json({ error: "Active queue not found." }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
