import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import type { Role } from "@/lib/types";

// Optimistic, cookie-only checks. Real authorization happens again in each
// page/route handler via getSession() + a database check where it matters —
// this just keeps signed-out or wrong-role users from ever rendering a
// dashboard shell.
const ROLE_PREFIXES: Record<string, Role> = {
  "/dashboard/student": "STUDENT",
  "/dashboard/instructor": "INSTRUCTOR",
  "/dashboard/admin": "ADMIN",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const requiredRole = Object.entries(ROLE_PREFIXES).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  if (requiredRole && session.role !== requiredRole) {
    return NextResponse.redirect(new URL(`/dashboard/${session.role.toLowerCase()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
