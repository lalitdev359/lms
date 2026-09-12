import Link from "next/link";
import { listPublishedCourses } from "@/lib/repos/courses";
import { CourseCard } from "@/components/landing/CourseCard";

export async function FeaturedCourses() {
  const courses = (await listPublishedCourses()).slice(0, 3);
  if (courses.length === 0) return null;

  return (
    <section className="border-b border-border-soft">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">Start with a course</h2>
            <p className="mt-3 text-ink-muted">A sample of what&apos;s live on the platform right now.</p>
          </div>
          <Link href="/courses" className="text-sm text-accent hover:text-accent/80 transition-colors">
            View all courses
          </Link>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
