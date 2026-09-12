import { NextRequest, NextResponse } from "next/server";
import { moduleSchema } from "@/lib/validators";
import { deleteModule, getModuleById, updateModule } from "@/lib/repos/modules";
import { getCourseById } from "@/lib/repos/courses";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

async function assertModuleOwner(moduleId: string, userId: string, role: string) {
  const courseModule = await getModuleById(moduleId);
  if (!courseModule) throw new ApiError(404, "Module not found");
  const course = await getCourseById(courseModule.course_id);
  if (!course) throw new ApiError(404, "Course not found");
  if (role !== "ADMIN" && course.instructor_id !== userId) {
    throw new ApiError(403, "You don't own this course");
  }
  return courseModule;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertModuleOwner(moduleId, session.sub, session.role);

    const body = await request.json().catch(() => null);
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const updated = await updateModule(moduleId, parsed.data.title);
    return NextResponse.json({ module: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertModuleOwner(moduleId, session.sub, session.role);
    await deleteModule(moduleId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
