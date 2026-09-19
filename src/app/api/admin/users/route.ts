import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminCreateUserSchema } from "@/lib/validators";
import { deleteUser, listUsersWithStats, updateUserRole, createUser, findUserByEmail } from "@/lib/repos/users";
import { hashPassword } from "@/lib/auth";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

const patchSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
    const users = await listUsersWithStats();
    return NextResponse.json({ users });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json().catch(() => null);
    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash, role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    if (parsed.data.userId === session.sub && parsed.data.role !== "ADMIN") {
      throw new ApiError(400, "You can't remove your own admin access");
    }

    const user = await updateUserRole(parsed.data.userId, parsed.data.role);
    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    if (userId === session.sub) throw new ApiError(400, "You can't delete your own account");

    await deleteUser(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
