import { NextRequest, NextResponse } from "next/server";
import { lessonSchema } from "@/lib/validators";
import { createLesson } from "@/lib/repos/lessons";
import { getModuleById } from "@/lib/repos/modules";
import { getCourseById } from "@/lib/repos/courses";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
  try {
    const { moduleId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);

    const courseModule = await getModuleById(moduleId);
    if (!courseModule) throw new ApiError(404, "Module not found");
    const course = await getCourseById(courseModule.course_id);
    if (!course) throw new ApiError(404, "Course not found");
    if (session.role !== "ADMIN" && course.instructor_id !== session.sub) {
      throw new ApiError(403, "You don't own this course");
    }

    const body = await request.json().catch(() => null);
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const lesson = await createLesson({
      moduleId,
      title: parsed.data.title,
      content: parsed.data.content,
      videoUrl: parsed.data.videoUrl || null,
      durationMinutes: parsed.data.durationMinutes,
    });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
