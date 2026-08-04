import "server-only";

import { cookies } from "next/headers";

import {
  parseSessionUser,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import type { PublicUser } from "@/types/domain";

export async function readSessionUserServer(): Promise<PublicUser | null> {
  const jar = await cookies();
  return parseSessionUser(jar.get(SESSION_COOKIE_NAME)?.value);
}
