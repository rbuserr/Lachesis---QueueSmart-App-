import { requireSessionUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import { getQueueSnapshot, joinQueue } from "@/server/queue";

export async function GET() {
  try {
    await requireSessionUser();
    return Response.json(await getQueueSnapshot());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const input = (await request.json()) as {
      traderName?: string;
      serviceId: number;
    };

    // Traders always join as themselves; admins may set a display name for demos.
    const traderName =
      user.role === "admin" && input.traderName?.trim()
        ? input.traderName.trim()
        : user.name;

    return Response.json(
      await joinQueue({
        traderName,
        serviceId: input.serviceId,
        userId: user.role === "user" ? user.id : undefined,
      }),
      { status: 201 },
    );
    
  } catch (error) {
    return errorResponse(error);
  }
}
