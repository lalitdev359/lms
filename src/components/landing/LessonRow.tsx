import Link from "next/link";
import clsx from "clsx";

export function LessonRow({
  courseSlug,
  lessonId,
  title,
  durationMinutes,
  completed,
  locked,
  active,
}: {
  courseSlug: string;
  lessonId: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  locked: boolean;
  active?: boolean;
}) {
  const content = (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors",
        active ? "bg-accent-soft" : "hover:bg-surface-2",
        locked && "opacity-60"
      )}
    >
      <span
        className={clsx(
          "h-5 w-5 rounded-full flex items-center justify-center text-[11px] shrink-0",
          completed ? "bg-success/20 text-success" : "border border-ink-faint/50"
        )}
      >
        {completed ? "✓" : ""}
      </span>
      <span className={clsx("text-sm flex-1", active ? "text-ink font-medium" : "text-ink")}>{title}</span>
      <span className="text-xs text-ink-faint shrink-0">{durationMinutes} min</span>
      {locked ? (
        <svg className="h-3.5 w-3.5 text-ink-faint shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ) : null}
    </div>
  );

  if (locked) {
    return <div>{content}</div>;
  }

  return <Link href={`/courses/${courseSlug}/learn/${lessonId}`}>{content}</Link>;
}
