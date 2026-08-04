import type { PublicUser } from "@/types/domain";

export const SESSION_STORAGE_KEY = "currentUser";
export const SESSION_COOKIE_NAME = "queuesmart_user";

export function parseSessionUser(raw: string | null | undefined): PublicUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as PublicUser).id !== "string" ||
      typeof (parsed as PublicUser).name !== "string" ||
      typeof (parsed as PublicUser).email !== "string" ||
      ((parsed as PublicUser).role !== "user" &&
        (parsed as PublicUser).role !== "admin")
    ) {
      return null;
    }

    return parsed as PublicUser;
  } catch {
    return null;
  }
}

export function serializeSessionUser(user: PublicUser): string {
  return JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
}

/** Client-only: mirrors login page localStorage for UI / join-queue. */
export function readSessionUserClient(): PublicUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseSessionUser(localStorage.getItem(SESSION_STORAGE_KEY));
}

export function saveSessionUserClient(user: PublicUser): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, serializeSessionUser(user));
}

export function clearSessionUserClient(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
}
