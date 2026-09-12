import Link from "next/link";
import { getSession } from "@/lib/session";
import { listEnrollmentsForStudent } from "@/lib/repos/enrollments";
import { StatCard, EmptyState, ProgressBar, Badge, CourseCover } from "@/components/ui/Primitives";
import { LinkButton } from "@/components/ui/Button";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const enrollments = await listEnrollmentsForStudent(session!.sub);

  const totalLessonsDone = enrollments.reduce((sum, e) => sum + e.completed_lessons, 0);
  const coursesCompleted = enrollments.filter((e) => e.total_lessons > 0 && e.completed_lessons === e.total_lessons).length;
  const inProgress = enrollments.filter((e) => e.completed_lessons > 0 && e.completed_lessons < e.total_lessons).length;

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-5xl">
      <h1 className="font-display text-2xl md:text-3xl tracking-tight">Welcome back, {session!.name.split(" ")[0]}</h1>
      <p className="mt-1.5 text-ink-muted">Here&apos;s where you left off.</p>

      <div className="mt-7 grid sm:grid-cols-3 gap-4">
        <StatCard label="Enrolled courses" value={enrollments.length} accent />
        <StatCard label="In progress" value={inProgress} />
        <StatCard label="Lessons completed" value={totalLessonsDone} hint={`${coursesCompleted} course${coursesCompleted === 1 ? "" : "s"} finished`} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg mb-4">Your courses</h2>
        {enrollments.length === 0 ? (
          <EmptyState
            title="You haven't enrolled in anything yet"
            description="Browse the catalog and enroll in a course to start tracking your progress."
            action={<LinkButton href="/courses">Browse courses</LinkButton>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {enrollments.map((e) => {
              const pct = e.total_lessons ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0;
              const done = e.total_lessons > 0 && e.completed_lessons === e.total_lessons;
              return (
                <Link
                  key={e.id}
                  href={`/courses/${e.course_id}`}
                  className="flex gap-4 rounded-card border border-border bg-surface p-4 hover:border-ink-faint/40 transition-colors"
                >
                  <CourseCover hue={e.cover_hue} className="h-20 w-20 rounded-lg shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge tone="neutral">{e.category}</Badge>
                      {done ? <Badge tone="success">Completed</Badge> : null}
                    </div>
                    <p className="font-display text-sm leading-snug truncate">{e.title}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{e.instructor_name}</p>
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-ink-muted">
                          {e.completed_lessons}/{e.total_lessons} lessons
                        </span>
                        <span className="text-ink-faint">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} tone={done ? "success" : "accent"} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
