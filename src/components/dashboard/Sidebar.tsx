import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import type { Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string; icon: string }[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "My learning", icon: "grid" },
    { href: "/courses", label: "Browse courses", icon: "search" },
  ],
  INSTRUCTOR: [
    { href: "/dashboard/instructor", label: "My courses", icon: "grid" },
    { href: "/dashboard/instructor/courses/new", label: "New course", icon: "plus" },
    { href: "/courses", label: "View catalog", icon: "search" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: "grid" },
    { href: "/dashboard/admin/users", label: "Users", icon: "users" },
    { href: "/dashboard/admin/courses", label: "Courses", icon: "book" },
  ],
};

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <path
      d="M3 3h4.5v4.5H3V3Zm6.5 0H14v4.5H9.5V3ZM3 9.5h4.5V14H3V9.5Zm6.5 0H14V14H9.5V9.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  plus: <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />,
  users: (
    <>
      <circle cx="6" cy="6" r="2.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 14c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.5" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10.5 9.5c1.9.2 3 1.5 3 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  book: (
    <path
      d="M3 3.5h4a2 2 0 0 1 2 2V13a1.6 1.6 0 0 0-1.6-1.6H3V3.5Zm10 0H9a2 2 0 0 0-2 2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  ),
};

export function Sidebar({ role, name, email }: { role: Role; name: string; email: string }) {
  const items = NAV[role];
  const roleLabel = role === "STUDENT" ? "Student" : role === "INSTRUCTOR" ? "Instructor" : "Admin";

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-border-soft bg-surface h-screen sticky top-0">
      <Link href="/" className="flex items-center gap-2 px-5 h-16 border-b border-border-soft">
        <Logo />
        <span className="font-display text-lg">Ridgeline</span>
      </Link>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none">
              {ICONS[item.icon]}
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border-soft">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
          <div className="h-8 w-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-medium shrink-0">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ink truncate">{name}</p>
            <p className="text-xs text-ink-faint truncate">{roleLabel}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-2.5 mt-1">
          <span className="text-xs text-ink-faint truncate">{email}</span>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
