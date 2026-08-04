"use client";

import { clearSessionUserClient } from "@/lib/auth/session";

export async function logoutClient(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearSessionUserClient();
    window.location.href = "/login";
  }
}
