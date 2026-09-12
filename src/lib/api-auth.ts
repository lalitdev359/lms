import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { Role, SessionPayload } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Throws ApiError(401) if signed out, or ApiError(403) if the role doesn't match. */
export async function requireSession(allowedRoles?: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Sign in to continue");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new ApiError(403, "You don't have access to do that");
  }
  return session;
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
