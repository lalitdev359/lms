import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { countUsersByRole } from "@/lib/repos/users";
import { requireSession, handleApiError } from "@/lib/api-auth";

export async function GET() {
  try {
    await requireSession(["ADMIN"]);

    const userCounts = await countUsersByRole();
    const [{ count: courseCount }] = await query<{ count: string }>("SELECT COUNT(*)::text AS count FROM courses");
    const [{ count: publishedCount }] = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM courses WHERE published = true"
    );
    const [{ count: enrollmentCount }] = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM enrollments"
    );
    const [{ count: completionCount }] = await query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM lesson_progress WHERE completed = true"
    );

    return NextResponse.json({
      users: userCounts,
      courses: { total: Number(courseCount), published: Number(publishedCount) },
      enrollments: Number(enrollmentCount),
      completedLessons: Number(completionCount),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
