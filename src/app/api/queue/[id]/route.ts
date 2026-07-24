import { AppError, errorResponse } from "@/server/errors";
import { leaveQueue, moveQueueEntry } from "@/server/queue";

async function parseId(params: Promise<{ id: string }>): Promise<number> {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) throw new AppError("Invalid queue entry id.");
  return id;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO(authentication-module): allow the owning trader or an administrator.
    await leaveQueue(await parseId(params));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO(authentication-module): require an administrator session.
    const { direction } = (await request.json()) as {
      direction: "up" | "down";
    };
    if (direction !== "up" && direction !== "down") {
      throw new AppError("Direction must be up or down.");
    }
    await moveQueueEntry(await parseId(params), direction);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
