import { AppError, errorResponse } from "@/server/errors";
import { getServiceQueuePreview } from "@/server/wait-time";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const serviceId = Number((await params).serviceId);
    if (!Number.isInteger(serviceId)) {
      throw new AppError("Invalid service id.");
    }
    return Response.json(getServiceQueuePreview(serviceId));
  } catch (error) {
    return errorResponse(error);
  }
}
