import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import type { Role } from "@/lib/types";

// Optimistic, cookie-only checks. Real authorization happens again in each
// page/route handler via getSession() + a database check where it matters —
// this just keeps signed-out or wrong-role users from ever rendering a
// dashboard shell.
// Admins can reach instructor routes too (course management pages live
// there) — everything else is exact-role only.
const ROLE_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/student", roles: ["STUDENT"] },
  { prefix: "/dashboard/instructor", roles: ["INSTRUCTOR", "ADMIN"] },
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
];

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

  const allowedRoles = ROLE_ACCESS.find(({ prefix }) => pathname.startsWith(prefix))?.roles;

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return NextResponse.redirect(new URL(`/dashboard/${session.role.toLowerCase()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
