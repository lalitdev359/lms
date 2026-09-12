import Link from "next/link";
import { listAllCourses } from "@/lib/repos/courses";
import { Badge, CourseCover } from "@/components/ui/Primitives";

export default async function AdminCoursesPage() {
  const courses = await listAllCourses();

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-4xl">
      <h1 className="font-display text-2xl md:text-3xl tracking-tight">Courses</h1>
      <p className="mt-1.5 text-ink-muted">{courses.length} courses across every instructor.</p>

      <div className="mt-7 space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/dashboard/instructor/courses/${course.id}`}
            className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 hover:border-ink-faint/40 transition-colors"
          >
            <CourseCover hue={course.cover_hue} className="h-14 w-14 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone={course.published ? "success" : "ember"}>{course.published ? "Published" : "Draft"}</Badge>
                <Badge tone="neutral">{course.category}</Badge>
              </div>
              <p className="font-display text-base truncate">{course.title}</p>
              <p className="text-sm text-ink-faint mt-0.5">
                {course.instructor_name} · {course.lesson_count} lessons · {course.enrollment_count} enrolled
              </p>
            </div>
            <span className="text-ink-faint text-sm hidden sm:block">Manage →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
