import { NextRequest, NextResponse } from "next/server";
import { courseSchema } from "@/lib/validators";
import { deleteCourse, getCourseById, updateCourse } from "@/lib/repos/courses";
import { getCourseTree } from "@/lib/course-tree";
import { requireSession, handleApiError, ApiError } from "@/lib/api-auth";
import { getSession } from "@/lib/session";
import { isEnrolled } from "@/lib/repos/enrollments";

async function assertOwnerOrAdmin(courseId: string, userId: string, role: string) {
  const course = await getCourseById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  if (role !== "ADMIN" && course.instructor_id !== userId) {
    throw new ApiError(403, "You don't own this course");
  }
  return course;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const session = await getSession();
    const isStudent = session?.role === "STUDENT";
    const tree = await getCourseTree(courseId, isStudent ? session.sub : undefined);
    if (!tree) throw new ApiError(404, "Course not found");

    if (!tree.published) {
      if (!session) throw new ApiError(404, "Course not found");
      const isOwner = tree.instructor_id === session.sub;
      if (!isOwner && session.role !== "ADMIN") throw new ApiError(404, "Course not found");
    }

    const enrolled = isStudent ? await isEnrolled(session.sub, courseId) : false;
    return NextResponse.json({ course: tree, enrolled });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertOwnerOrAdmin(courseId, session.sub, session.role);

    const body = await request.json().catch(() => null);
    const parsed = courseSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const publishedRaw = body && typeof body === "object" ? (body as Record<string, unknown>).published : undefined;
    const update: Parameters<typeof updateCourse>[1] = { ...parsed.data };
    if (typeof publishedRaw === "boolean") update.published = publishedRaw;

    const course = await updateCourse(courseId, update);
    return NextResponse.json({ course });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    await assertOwnerOrAdmin(courseId, session.sub, session.role);
    await deleteCourse(courseId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
