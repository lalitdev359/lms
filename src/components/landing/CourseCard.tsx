import Link from "next/link";
import { CourseCover, Badge } from "@/components/ui/Primitives";
import type { CourseCard as CourseCardData } from "@/lib/repos/courses";

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block rounded-card border border-border bg-surface overflow-hidden transition-colors hover:border-ink-faint/40"
    >
      <CourseCover hue={course.cover_hue} className="h-32" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="neutral">{course.category}</Badge>
          <Badge tone="accent">{course.level}</Badge>
        </div>
        <h3 className="font-display text-base leading-snug group-hover:text-accent transition-colors">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-muted line-clamp-2">{course.summary}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
          <span>{course.instructor_name}</span>
          <span>
            {course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
