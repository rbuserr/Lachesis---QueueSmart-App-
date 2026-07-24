import { errorResponse } from "@/server/errors";
import { getQueueSnapshot, joinQueue } from "@/server/queue";

export async function GET() {
  // TODO(authentication-module): return an admin or trader-appropriate view.
  return Response.json(await getQueueSnapshot());
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as {
      traderName: string;
      serviceId: number;
    };
    // TODO(authentication-module): derive traderName from the signed-in user.
    return Response.json(await joinQueue(input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
