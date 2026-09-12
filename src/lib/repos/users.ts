import { query, queryOne } from "@/lib/db";
import type { PublicUser, Role, User } from "@/lib/types";

const PUBLIC_COLUMNS = "id, name, email, role, title, avatar_hue, created_at";

export async function findUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  return queryOne<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Promise<PublicUser> {
  const row = await queryOne<PublicUser>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [input.name, input.email, input.passwordHash, input.role]
  );
  if (!row) throw new Error("Failed to create user");
  return row;
}

export async function listUsers(): Promise<PublicUser[]> {
  return query<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`);
}

export async function countUsersByRole(): Promise<Record<Role, number>> {
  const rows = await query<{ role: Role; count: string }>(
    "SELECT role, COUNT(*)::text AS count FROM users GROUP BY role"
  );
  const counts: Record<Role, number> = { STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 };
  for (const row of rows) counts[row.role] = Number(row.count);
  return counts;
}

export async function updateUserRole(id: string, role: Role): Promise<PublicUser | null> {
  return queryOne<PublicUser>(
    `UPDATE users SET role = $2 WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id, role]
  );
}

export async function deleteUser(id: string): Promise<void> {
  await query("DELETE FROM users WHERE id = $1", [id]);
}
