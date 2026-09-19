"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import type { Role } from "@/lib/types";
import type { UserWithStats } from "@/lib/repos/users";

const ROLE_TABS: { label: string; value: Role | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Students", value: "STUDENT" },
  { label: "Instructors", value: "INSTRUCTOR" },
  { label: "Admins", value: "ADMIN" },
];

const ROLE_TONE: Record<Role, "accent" | "success" | "ember"> = {
  STUDENT: "accent",
  INSTRUCTOR: "success",
  ADMIN: "ember",
};

function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminUsersTable({ users, currentUserId }: { users: UserWithStats[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  async function changeRole(userId: string, role: Role) {
    setBusyId(userId);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update role");
    }
    setBusyId(null);
    router.refresh();
  }

  async function removeUser(userId: string, name: string) {
    if (!confirm(`Delete ${name}'s account? This can't be undone.`)) return;
    setBusyId(userId);
    setError(null);
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete user");
    }
    setBusyId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                roleFilter === tab.value
                  ? "bg-accent-soft border-accent/40 text-accent"
                  : "border-border text-ink-muted hover:border-ink-faint hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="secondary" className="sm:ml-auto" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "New user"}
        </Button>
      </div>

      {showCreate ? (
        <CreateUserForm
          onCreated={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      ) : null}

      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}

      <p className="text-xs text-ink-faint mb-2">
        {filtered.length} of {users.length} accounts
      </p>

      <div className="rounded-card border border-border bg-surface divide-y divide-border-soft overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted text-center">No accounts match that search.</p>
        ) : (
          filtered.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3 flex-wrap sm:flex-nowrap">
              <div className="h-8 w-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-medium shrink-0">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate flex items-center gap-1.5">
                  {user.name}
                  {user.id === currentUserId ? <span className="text-ink-faint">(you)</span> : null}
                  <Badge tone={ROLE_TONE[user.role]} className="ml-1">
                    {user.role}
                  </Badge>
                </p>
                <p className="text-xs text-ink-faint truncate">
                  {user.email} · joined {formatJoinDate(user.created_at)}
                </p>
              </div>

              <div className="text-xs text-ink-muted shrink-0 w-36 text-right hidden md:block">
                {user.role === "INSTRUCTOR" ? (
                  <span>
                    {user.course_count} course{user.course_count === 1 ? "" : "s"}
                  </span>
                ) : user.role === "STUDENT" ? (
                  <span>
                    {user.enrollment_count} enrolled · {user.completed_lessons_count} done
                  </span>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </div>

              <Select
                value={user.role}
                disabled={busyId === user.id || user.id === currentUserId}
                onChange={(e) => changeRole(user.id, e.target.value as Role)}
                className="w-36 shrink-0"
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <button
                onClick={() => removeUser(user.id, user.name)}
                disabled={busyId === user.id || user.id === currentUserId}
                className="text-xs text-danger hover:text-danger/80 disabled:opacity-40 shrink-0"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to create account");
      setBusy(false);
      return;
    }
    onCreated();
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-card border border-border bg-surface p-4 space-y-4">
      <p className="text-sm font-medium">Create an account</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full name" htmlFor="new-name">
          <Input id="new-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jamie Rivera" />
        </Field>
        <Field label="Email" htmlFor="new-email">
          <Input
            id="new-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jamie@example.com"
          />
        </Field>
        <Field label="Temporary password" htmlFor="new-password" hint="At least 8 characters">
          <Input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field label="Role" htmlFor="new-role">
          <Select id="new-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </Field>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
