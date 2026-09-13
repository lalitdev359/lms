import Link from "next/link";
import clsx from "clsx";
import { SiteNavbar } from "@/components/landing/SiteNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { CourseCard } from "@/components/landing/CourseCard";
import { EmptyState } from "@/components/ui/Primitives";
import { Input } from "@/components/ui/Field";
import { listCategories, listPublishedCourses } from "@/lib/repos/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "All", q = "" } = await searchParams;
  const [courses, categories] = await Promise.all([
    listPublishedCourses({ category, search: q || undefined }),
    listCategories(),
  ]);

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-16">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Course catalog</h1>
          <p className="mt-2 text-ink-muted">{courses.length} published course{courses.length === 1 ? "" : "s"}</p>

          <form className="mt-8 flex flex-col sm:flex-row gap-3" action="/courses" method="get">
            {category !== "All" ? <input type="hidden" name="category" value={category} /> : null}
            <Input name="q" defaultValue={q} placeholder="Search courses…" className="sm:max-w-xs" />
            <button type="submit" className="hidden" />
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((cat) => (
                <Link
                  key={cat}
                  href={`/courses?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat !== "All" ? { category: cat } : {}) }).toString()}`}
                  className={clsx(
                    "rounded-full px-3.5 py-1.5 text-sm border transition-colors",
                    cat === category
                      ? "bg-accent-soft border-accent/40 text-accent"
                      : "border-border text-ink-muted hover:border-ink-faint hover:text-ink"
                  )}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </form>

          <div className="mt-10">
            {courses.length === 0 ? (
              <EmptyState
                title="No courses match that search"
                description="Try a different keyword or clear the category filter."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
