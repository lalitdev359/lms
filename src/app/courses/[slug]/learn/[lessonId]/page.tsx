import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { getSession } from "@/lib/session";
import { getLessonWithCourse } from "@/lib/repos/lessons";
import { getCourseTreeBySlug } from "@/lib/course-tree";
import { isEnrolled } from "@/lib/repos/enrollments";
import { Badge, ProgressBar } from "@/components/ui/Primitives";
import { LessonRow } from "@/components/landing/LessonRow";
import { CompleteToggle } from "@/components/landing/CompleteToggle";
import { LessonVideo } from "@/components/landing/LessonVideo";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/courses/${slug}/learn/${lessonId}`);

  const isStudent = session.role === "STUDENT";
  const course = await getCourseTreeBySlug(slug, isStudent ? session.sub : undefined);
  if (!course) notFound();

  const lesson = await getLessonWithCourse(lessonId);
  if (!lesson || lesson.course_id !== course.id) notFound();

  const isOwner = course.instructor_id === session.sub;
  const canPreview = isOwner || session.role === "ADMIN";
  const enrolled = isStudent ? await isEnrolled(session.sub, course.id) : false;

  if (!enrolled && !canPreview) {
    redirect(`/courses/${slug}`);
  }

  const flatLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = flatLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const completedCount = flatLessons.filter((l) => l.completed).length;
  const progressPct = flatLessons.length ? Math.round((completedCount / flatLessons.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border-soft bg-surface lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto">
        <div className="p-5 border-b border-border-soft">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Logo className="h-6 w-6" />
            <span className="font-display text-sm">Ridgeline</span>
          </Link>
          <Link href={`/courses/${course.slug}`} className="text-sm text-ink-muted hover:text-ink transition-colors">
            ← {course.title}
          </Link>
          {isStudent ? (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ink-muted">Progress</span>
                <span className="text-ink-faint">
                  {completedCount}/{flatLessons.length}
                </span>
              </div>
              <ProgressBar value={progressPct} />
            </div>
          ) : (
            <Badge tone="ember" className="mt-4">
              Preview mode
            </Badge>
          )}
        </div>

        <div className="p-3 space-y-5">
          {course.modules.map((module, i) => (
            <div key={module.id}>
              <p className="px-2 text-xs font-medium text-ink-faint mb-1.5">
                Module {i + 1} · {module.title}
              </p>
              <div className="space-y-0.5">
                {module.lessons.map((l) => (
                  <LessonRow
                    key={l.id}
                    courseSlug={course.slug}
                    lessonId={l.id}
                    title={l.title}
                    durationMinutes={l.duration_minutes}
                    completed={l.completed}
                    locked={false}
                    active={l.id === lessonId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-14">
          <p className="text-sm text-ink-faint">{lesson.module_title}</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight mt-1.5">{lesson.title}</h1>
          <p className="mt-1.5 text-sm text-ink-faint">{lesson.duration_minutes} min</p>

          {lesson.video_url ? <LessonVideo url={lesson.video_url} /> : null}

          <div className="mt-7 text-[15px] leading-relaxed text-ink-muted whitespace-pre-line">
            {lesson.content || "This lesson doesn't have written content yet."}
          </div>

          {isStudent && enrolled ? (
            <div className="mt-10 pt-6 border-t border-border-soft">
              <CompleteToggle lessonId={lesson.id} initialCompleted={currentLesson?.completed ?? false} />
            </div>
          ) : null}

          <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-border-soft">
            {prevLesson ? (
              <Link
                href={`/courses/${course.slug}/learn/${prevLesson.id}`}
                className="text-sm text-ink-muted hover:text-ink transition-colors"
              >
                ← {prevLesson.title}
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                href={`/courses/${course.slug}/learn/${nextLesson.id}`}
                className={clsx("text-sm text-accent hover:text-accent/80 transition-colors")}
              >
                {nextLesson.title} →
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`} className="text-sm text-accent hover:text-accent/80">
                Back to course overview →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
