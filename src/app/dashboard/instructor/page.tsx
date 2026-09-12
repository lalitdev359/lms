import Link from "next/link";
import { getSession } from "@/lib/session";
import { listCoursesByInstructor } from "@/lib/repos/courses";
import { countEnrollmentsForInstructor } from "@/lib/repos/enrollments";
import { StatCard, EmptyState, Badge, CourseCover } from "@/components/ui/Primitives";
import { LinkButton } from "@/components/ui/Button";

export default async function InstructorDashboardPage() {
  const session = await getSession();
  const [courses, totalStudents] = await Promise.all([
    listCoursesByInstructor(session!.sub),
    countEnrollmentsForInstructor(session!.sub),
  ]);

  const published = courses.filter((c) => c.published).length;

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight">Your courses</h1>
          <p className="mt-1.5 text-ink-muted">Manage content, track enrollment, and publish when ready.</p>
        </div>
        <LinkButton href="/dashboard/instructor/courses/new">New course</LinkButton>
      </div>

      <div className="mt-7 grid sm:grid-cols-3 gap-4">
        <StatCard label="Total courses" value={courses.length} accent />
        <StatCard label="Published" value={published} hint={`${courses.length - published} in draft`} />
        <StatCard label="Total enrollments" value={totalStudents} />
      </div>

      <div className="mt-10">
        {courses.length === 0 ? (
          <EmptyState
            title="You haven't created a course yet"
            description="Start with a title and a short summary — you can add modules and lessons afterward."
            action={<LinkButton href="/dashboard/instructor/courses/new">Create your first course</LinkButton>}
          />
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/instructor/courses/${course.id}`}
                className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 hover:border-ink-faint/40 transition-colors"
              >
                <CourseCover hue={course.cover_hue} className="h-16 w-16 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={course.published ? "success" : "ember"}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                    <Badge tone="neutral">{course.category}</Badge>
                  </div>
                  <p className="font-display text-base truncate">{course.title}</p>
                  <p className="text-sm text-ink-faint mt-0.5">
                    {course.module_count} module{course.module_count === 1 ? "" : "s"} ·{" "}
                    {course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"} ·{" "}
                    {course.enrollment_count} enrolled
                  </p>
                </div>
                <span className="text-ink-faint text-sm hidden sm:block">Manage →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
