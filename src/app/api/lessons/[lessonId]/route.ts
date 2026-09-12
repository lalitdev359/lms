import { NextRequest, NextResponse } from "next/server";
import { lessonSchema } from "@/lib/validators";
import { deleteLesson, getLessonWithCourse, updateLesson } from "@/lib/repos/lessons";
import { getCourseById } from "@/lib/repos/courses";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

async function assertLessonOwner(lessonId: string, userId: string, role: string) {
  const lesson = await getLessonWithCourse(lessonId);
  if (!lesson) throw new ApiError(404, "Lesson not found");
  const course = await getCourseById(lesson.course_id);
  if (!course) throw new ApiError(404, "Course not found");
  if (role !== "ADMIN" && course.instructor_id !== userId) {
    throw new ApiError(403, "You don't own this course");
  }
  return lesson;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertLessonOwner(lessonId, session.sub, session.role);

    const body = await request.json().catch(() => null);
    const parsed = lessonSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const lesson = await updateLesson(lessonId, {
      title: parsed.data.title,
      content: parsed.data.content,
      videoUrl: parsed.data.videoUrl === "" ? null : parsed.data.videoUrl,
      durationMinutes: parsed.data.durationMinutes,
    });
    return NextResponse.json({ lesson });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertLessonOwner(lessonId, session.sub, session.role);
    await deleteLesson(lessonId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
