import { LinkButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Primitives";

export function Hero({
  courseCount,
  studentCount,
}: {
  courseCount: number;
  studentCount: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border-soft">
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, #7C6CF6, transparent 70%)" }}
      />
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center relative">
        <div className="animate-rise-in">
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.08] tracking-tight">
            Learning that tracks
            <br />
            your progress, not your <span className="text-accent">seat time</span>.
          </h1>
          <p className="mt-5 text-base md:text-lg text-ink-muted max-w-lg">
            Ridgeline is a course platform built for hands-on technical learning —
            structured courses, real progress tracking, and dashboards suited to
            students, instructors, and admins alike.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/register" size="lg">
              Start learning — it&apos;s free
            </LinkButton>
            <LinkButton href="/courses" variant="secondary" size="lg">
              Browse courses
            </LinkButton>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm">
            <div>
              <p className="font-display text-2xl">{courseCount}+</p>
              <p className="text-ink-faint">published courses</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl">{studentCount}+</p>
              <p className="text-ink-faint">learners enrolled</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-display text-2xl">3</p>
              <p className="text-ink-faint">tailored dashboards</p>
            </div>
          </div>
        </div>

        <div className="relative animate-rise-in" style={{ animationDelay: "120ms" }}>
          <div className="rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-soft bg-surface-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-ember/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-ink-faint">Practical Machine Learning with Python</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-ink-muted">Course progress</span>
                  <span className="font-medium">68%</span>
                </div>
                <ProgressBar value={68} />
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { title: "Exploring a raw dataset", done: true },
                  { title: "Cleaning & feature engineering", done: true },
                  { title: "Choosing a baseline model", done: true },
                  { title: "Evaluating honestly", done: false },
                ].map((lesson) => (
                  <div
                    key={lesson.title}
                    className="flex items-center gap-3 rounded-lg border border-border-soft bg-surface-2 px-3.5 py-2.5"
                  >
                    <span
                      className={
                        lesson.done
                          ? "h-5 w-5 rounded-full bg-success/20 text-success flex items-center justify-center text-[11px] shrink-0"
                          : "h-5 w-5 rounded-full border border-ink-faint/50 shrink-0"
                      }
                    >
                      {lesson.done ? "✓" : ""}
                    </span>
                    <span className={lesson.done ? "text-sm text-ink-muted line-through decoration-ink-faint/60" : "text-sm text-ink"}>
                      {lesson.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3.5 py-3">
                <div>
                  <p className="text-xs text-accent/80">Up next</p>
                  <p className="text-sm font-medium text-ink">Evaluating honestly</p>
                </div>
                <span className="text-xs text-ink-muted">19 min</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 hidden sm:block rounded-xl border border-border bg-surface px-4 py-3 shadow-xl shadow-black/40">
            <p className="text-xs text-ink-faint">Instructor view</p>
            <p className="text-sm font-medium mt-0.5">142 students enrolled</p>
          </div>
        </div>
      </div>
    </section>
  );
}
