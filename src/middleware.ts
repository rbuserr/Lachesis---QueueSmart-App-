import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  parseSessionUser,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const traderPrefixes = ["/dashboard", "/queue", "/history"];
const adminPrefixes = ["/admin-dashboard", "/services", "/manage-queue"];
const authPages = ["/login", "/register"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = parseSessionUser(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (authPages.includes(pathname)) {
    if (!user) {
      return NextResponse.next();
    }

    const destination =
      user.role === "admin" ? "/admin-dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (matchesPrefix(pathname, adminPrefixes)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, traderPrefixes)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/queue/:path*",
    "/history/:path*",
    "/admin-dashboard/:path*",
    "/services/:path*",
    "/manage-queue/:path*",
    "/login",
    "/register",
  ],
};
