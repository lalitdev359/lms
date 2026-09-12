import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { createUser, findUserByEmail } from "@/lib/repos/users";
import { hashPassword } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, role } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash, role });

  await createSessionCookie({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return NextResponse.json({ user });
}
