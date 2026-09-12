"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Field";
import type { PublicUser, Role } from "@/lib/types";

export function AdminUsersTable({ users, currentUserId }: { users: PublicUser[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
      <div className="rounded-card border border-border bg-surface divide-y divide-border-soft overflow-hidden">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 px-4 py-3 flex-wrap sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">
                {user.name}
                {user.id === currentUserId ? <span className="text-ink-faint"> (you)</span> : null}
              </p>
              <p className="text-xs text-ink-faint truncate">{user.email}</p>
            </div>
            <Select
              value={user.role}
              disabled={busyId === user.id || user.id === currentUserId}
              onChange={(e) => changeRole(user.id, e.target.value as Role)}
              className="w-40 shrink-0"
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
        ))}
      </div>
    </div>
  );
}
