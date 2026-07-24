import { errorResponse } from "@/server/errors";
import { createService, listServices } from "@/server/services";
import type { CreateServiceInput } from "@/types/domain";

export async function GET(request: Request) {
  const openOnly = new URL(request.url).searchParams.get("openOnly") === "true";
  return Response.json(await listServices({ openOnly }));
}

export async function POST(request: Request) {
  try {
    // TODO(authentication-module): require an administrator session.
    const input = (await request.json()) as CreateServiceInput;
    return Response.json(await createService(input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
