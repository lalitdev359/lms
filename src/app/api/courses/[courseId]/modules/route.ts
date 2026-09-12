import { NextRequest, NextResponse } from "next/server";
import { moduleSchema } from "@/lib/validators";
import { createModule } from "@/lib/repos/modules";
import { getCourseById } from "@/lib/repos/courses";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);

    const course = await getCourseById(courseId);
    if (!course) throw new ApiError(404, "Course not found");
    if (session.role !== "ADMIN" && course.instructor_id !== session.sub) {
      throw new ApiError(403, "You don't own this course");
    }

    const body = await request.json().catch(() => null);
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const module_ = await createModule(courseId, parsed.data.title);
    return NextResponse.json({ module: module_ }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
