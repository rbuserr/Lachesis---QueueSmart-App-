import { AppError, errorResponse } from "@/server/errors";
import {
  deleteService,
  getService,
  updateService,
} from "@/server/services";
import type { UpdateServiceInput } from "@/types/domain";

async function parseId(params: Promise<{ id: string }>): Promise<number> {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    throw new AppError("Invalid service id.");
  }
  return id;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const service = await getService(await parseId(params));
    if (!service) throw new AppError("Service not found.", 404);
    return Response.json(service);
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
    const updates = (await request.json()) as UpdateServiceInput;
    return Response.json(await updateService(await parseId(params), updates));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO(authentication-module): require an administrator session.
    await deleteService(await parseId(params));
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
