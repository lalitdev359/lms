import Link from "next/link";
import { countUsersByRole, listUsers } from "@/lib/repos/users";
import { listAllCourses } from "@/lib/repos/courses";
import { query } from "@/lib/db";
import { StatCard, Badge } from "@/components/ui/Primitives";

export default async function AdminDashboardPage() {
  const [userCounts, courses, users] = await Promise.all([countUsersByRole(), listAllCourses(), listUsers()]);
  const [{ count: enrollmentCount }] = await query<{ count: string }>("SELECT COUNT(*)::text AS count FROM enrollments");
  const [{ count: completionCount }] = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM lesson_progress WHERE completed = true"
  );

  const published = courses.filter((c) => c.published).length;
  const recentUsers = users.slice(0, 5);

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-5xl">
      <h1 className="font-display text-2xl md:text-3xl tracking-tight">Platform overview</h1>
      <p className="mt-1.5 text-ink-muted">Everything happening across Ridgeline right now.</p>

      <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={users.length} accent />
        <StatCard label="Courses" value={courses.length} hint={`${published} published`} />
        <StatCard label="Enrollments" value={Number(enrollmentCount)} />
        <StatCard label="Lessons completed" value={Number(completionCount)} />
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg">User breakdown</h2>
            <Link href="/dashboard/admin/users" className="text-sm text-accent hover:text-accent/80">
              Manage users →
            </Link>
          </div>
          <div className="rounded-card border border-border bg-surface divide-y divide-border-soft">
            {(["STUDENT", "INSTRUCTOR", "ADMIN"] as const).map((role) => (
              <div key={role} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm capitalize">{role.toLowerCase()}s</span>
                <span className="text-sm font-display">{userCounts[role]}</span>
              </div>
            ))}
          </div>

          <h3 className="font-display text-sm mt-6 mb-2 text-ink-muted">Recently joined</h3>
          <div className="rounded-card border border-border bg-surface divide-y divide-border-soft">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm truncate">{u.name}</p>
                  <p className="text-xs text-ink-faint truncate">{u.email}</p>
                </div>
                <Badge tone="neutral">{u.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg">Courses</h2>
            <Link href="/dashboard/admin/courses" className="text-sm text-accent hover:text-accent/80">
              View all →
            </Link>
          </div>
          <div className="rounded-card border border-border bg-surface divide-y divide-border-soft">
            {courses.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                <div className="min-w-0">
                  <p className="text-sm truncate">{c.title}</p>
                  <p className="text-xs text-ink-faint truncate">{c.instructor_name}</p>
                </div>
                <Badge tone={c.published ? "success" : "ember"}>{c.published ? "Live" : "Draft"}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
