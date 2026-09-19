"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatCard, Card, Badge } from "@/components/ui/Primitives";
import { MiniBarChart, HorizontalBarList } from "@/components/ui/Charts";
import type { AdminInsights } from "@/lib/admin-insights";

const POLL_INTERVAL_MS = 15_000;

const ACTIVITY_ICON: Record<AdminInsights["recentActivity"][number]["type"], string> = {
  signup: "👤",
  enrollment: "📘",
  completion: "✅",
  published: "🚀",
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

export function AdminOverviewClient({ initial }: { initial: AdminInsights }) {
  const [data, setData] = useState(initial);
  const [live, setLive] = useState(true);
  const [, forceTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const next: AdminInsights = await res.json();
        setData(next);
        setLive(true);
      } catch {
        setLive(false);
      }
    }

    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    // Keep the "Xs ago" labels moving between polls too.
    const tickTimer = setInterval(() => forceTick((n) => n + 1), 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(tickTimer);
    };
  }, []);

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight">Platform overview</h1>
          <p className="mt-1.5 text-ink-muted">Everything happening across Ridgeline right now.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-success animate-pulse" : "bg-danger"}`} />
          {live ? "Live" : "Reconnecting…"} · updated {formatRelativeTime(data.generatedAt)}
        </div>
      </div>

      <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total users" value={data.users.total} hint={`+${data.users.newLast7Days} in the last 7 days`} accent />
        <StatCard
          label="Courses"
          value={data.courses.total}
          hint={`${data.courses.published} published · ${data.courses.draft} draft`}
        />
        <StatCard
          label="Enrollments"
          value={data.enrollments.total}
          hint={`+${data.enrollments.newLast7Days} in the last 7 days`}
        />
        <StatCard
          label="Lessons completed"
          value={data.lessons.completed}
          hint={`${data.lessons.total} lessons in the catalog`}
        />
        <StatCard
          label="Completion rate"
          value={`${data.lessons.completionRate}%`}
          hint="Avg. of enrolled course content finished"
        />
        <StatCard
          label="Instructors"
          value={data.users.INSTRUCTOR}
          hint={`${data.users.STUDENT} students · ${data.users.ADMIN} admins`}
        />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="font-display text-base mb-4">Signups, last 14 days</h2>
          <MiniBarChart data={data.signupSeries} formatLabel={formatDayLabel} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-base mb-4">Users by role</h2>
          <HorizontalBarList
            items={[
              { label: "Students", value: data.users.STUDENT },
              { label: "Instructors", value: data.users.INSTRUCTOR },
              { label: "Admins", value: data.users.ADMIN },
            ]}
          />
        </Card>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base">Top courses</h2>
            <Link href="/dashboard/admin/courses" className="text-xs text-accent hover:text-accent/80">
              View all →
            </Link>
          </div>
          {data.topCourses.length === 0 ? (
            <p className="text-sm text-ink-muted">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topCourses.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="flex items-center gap-3 rounded-lg -mx-2 px-2 py-1.5 hover:bg-surface-2 transition-colors"
                >
                  <span className="text-xs text-ink-faint w-4 shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{c.title}</p>
                    <p className="text-xs text-ink-faint truncate">{c.instructorName}</p>
                  </div>
                  <span className="text-xs text-ink-muted shrink-0">{c.enrollmentCount} enrolled</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base mb-4">Courses by category</h2>
          {data.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-ink-muted">No courses yet.</p>
          ) : (
            <HorizontalBarList
              items={data.categoryBreakdown.map((c) => ({ label: c.category, value: c.count }))}
            />
          )}
        </Card>
      </div>

      <div className="mt-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base">Recent activity</h2>
            <Badge tone="neutral">Auto-refreshes every 15s</Badge>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing yet — activity will show up here as people use the platform.</p>
          ) : (
            <div className="divide-y divide-border-soft">
              {data.recentActivity.map((item, i) => (
                <div key={`${item.type}-${item.at}-${i}`} className="flex items-center gap-3 py-2.5">
                  <span className="text-base shrink-0" aria-hidden="true">
                    {ACTIVITY_ICON[item.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{item.description}</p>
                    <p className="text-xs text-ink-faint truncate">{item.detail}</p>
                  </div>
                  <span className="text-xs text-ink-faint shrink-0">{formatRelativeTime(item.at)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
