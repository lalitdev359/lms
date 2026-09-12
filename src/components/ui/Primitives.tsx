import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("bg-surface border border-border rounded-card", className)}>{children}</div>
  );
}

const badgeTones = {
  neutral: "bg-surface-3 text-ink-muted",
  accent: "bg-accent-soft text-accent",
  ember: "bg-ember-soft text-ember",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof badgeTones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "success";
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx("h-1.5 w-full rounded-full bg-surface-3 overflow-hidden", className)}>
      <div
        className={clsx("h-full rounded-full transition-all duration-500", tone === "success" ? "bg-success" : "bg-accent")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-card">
      <p className="font-display text-lg text-ink">{title}</p>
      {description ? <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className={clsx("p-5 border-l-2", accent ? "border-l-accent" : "border-l-border")}>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="font-display text-2xl md:text-3xl mt-1.5 text-ink">{value}</p>
      {hint ? <p className="text-xs text-ink-faint mt-1.5">{hint}</p> : null}
    </Card>
  );
}

/** Deterministic gradient "cover" for a course card, derived from a hue value stored per-course. */
export function CourseCover({ hue, className }: { hue: number; className?: string }) {
  return (
    <div
      className={clsx("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 18%), hsl(${(hue + 40) % 360} 45% 10%))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(${hue} 70% 55% / 0.35), transparent 55%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id={`grid-${hue}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${hue})`} />
      </svg>
    </div>
  );
}
