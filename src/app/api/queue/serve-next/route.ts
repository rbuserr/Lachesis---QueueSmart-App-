import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { serveNext } from "@/server/queue";

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

    return Response.json({ entry: await serveNext() });
  } catch (error) {
    return errorResponse(error);
  }
}
