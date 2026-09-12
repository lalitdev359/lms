import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enrollStudent, listEnrollmentsForStudent } from "@/lib/repos/enrollments";
import { getCourseById } from "@/lib/repos/courses";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";

const bodySchema = z.object({ courseId: z.string().uuid() });

export async function GET() {
  try {
    const session = await requireSession(["STUDENT"]);
    const enrollments = await listEnrollmentsForStudent(session.sub);
    return NextResponse.json({ enrollments });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(["STUDENT"]);
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const course = await getCourseById(parsed.data.courseId);
    if (!course || !course.published) throw new ApiError(404, "Course not found");

    const enrollment = await enrollStudent(session.sub, course.id);
    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
