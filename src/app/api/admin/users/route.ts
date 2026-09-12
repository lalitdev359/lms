import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteUser, listUsers, updateUserRole } from "@/lib/repos/users";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

const patchSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
    const users = await listUsers();
    return NextResponse.json({ users });
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
