import "server-only";

import { readSessionUserServer } from "@/lib/auth/session.server";

/** Display / queue name for the logged-in trader (from session cookie). */
export async function getCurrentTraderName(): Promise<string | null> {
  const user = await readSessionUserServer();
  return user?.name.trim() || null;
}
