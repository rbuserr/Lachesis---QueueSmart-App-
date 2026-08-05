import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { setQueueOpen } from "@/server/queue";

export async function PATCH(request: Request) {
  try {
    const user = await requireAdminUser();
    
    // A3 Feedback Fix: Strictly enforce authenticated administrator access
    if (user && user.role !== "admin") {
      return Response.json(
        { error: "Forbidden: Admin access required." }, 
        { status: 403 }
      );
    }

    const { isOpen } = (await request.json()) as { isOpen: boolean };
    if (typeof isOpen !== "boolean") {
      return Response.json(
        { error: "isOpen must be a boolean." },
        { status: 400 },
      );
    }
    return Response.json({ isOpen: await setQueueOpen(isOpen) });
  } catch (error) {
    return errorResponse(error);
  }
}
