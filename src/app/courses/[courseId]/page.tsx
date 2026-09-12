import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteNavbar } from "@/components/landing/SiteNavbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { CourseCover, Badge } from "@/components/ui/Primitives";
import { LinkButton } from "@/components/ui/Button";
import { LessonRow } from "@/components/landing/LessonRow";
import { EnrollButton } from "@/components/landing/EnrollButton";
import { getCourseTree } from "@/lib/course-tree";
import { getSession } from "@/lib/session";
import { isEnrolled } from "@/lib/repos/enrollments";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getSession();
  const isStudent = session?.role === "STUDENT";

  const course = await getCourseTree(courseId, isStudent ? session.sub : undefined);
  if (!course) notFound();

  const isOwner = session?.sub === course.instructor_id;
  const canPreview = isOwner || session?.role === "ADMIN";
  if (!course.published && !canPreview) notFound();

  const enrolled = isStudent ? await isEnrolled(session.sub, courseId) : false;
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  let firstIncompleteLessonId: string | null = null;
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      if (!lesson.completed) {
        firstIncompleteLessonId = lesson.id;
        break;
      }
    }
    if (firstIncompleteLessonId) break;
  }
  const continueLessonId = firstIncompleteLessonId ?? course.modules[0]?.lessons[0]?.id ?? null;

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <div className="border-b border-border-soft">
          <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14 grid lg:grid-cols-[1fr_320px] gap-10">
            <div>
              {!course.published ? (
                <Badge tone="ember" className="mb-3">
                  Draft — only visible to you
                </Badge>
              ) : null}
              <div className="flex items-center gap-2 mb-3">
                <Badge tone="neutral">{course.category}</Badge>
                <Badge tone="accent">{course.level}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl tracking-tight">{course.title}</h1>
              <p className="mt-3 text-ink-muted max-w-2xl">{course.summary}</p>
              <p className="mt-1 text-sm text-ink-faint">
                Taught by {course.instructor_name} · {totalLessons} lessons · {course.enrollment_count} enrolled
              </p>

              {course.description ? (
                <p className="mt-6 text-sm leading-relaxed text-ink-muted max-w-2xl whitespace-pre-line">
                  {course.description}
                </p>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-24 self-start rounded-card border border-border bg-surface overflow-hidden h-fit">
              <CourseCover hue={course.cover_hue} className="h-36" />
              <div className="p-5">
                {!session ? (
                  <LinkButton href={`/login?next=/courses/${course.id}`} size="lg" className="w-full">
                    Log in to enroll
                  </LinkButton>
                ) : isOwner || session.role === "ADMIN" ? (
                  <LinkButton
                    href={session.role === "STUDENT" ? "#" : `/dashboard/instructor/courses/${course.id}`}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    Manage course
                  </LinkButton>
                ) : enrolled ? (
                  <LinkButton
                    href={continueLessonId ? `/courses/${course.id}/learn/${continueLessonId}` : "#"}
                    size="lg"
                    className="w-full"
                  >
                    Continue learning
                  </LinkButton>
                ) : session.role === "STUDENT" ? (
                  <EnrollButton courseId={course.id} />
                ) : (
                  <p className="text-sm text-ink-faint text-center">Only student accounts can enroll.</p>
                )}
                <p className="mt-3 text-xs text-ink-faint text-center">Self-paced · Free · No deadlines</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 md:px-8 py-12 md:py-16">
          <h2 className="font-display text-2xl tracking-tight mb-6">Curriculum</h2>
          <div className="max-w-2xl space-y-6">
            {course.modules.length === 0 ? (
              <p className="text-sm text-ink-muted">This course doesn&apos;t have any modules yet.</p>
            ) : (
              course.modules.map((module, i) => (
                <div key={module.id}>
                  <p className="text-xs font-medium text-ink-faint mb-2">
                    Module {i + 1} · {module.title}
                  </p>
                  <div className="rounded-card border border-border bg-surface divide-y divide-border-soft overflow-hidden">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-1">
                        <LessonRow
                          courseId={course.id}
                          lessonId={lesson.id}
                          title={lesson.title}
                          durationMinutes={lesson.duration_minutes}
                          completed={lesson.completed}
                          locked={!enrolled && !canPreview}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          {!enrolled && !canPreview && session?.role === "STUDENT" ? (
            <p className="mt-6 text-sm text-ink-faint max-w-2xl">
              Enroll to unlock every lesson and track your progress through this course.
            </p>
          ) : null}
          {!session ? (
            <p className="mt-6 text-sm text-ink-faint max-w-2xl">
              <Link href={`/login?next=/courses/${course.id}`} className="text-accent hover:text-accent/80">
                Log in
              </Link>{" "}
              to unlock the full curriculum.
            </p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
