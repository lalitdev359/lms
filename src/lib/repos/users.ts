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

export interface UserWithStats extends PublicUser {
  course_count: number;
  enrollment_count: number;
  completed_lessons_count: number;
}

/** Users plus role-relevant activity counts, for the admin users page. */
export async function listUsersWithStats(): Promise<UserWithStats[]> {
  return query<UserWithStats>(
    `SELECT
       u.id, u.name, u.email, u.role, u.title, u.avatar_hue, u.created_at,
       COALESCE(courses.count, 0)::int AS course_count,
       COALESCE(enrollments.count, 0)::int AS enrollment_count,
       COALESCE(completions.count, 0)::int AS completed_lessons_count
     FROM users u
     LEFT JOIN (
       SELECT instructor_id, COUNT(*) AS count FROM courses GROUP BY instructor_id
     ) courses ON courses.instructor_id = u.id
     LEFT JOIN (
       SELECT student_id, COUNT(*) AS count FROM enrollments GROUP BY student_id
     ) enrollments ON enrollments.student_id = u.id
     LEFT JOIN (
       SELECT student_id, COUNT(*) AS count FROM lesson_progress WHERE completed = true GROUP BY student_id
     ) completions ON completions.student_id = u.id
     ORDER BY u.created_at DESC`
  );
}

export async function countNewUsersSince(date: Date): Promise<number> {
  const row = await queryOne<{ count: string }>("SELECT COUNT(*)::text AS count FROM users WHERE created_at >= $1", [
    date,
  ]);
  return Number(row?.count ?? 0);
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
