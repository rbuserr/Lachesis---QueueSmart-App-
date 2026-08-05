import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { completeCurrentService } from "@/server/queue";

export async function POST() {
  try {
    const user = await requireAdminUser();
    
    // A3 Feedback Fix: Strictly enforce authenticated administrator access
    if (user && user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: Admin access required." }, 
        { status: 403 }
      );
    }

    return Response.json({ entry: await completeCurrentService() });
  } catch (error) {
    return errorResponse(error);
  }
}