import "server-only";

import { readSessionUserServer } from "@/lib/auth/session.server";
import { AppError } from "@/server/errors";
import type { PublicUser } from "@/types/domain";

export async function requireSessionUser(): Promise<PublicUser> {
  const user = await readSessionUserServer();
  if (!user) {
    throw new AppError("Authentication required.", 401);
  }
  return user;
}

export async function requireAdminUser(): Promise<PublicUser> {
  const user = await requireSessionUser();
  if (user.role !== "admin") {
    throw new AppError("Administrator access required.", 403);
  }
  return user;
}
