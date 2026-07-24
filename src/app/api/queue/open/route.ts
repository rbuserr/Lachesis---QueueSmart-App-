import { errorResponse } from "@/server/errors";
import { setQueueOpen } from "@/server/queue";

export async function PATCH(request: Request) {
  try {
    // TODO(authentication-module): require an administrator session.
    const { isOpen } = (await request.json()) as { isOpen: boolean };
    if (typeof isOpen !== "boolean") {
      return Response.json(
        { error: "isOpen must be a boolean." },
        { status: 400 }
      );
    }
    return Response.json({ isOpen: await setQueueOpen(isOpen) });
  } catch (error) {
    return errorResponse(error);
  }
}
