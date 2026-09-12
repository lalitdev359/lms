import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLessonWithCourse } from "@/lib/repos/lessons";
import { isEnrolled } from "@/lib/repos/enrollments";
import { setLessonProgress } from "@/lib/repos/progress";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

const bodySchema = z.object({ completed: z.boolean() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const session = await requireSession(["STUDENT"]);

    const lesson = await getLessonWithCourse(lessonId);
    if (!lesson) throw new ApiError(404, "Lesson not found");

    const enrolled = await isEnrolled(session.sub, lesson.course_id);
    if (!enrolled) throw new ApiError(403, "Enroll in this course to track progress");

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const progress = await setLessonProgress(session.sub, lessonId, parsed.data.completed);
    return NextResponse.json({ progress });
  } catch (err) {
    return handleApiError(err);
  }
}
