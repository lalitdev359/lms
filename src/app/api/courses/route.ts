import { NextRequest, NextResponse } from "next/server";
import { courseSchema } from "@/lib/validators";
import { createCourse, listCoursesByInstructor, listPublishedCourses } from "@/lib/repos/courses";
import { requireSession, handleApiError } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const mine = request.nextUrl.searchParams.get("mine");

    if (mine) {
      const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
      const courses = await listCoursesByInstructor(session.sub);
      return NextResponse.json({ courses });
    }

    const category = request.nextUrl.searchParams.get("category") ?? undefined;
    const search = request.nextUrl.searchParams.get("q") ?? undefined;
    const courses = await listPublishedCourses({ category, search });
    return NextResponse.json({ courses });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(["INSTRUCTOR", "ADMIN"]);
    const body = await request.json().catch(() => null);
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const course = await createCourse({ instructorId: session.sub, ...parsed.data });
    return NextResponse.json({ course }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
