import { getSession } from "@/lib/session";
import { listUsers } from "@/lib/repos/users";
import { AdminUsersTable } from "@/components/dashboard/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await getSession();
  const users = await listUsers();

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-3xl">
      <h1 className="font-display text-2xl md:text-3xl tracking-tight">Users</h1>
      <p className="mt-1.5 text-ink-muted">{users.length} accounts across the platform.</p>
      <div className="mt-7">
        <AdminUsersTable users={users} currentUserId={session!.sub} />
      </div>
    </div>
  );
}
